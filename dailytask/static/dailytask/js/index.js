$(document).ready(function () {
    // 动态为添加按钮绑定点击事件
    $('body').on('click', '.btn_add_task', function () {
        var button = $(this);
        var num = parseInt(button.attr('id').split('_').pop());
        var content = $('#input_task_content_' + num).val();
        if (content != undefined && content != "") {
            if (button.html() == '增加') {
                $.post("add_task/", {'content': content}, function (data) {
                    if (data != 'fail') {
                        // 修改button显示文字，并记录该任务id号
                        button.html("修改");
                        button.attr("name", data);

                        // 为checkbox、删除button和input记录该任务id号
                        $('#checkbox_task_' + num).attr("name", data);
                        $('#btn_delete_task_' + num).attr("name", data);
                        $('#input_task_content_' + num).attr("name", data);

                        // 添加新任务行
                        next_tr = 
                        '<tr>' + 
                            '<td><input type="checkbox" id="checkbox_task_' + (num + 1) + '" class="checkbox_change_status"></input></td>' + 
                            '<td align="center"><label for="input_task_content_' + (num + 1) + '" id="label_task_' + (num + 1) + '" class="label_task">' + (num + 1) + '</label></td>' +
                            '<td><input type="text" value="" id="input_task_content_' + (num + 1) + '" class="input_task_content"></input></td>' +
                            '<td><button id="btn_add_task_' + (num + 1) + '" class="btn_add_task">增加</button></td>' +
                            '<td><button id="btn_delete_task_' + (num + 1) + '" class="btn_delete_task">删除</button></td>'
                        '</tr>';
                        $('#uncompleted_table').append(next_tr);     
                    }
                });
            } else if (button.html() == '修改') {
                $.post("update_task/", {'id': button.attr('name'), 'content': content}, function (data) {
                    if (data == 'success') {
                        alert("修改成功");
                    } else {
                        alert("修改失败");
                    }
                });
            }
        } else {
            window.location.reload(true);
        }
    });

    // 动态为删除按钮绑定点击事件
    $('body').on('click', '.btn_delete_task', function () {
        var button = $(this);
        if (button.attr('name') != undefined) {
            $.post("delete_task/", {'id': button.attr('name')}, function (data) {
                if (data == 'success') {
                    // alert("删除成功");
                    window.location.reload(true);
                } else {
                    alert("删除失败");
                }
            });
        }
    });

    // 动态为 checkbox 添加状态变化事件
    $('body').on('click', '.checkbox_change_status', function () {
        var checkbox = $(this);
        if (checkbox.is(':checked')) {
            var content = $('#input_task_content_' + checkbox.attr('id').split('_').pop()).val();
            if (content != undefined && content != '') {
                $.post("change_task_status/", {'id': checkbox.attr('name'), 'action': 'finish'}, function (data) {
                    if (data == 'success') {
                        window.location.reload(true);
                    } else {
                        alert("任务完成失败");
                    }
                });
            } else {
                checkbox.removeAttr('checked');
            }
        } else {
            $.post("change_task_status/", {'id': checkbox.attr('name'), 'action': 'unfinish'}, function (data) {
                if (data == 'success') {
                    window.location.reload(true);
                } else {
                    alert("任务重置失败");
                }
            });
        }
    });
    
    // ----------------- Cal HeatMap -----------------
    var cal = new CalHeatMap();
    var nowDate = new Date();
    var lastYearDate = new Date();
    lastYearDate.setDate(nowDate.getDate() - 335);
    
    cal.init({
    	domain: "month",
    	subDomain: "day",
    	cellSize: 9,
    	range: 12,
    	start: lastYearDate,
    	data: "http://127.0.0.1:8000/dailytask/api/get_task_statistics_calendar_data/",
    	cellRadius: 1,
    	domainGutter: 3,
    	displayLegend: true,
    	legend: [1, 2, 4, 8],
    	itemName: ["task completed", "tasks completed"],
    	tooltip: true,
    	onClick: function(date, number) {
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();

            $.post("api/get_completed_tasks_status_special_day", 
                   {'year': year, 
                    'month': month,
                    'day': day }, 
                    function (result_json) {
                        if (result_json) {
                            $("#task_statistics_detail_tasks").children(".task_statistics_detail_task").remove();
        
                            $(".dropdown_show").html(year + '-' + month + '-' + day);

                            var length = 0;
                            for (var task in result_json) {
                                length ++;
                                next_task = "<div class=\"task_statistics_detail_task\">" +
                                                result_json[task] + "<span class=\"completed_time\">" + task + "</span></div>";
                                $("#task_statistics_detail_tasks").append(next_task);
                            }
                            $("#task_statistics_detail_number").html("共完成 " + length + " 项任务");
                        }
                    });
    	},
    });
    
    $.getJSON("api/get_completed_tasks_num_last_year/", function (result_json) {
    	$('.completed_tasks_number').html(result_json.completed_tasks_num_last_year + "项");
    });
    
    $.getJSON("api/get_longest_streak_days_number/", function (result_json) {
    	$('.longest_streak_days_number').html(result_json.longest_streak_days_number + "天");
    });
    
    $.getJSON("api/get_current_streak_days_number/", function (result_json) {
    	$('.current_streak_days_number').html(result_json.current_streak_days_number + "天");
    });
    
    $.getJSON("/dailytask/api/get_last_year_to_now_date_string/", function (result_json) {
    	$('.during_date_string').each(function() {
    		$(this).html(result_json.during_date_string);
    	});
    });
    
    // ----------------- Drop Down -----------------
    function DropDown(el) {
        this.dd = el;
        this.initEvents();
    }

    DropDown.prototype = {
        initEvents : function() {
            var obj = this;

            obj.dd.on('click', function(event){
                $(this).toggleClass('active');
                event.stopPropagation();
            }); 
        }
    }
    
    var dd = new DropDown( $('#task_statistics_detail_dd') );

    $(document).click(function() {
        $('.task_statistics_detail_dd').removeClass('active');
    });
    
    $("#task_statistics_detail_dropdown li").click(function() {
    	$("#task_statistics_detail_tasks").children(".task_statistics_detail_task").remove();
    	
    	$(".dropdown_show").html($(this).children(".dropdown_link").html());
    	
    	$.getJSON("/dailytask/api/get_completed_tasks_status/" + $(this).attr('value') + "/", function (result_json) {
    		var length = 0;
	    	for (var task in result_json) {
	    		length ++;
	    		next_task = "<div class=\"task_statistics_detail_task\">" +
	    						result_json[task] + "<span class=\"completed_time\">" + task + "</span></div>";
	    		$("#task_statistics_detail_tasks").append(next_task);
	    	}
	    	$("#task_statistics_detail_number").html("共完成 " + length + " 项任务");
	    });
    });
    
    $.getJSON("/dailytask/api/get_completed_tasks_status/week/", function (result_json) {
    	var length = 0;
    	for (var task in result_json) {
    		length ++;
    		next_task = "<div class=\"task_statistics_detail_task\">" +
    						result_json[task] + "<span class=\"completed_time\">" + task + "</span></div>";
    		$("#task_statistics_detail_tasks").append(next_task);
    	}
    	$("#task_statistics_detail_number").html("共完成 " + length + " 项任务");
    });
});


