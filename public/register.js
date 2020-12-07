/**
 * Containig all functions relevant for registration of a new user
 */

 /**
  * onclicklistener starting the function for 
  */
$("#registerForm").on("submit", function(event) {
    event.preventDefault();
    registerNewUser();
});

/**
 * Tries registers the user with Ajax
 * Calls Success or Error function
 */
function registerNewUser() {
    const data = {
        username: $('#username')[0].value,
        password: $('#password')[0].value,
    }
    const post = $.post('/register', data);
    post.done(processSubscribeResult);
    post.fail(processSubscribeErrors);
}

/**
 * user added sucessfully – showing success message
 */
function processSubscribeResult(rows, status, xhr) {
    $('#logincard').hide();
    
    let content ="<div class='container card align-items-center'>";
    content+="<div class='alert alert-success' role='alert'>";
    content+="    <h4 class='alert-heading'>Registered!</h4>";
    content+="    <p>You are sucessfully registered.</p>";
    content+="    <p>You can <a href='/'>return and login</a> now.</p>";
    content+="</div>";
    $("body").append(content);

}

/**
 * error while adding user – showing error message
 */
function processSubscribeErrors(error, status, xhr) {
    console.log(error);
    const errorMsg = error.responseJSON.error;
    $(`<div class="alert alert-danger alert-dismissible fade show" role="alert">
    ${errorMsg}</div>`)
    .appendTo('#logincard');
}
