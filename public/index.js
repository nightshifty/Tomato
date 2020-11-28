

/**source: https://github.com/shoaibcode/Learnig-JQuery-with-AJAX/tree/Lesson-01-Adding-TodoList */
let $addTodo = $("#addTodo"); //form for adding
let $TodoItem = $(".list-group"); //<ul> cointaining ToDo list
let workingOnTaskID="";
let workingOnTaskTitle="";

//clickable ToDos:
function clickedTodoEntry(cardDiv){
	let cardDivElement = $(cardDiv);
	console.log("clicked ToDo entry");
	workingOnTaskID = cardDivElement.data("todoid");
	workingOnTaskTitle = cardDivElement.data("todotext");
	$("#todoText").text("working on: "+workingOnTaskTitle);
	$("#openbtn").text("working on: "+workingOnTaskTitle);
}

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


function openTodolist() {
  document.getElementById("todos").style.height = "100%";
}

function closeTodolist() {
  document.getElementById("todos").style.height = "0%";
}


function refreshToDolist(){
	let newList = $("<ul class='list-group'></ul>");
	console.log("request list");
	/*$.getJSON("/getTodoEntrys", function(data){
		console.log("received JSON");
		$.each (data, function(key, val){
			let newListItem = template({
				text: val.CONTENT,
				pomodoro: val.POMODOROS,
				todoid: val.TODOID
			})
			console.log("adding to newlist: "+val.CONTENT+" "+val.TODOID);
			newList.append(newListItem);
		})
	})*/
	$.getJSON("/getTodoEntrys")
  	.done(function( data ) {
	console.log("received JSON");
	$.each (data, function(key, val){
		let newListItem = template({
			text: val.CONTENT,
			pomodoro: val.POMODOROS,
			todoid: val.TODOID
		})
		console.log("adding to newlist: "+val.CONTENT+" "+val.TODOID);
		newList.append(newListItem);
  })
})
  .fail(function( jqxhr, textStatus, error ) {
    var err = textStatus + ", " + error;
    console.log( "Request Failed: " + err );
});
	//replace complete list with new one:
	let todoListParentDiv = $("#todoListParent");
	todoListParentDiv.empty();
	todoListParentDiv.append(newList);
}

$( document ).ready(function() {
	$('#timer').attr('data-timetext', pomodoroTime+" : 00");
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
			$("#logoutBtn").hide();
			//document.getElementById("todos").style.display = "none";
		}else{
			$("#loginArea").hide();
			console.log("user is authorized");
		}
	console.log(jqXHR.status); //TODO is undefined if not 403 – WHY?
});

});

$(function() {
	//Add TodoList
	$addTodo.on("submit", function(event) {
		event.preventDefault();
		let newTodo = $("#inputtodo").val();
		let newPomo = $("#inlineFormInputGroup").val();
		/*var listItem = template({
            text: newTodo,
            pomodoro: newPomo
		});*/
		//$(".list-group").append(listItem);
		$.post("/addTodoItem",
			{
				text: newTodo,
				pomodoro: newPomo
			});
			//$addTodo.find("input").val("");//delete input-field to prevent multiple inputs
		setTimeout(() => { refreshToDolist(); }, 100);//gives the server some time

		//clear inputs 
		newTodo = $("#inlineFormInputGroup").val("");
		newPomo = $("#inputtodo").val("");
    });
});

//Delete one Entry in ToDoList on click
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

