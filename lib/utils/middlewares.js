let _middleConfigure;
exports.configure = function(configure){
    _middleConfigure = configure;
}
/**
 * Method to verify if the user is authenticated
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param {*} next
 * @returns {*}
 */
exports.requireLogin = function(req,res,next)
{
    if(!req.isAuthenticated())
    {
        return res.status(401).send({
            message: 'Usuário não autenticado!'
        });
    }
    next();
};

/**
 * Middleware to verifi if the user is not logged
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param {*} next 
 */
exports.isVisitant = function(req, res, next){
    if(!req.isAuthenticated()){
        return next();
    }
    return res.redirect('/');
};

/**
 * Middleware to validate if the the ton
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param {*} next 
 */
exports.requireResetToken = function(req, res, next)
{
    let User = require('mongoose').model('User');
    let help = require('../utils/helpers');;

    User.findByResetToken(req.params.token, Date.now(), (err, user) => {
        if(err) {
            req.flash('error', help.getErrorMessage(err, true, false));
            return res.redirect(_middleConfigure._routes.forgot);
        }
        
        req.user = user;
        next();
    });
}