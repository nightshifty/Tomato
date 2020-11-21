/**source: https://github.com/shoaibcode/Learnig-JQuery-with-AJAX/tree/Lesson-01-Adding-TodoList */

$(function() {
	var $addTodo = $("#addTodo");
    var $TodoItem = $(".list-group");
    

	var URL = "http://localhost:3000";

	//Template
	var source = $("#todolist").html();
	var template = Handlebars.compile(source);

	//Add TodoList
	$addTodo.on("submit", function(event) {
		event.preventDefault();

        //how to add pomodoro here???
		var newTodo = $addTodo.find("input").val();

		$addTodo.find("input").val("");

		var listItem = template({
            text: newTodo,
            pomodoro: newPomo
		});

		$TodoItem.append(listItem);

		$.ajax({
			url: URL,
			method: "POST",
			data: {
                text: newTodo,
                pomodoro: newPomo,
			}
		});
    });
    
    //Delete TodoList
	$delTodo.on("deletebtn", function(event) {
		event.preventDefault();

		var delTodo = $delTodo.find("input").val();

		$delTodo.find("input").val("");

		var listItem = template({
			text: delTodo
		});

		$TodoItem.delete(listItem);

		$.ajax({
			url: URL,
			method: "DELETE",
			data: {
				text: delTodo
			}
		});
	});
});