var models = require('../models');

var Account = models.Account;

function logInPage(req, res) {
    res.render('login');
}

function logOut(req, res) {
    req.session.destroy();
    res.json({ redirect: '/login' });
}

function statPage(req, res) {
    res.render('stat');
}

function get(req, res) {
    var username = req.body.account;
    if (username === '') {
        username = req.session.account.username;
    }
    
    // Validate the username/password
    if(!username || !username.match(/^[A-Za-z0-9]{1,10}$/)) {
        return res.status(400).json({error: 'Invalid username'});
    }
    
    Account.AccountModel.findByUsername(username, function(err, doc) {
        if (err) {
            return res.status(400).json({error: 'Server Error'});
        } 
        else if (!doc) {
            return res.status(400).json({error: 'No data'});
        }
        else {
            return res.json(doc.toAPI());
        }
    });
}

function logIn(req, res) {

    var username = req.body.username;
    var password = req.body.pass;
    var signup = req.body.signup;

    // Validate the username/password
    if(!username || !username.match(/^[A-Za-z0-9]{1,10}$/)) {
        return res.status(400).json({error: 'Invalid username'});
    }
    if (!password || !password.match(/^[A-Za-z0-9]{1,10}$/)) {
        return res.status(400).json({error: 'Invalid password'});
    }

    // Logging in 
    if (!signup) {
        Account.AccountModel.authenticate(username.toUpperCase(), password.toUpperCase(), function(err, account) {
            if(err || !account) {
                return res.status(401).json({error: "Wrong username or password"});
            }
            
            req.session.account = account.toAPI();
            
            res.json({redirect: '/stats'});
        });
    }

    // Signing up
    else {
        Account.AccountModel.generateHash(password.toUpperCase(), function(salt, hash) {

            var accountData = {
                username: username.toUpperCase(),
                salt: salt,
                password: hash
            };
            
            var newAccount = new Account.AccountModel(accountData);
            
            newAccount.save(function(err) {
                if(err) {
                    console.log(err);
                    return res.status(400).json({error: err}); 
                }

                req.session.account = newAccount.toAPI();
                
                res.json({redirect: '/stats'});
            });
        });
    }
}

module.exports.logInPage = logInPage;
module.exports.logIn = logIn;
module.exports.logOut = logOut;
module.exports.statPage = statPage;
module.exports.get = get;