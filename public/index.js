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
				pomodoro: val.POMODOROS,
				todoid: val.TODOID
			})
			$TodoItem.append(newListItem);
		})
	})
}

function refreshToDolist(){
	let newList = $("<ul class='list-group'></ul>");
	$.getJSON("/getTodoEntrys", function(data){
		$.each (data, function(key, val){
			let newListItem = template({
				text: val.CONTENT,
				pomodoro: val.POMODOROS,
				todoid: val.TODOID
			})
			newList.append(newListItem);
		})
	})
	$TodoItem.html(newList);//replace complete list with new one
}

$( document ).ready(function() {
	getToDolist();
	
	//todolist with scrollview
	$('#todocontainer').height();
	 $('#parentTodo').height();
	 $("#pomodorcontent").height();

	 //find out if user is authenticated:
	 $.ajax( "/auth" )
	.always(function (jqXHR) {
		if(jqXHR.status === 403){
			//user is not authorized
			console.log("user is not authorized");
			$("#todobtn").hide();
			//document.getElementById("todos").style.display = "none";
		}else{
			//user is authorized @ Larissa: Call your function with Ajax Magic from here
			console.log("user is authorized");
			$("#todos").show();
		}
	console.log(jqXHR.status);
	



});

});

$(function() {
	//Add TodoList
	$addTodo.on("submit", function(event) {
		event.preventDefault();
		let newPomo = $("#inputtodo").val();
		let newTodo = $("#inlineFormInputGroup").val();
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
			$addTodo.find("input").val("");//delete input-field to prevent multiple inputs
		refreshToDolist();
    });
    
	//Delete TodoList on click
});

function deleteButtonfunction(btn){
	let dbtn = $(btn);
	let todoID = dbtn.parent().parent().data("todoid");
	console.log("deleting item "+todoID);
	$.post("/deleteOneEntry",
	{
		todoid: todoID
	});
	dbtn.parent().parent().parent().remove();
}

