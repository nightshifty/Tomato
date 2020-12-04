//login validation 

$("#mainForm").validate (
    {
        rules: {
            username:{
                required: true,
            
            },
            password:{
                required: true,
            
            }
        },
        messages: {
            username: {
                required: "Please fill in a Username." 
            },
            password: {
                required: "Please fill in a Password." 
            }
        },
        submitHandler: function (form) {
            console.info("form valid, submission sent");
            form.submit();
        }
        

    }
)


//register
$("#registerForm").validate (
    {
        rules: {
            username:{
                required: true,
            
            },
            password:{
                required: true,
                minlength: 6,

            
            }
        },
        messages: {
            username: {
                required: "Please fill in a Username." 
            },
            password: {
                required: "Please fill in a Password.",
                minlength: "Minminum lenght 6 characters"
            }
        },
        
        

    }
)


//validate confirm 
$('#password, #confpassword').on('keyup', function () {
    if ($('#password').val() == $('#confpassword').val()) {
      $('#confirm').html('Password matching').css('color', 'green');
  
    } else 
      $('#confirm').html('Password not Matching').css('color', 'red');
  });