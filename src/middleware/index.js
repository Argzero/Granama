/**
 * Requires the user to be logged into an account
 *
 * @param {HTMLRequest}  req  - the request being made
 * @param {HTMLResponse} res  - the response functions
 * @param {function}     next - the next stage of the response
 */
function login(req, res, next) {
    if(!req.session.account) {
        return res.redirect('/login');
    }
    
    next();
}

/**
 * Requires the user to be logged out of any account
 *
 * @param {HTMLRequest}  req  - the request being made
 * @param {HTMLResponse} res  - the response functions
 * @param {function}     next - the next stage of the response
 */
function logout(req, res, next) {
    if(req.session.account) {
        return res.redirect('/stats');
    }

    next();
}

/**
 * Require https, forcing the client to elevate security
 *
 * @param {HTMLRequest}  req  - the request being made
 * @param {HTMLResponse} res  - the response functions
 * @param {function}     next - the next stage of the response
 */
function secure(req, res, next) {
    if(req.headers['x-forwarded-proto'] != 'https') {
        return res.redirect("https://" + req.host + req.url);
    }
    
    next();
}

/**
 * Don't require https and just move along
 *
 * @param {HTMLRequest}  req  - the request being made
 * @param {HTMLResponse} res  - the response functions
 * @param {function}     next - the next stage of the response
 */
function insecure(req, res, next) {
    next();
}

// Ignore security measures when testing locally
if (process.env.NODE_ENV === "production") {
    module.exports.secure = secure;
}
else {
    module.exports.secure = insecure;
}

// Pass other functions to the exports for NodeJS
module.exports.login = login;
module.exports.logout = logout;