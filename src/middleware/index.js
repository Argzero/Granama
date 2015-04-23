//log the user out
function logout(req, res, next) 
{
    if(req.session.account) 
    {
        return res.redirect('/bestiary');
    }

    next();
}

//requires users to be logged into an account
function login(req, res, next) 
{
    if(!req.session.account) 
    {
        return res.redirect('/login');
    }
    
    next();
}

//requires a secure connection
function secure(req, res, next) 
{
    if(req.headers['x-forwarded-proto'] != 'https') 
    {
        return res.redirect("https://" + req.host + req.url);
    }
    
    next();
}

//no secure connection required
function insecure(req, res, next) 
{
    next();
}

//Ignore security measures when testing locally
if (process.env.NODE_ENV === "production") 
{
    module.exports.secure = secure;
}
else 
{
    module.exports.secure = insecure;
}

//Pass other functions to the exports for NodeJS
module.exports.login = login;
module.exports.logout = logout;