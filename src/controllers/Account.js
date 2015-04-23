var models = require('../models');

var Account = models.Account;

//log in
function logInPage(req, res)
{
    res.render('login');
}

//log out
function logOut(req, res) 
{
    req.session.destroy();
    res.json({ redirect: '/login' });
}

//launch the bestiary page
function bestiaryPage(req, res)
{
    res.render('bestiary');
}

//log in the user
function logIn(req, res) {

    var username = req.body.username;
    var password = req.body.pass;
    var signup = req.body.signup;
    
    //debugging console logs
    //console.log("Username: " + username);
    //console.log("Password: " + password);

    // Validate the username/password
    if(!username || !username.match(/^[A-Za-z0-9]{1,10}$/)) 
    {
        return res.status(400).json({error: 'Invalid username'});
    }
    if (!password || !password.match(/^[A-Za-z0-9]{1,10}$/)) 
    {
        return res.status(400).json({error: 'Invalid password'});
    }

    // Logging in 
    if (!signup) {
        Account.AccountModel.authenticate(username.toUpperCase(), password.toUpperCase(), function(err, account) 
        {
            if(err || !account) 
            {
                return res.status(401).json({error: "Wrong username or password"});
            }
            
            req.session.account = account.toAPI();
            
            //after login, the user can head here
            res.json({redirect: '/bestiary'});
        });
    }

    // Signing up option was selected
    else 
    {
        Account.AccountModel.generateHash(password.toUpperCase(), function(salt, hash) 
        {

            var accountData = {
                username: username.toUpperCase(),
                salt: salt,
                password: hash
            };
            
            var newAccount = new Account.AccountModel(accountData);
            
            //save a new account to the database
            newAccount.save(function(err) 
            {
                if(err) 
                {
                    console.log(err);
                    return res.status(400).json({error: err}); 
                }

                req.session.account = newAccount.toAPI();
                
                //after sign in, the user can head here
                res.json({redirect: '/bestiary'});
            });
        });
    }
}

//get the account
function get(req, res) 
{
    var username = req.body.account;
    
    //only if username is empty (local account)
    if (username === '') 
    {
        username = req.session.account.username;
    }
    
    // Validate the username andpassword
    if(!username || !username.match(/^[A-Za-z0-9]{1,10}$/)) 
    {
        return res.status(400).json({error: 'Invalid username'});
    }
    
    //find the username sent in
    Account.AccountModel.findByUsername(username, function(err, doc) 
    {
        if (err) 
        {
            return res.status(400).json({error: 'Server Error'});
        } 
        else if (!doc) 
        {
            return res.status(400).json({error: 'No data available'});
        }
        else 
        {
            return res.json(doc.toAPI());
        }
    });
}



module.exports.logInPage = logInPage;
module.exports.logIn = logIn;
module.exports.logOut = logOut;
module.exports.bestiaryPage = bestiaryPage;
module.exports.get = get;