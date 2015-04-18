//import the controller folder (automatically calls the index.js file)
var controllers = require('./controllers'); 
var mid = require('./middleware');

function router(app) {

    // Login page 
    app.get("/login",  mid.secure, mid.logout, controllers.Account.logInPage);
        
    // Stats page
    app.get('/stats', mid.secure, mid.login, controllers.Account.statPage);
    
    // Game page
    app.get("/",      mid.secure, controllers.Granama.gamePage);
    app.get('/game', mid.secure, controllers.Granama.gamePage);
    
    // Actions
    app.post("/login", mid.secure, mid.logout, controllers.Account.logIn); 
    app.post("/logout", mid.secure, mid.login, controllers.Account.logOut);    
    app.post("/account", mid.secure, mid.login, controllers.Account.get);
}

module.exports = router; 