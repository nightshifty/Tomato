/**
 * Containing scripts for the ToDo List
 */
let $addTodo = $("#addTodo"); //form for adding to 
let $TodoItem = $(".list-group"); //<ul> cointaining ToDo list

/**
 * click on ToDo entries to work on them
 */
function clickedTodoEntry(cardDiv){
	let cardDivElement = $(cardDiv).parent().parent();
	console.log("clicked ToDo entry");
	workingOnTaskID = cardDivElement.data("todoid");
	workingOnTaskTitle = cardDivElement.data("todotext");
	$("#todoText").text("working on: "+workingOnTaskTitle);
	$("#openbtn").text("working on: "+workingOnTaskTitle);
}

/**
 * refreshes ToDo List via Ajax with DB version
 * Load ToDo List of signed in users from DB
 */
function refreshToDolist(){
	let newList = $("<ul class='list-group'></ul>");
	console.log("request list");
	$.getJSON("/getTodoEntrys")
  	.done(function( data ) {
	console.log("received JSON");
	$.each (data, function(key, val){
		let newListItem = template({
			text: val.CONTENT,
			pomodoro: val.ESTIMATION,
			timespent: val.TIMESPENT,
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

/**
 * function submits new Todo data to backend using Ajax
 * After that refreshing the list from our single source of truth
 * (load todos from the database)
 */
$addTodo.on("submit", function(event) {
    event.preventDefault();
    let newTodo = $("#inputtodo").val();
    let newPomo = $("#inlineFormInputGroup").val();
    $.post("/addTodoItem",
        {
            text: newTodo,
            pomodoro: newPomo
        });
    setTimeout(() => { refreshToDolist(); }, 100);//gives the server some time

    //clear inputs 
    newTodo = $("#inlineFormInputGroup").val("");
    newPomo = $("#inputtodo").val("");
});

/**
 * Delete one Entry in ToDoList in Backend on click
 * After that refreshing the list from our single source of truth
 */
function deleteButtonfunction(btn){
	let dbtn = $(btn);
	let todoID = dbtn.parent().parent().data("todoid");
	console.log("deleting item "+todoID);
	$.post("/deleteOneEntry",
	{
		todoid: todoID
    });
    setTimeout(() => { refreshToDolist(); }, 100);//gives the server some time
}