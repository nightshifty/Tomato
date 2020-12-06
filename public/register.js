$("#registerForm").on("submit", function(event) {
    event.preventDefault();
    createAjaxPostSubscribe();
});

function createAjaxPostSubscribe() {
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
    content+="You are sucessfully registered. Welcome :)"
    content +="You can <a href='/'>return and login</a> now. </div>"
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
