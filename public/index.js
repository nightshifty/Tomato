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



//add to list 

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




