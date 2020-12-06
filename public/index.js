/**
 * Document containing many functions which are only used on index.html
 */

let workingOnTaskID="";
let workingOnTaskTitle="";



//Template
let source = $("#todolist").html(); //handlebars script
let template = Handlebars.compile(source);



function openTodolist() {
  document.getElementById("todos").style.height = "100%";
}

function closeTodolist() {
  document.getElementById("todos").style.height = "0%";
}



$( document ).ready(function() {
	getPomoTimeFromDB();
	$("#remainingtime").text(pomodoroTime+" : 00");
	refreshToDolist();
	
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
			$('#profileSettingsBtn').hide();
			//document.getElementById("todos").style.display = "none";
		}else{
			$("#loginArea").hide();
			console.log("user is authorized");
		}
	console.log(jqXHR.status); //TODO is undefined if not 403 – WHY?
});

});


