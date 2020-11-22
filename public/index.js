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
	var todolist = $('#todocontainer').height();
	var addtodo = $('#parentTodo').height();
});

$(function() {
	//Add TodoList
	$addTodo.on("submit", function(event) {

		//validation from bootstrap
		'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
        }, false);
      });
    }, false);

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