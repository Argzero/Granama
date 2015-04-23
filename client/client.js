window.onload = function() 
{
    //set up listeners
    var form = document.getElementById('formSubmit');
    var check = document.getElementById('signup');
    
    check.onclick = function(e) {
        document.getElementById('pass2').style.display = this.checked ? 'block' : 'none';
    };
    
    form.onclick = function(e) {
        e.preventDefault();
        
        var user = document.getElementById('user');
        var pass = document.getElementById('pass');
        
        if(user.value === '' || pass.value === '')
        {
            document.getElementById('title').innerHTML = 'Fill In All Fields';
            return false;
        }
        
        if (check.checked && document.getElementById('pass2').value !== pass.value)
        {
            document.getElementById('title').innerHTML = 'Password Mismatch';
            return false;           
        }
        
        sendAjax('/logIn', $("#loginForm").serialize());        
        return false;
    };
    
    window.onkeydown = function(e) {
        if (e.keyCode != 13) return;
        form.click();
    };
};

function sendAjax(action, data) {
    $.ajax({
        cache: false,
        type: "POST",
        url: action,
        data: data,
        dataType: "json",
        success: function(result, status, xhr) {
            window.location = result.redirect;
        },
        error: function(xhr, status, error) {
            document.getElementById('title').innerHTML = (error == 'Unauthorized') ? 'Bad Credentials' : 'Username Taken';
            //reset fields
            document.getElementById('user').value = '';
            document.getElementById('pass').value = '';
            document.getElementById('pass2').value = '';
        }
    });        
}