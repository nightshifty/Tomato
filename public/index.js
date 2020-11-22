//This document contains all scripts for the todo list

/**source: https://github.com/shoaibcode/Learnig-JQuery-with-AJAX/tree/Lesson-01-Adding-TodoList */
let $addTodo = $("#addTodo"); //form for adding
let $TodoItem = $(".list-group"); //<ul> cointaining ToDo list

//Template
let source = $("#todolist").html(); //handlebars script
let template = Handlebars.compile(source); 

//This function loads the saved ToDoList if logged in
function getToDolist(){
	$.getJSON("/getTodoEntrys", function(data){
		$.each (data, function(key, val){
			let newListItem = template({
				text: val.CONTENT,
				pomodoro: val.POMODOROS
			})//TODO: Also catch val.TODOID
			$TodoItem.append(newListItem);
		})
	})
}

$( document ).ready(function() {
    getToDolist();
});

$(function() {
	//Add TodoList
	$addTodo.on("submit", function(event) {
		event.preventDefault();
		
		let newPomo = $("#pomodoroEntryBox").val();
		let newTodo = $("#todoEntryBox").val();

		$addTodo.find("input").val("");//delete input-field to prevent multiple inputs

		var listItem = template({
            text: newTodo,
            pomodoro: newPomo
		});

		$TodoItem.append(listItem);
		$.post("/addTodoItem",
			{
                text: newTodo,
                pomodoro: newPomo
			});

		/*$.ajax({
			url: URL,
			method: "POST",
			data: {
                text: newTodo,
                pomodoro: newPomo,
			}
		});
		*/
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