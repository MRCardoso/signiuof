let loadUser = () => require('mongoose').model('User');
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
    let help = require('../utils/helpers');

    loadUser().findByResetToken(req.params.token, Date.now(), (err, user) => {
        if(err) {
            req.flash('error', help.getErrorMessage(err, true, false));
            return res.redirect(_middleConfigure._routes.forgot);
        }
        
        req.user = user;
        next();
    });
};

/**
 * Middleware to load the user by token jwt, and validate the expires this token
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param {*} next 
 */
exports.requireAuthToken = function(req, res, next)
{
    try{
        let help = require('../utils/helpers');
        let token = (req.headers['x-access-token'] || '');
        let jwt = require('jwt-simple');
        let decoded = jwt.decode(token, _middleConfigure.secretAuthToken);
        
        if(!decoded){ throw "Token não informado!"; }
    
        if (decoded.exp <= Date.now()){ throw "Token expirado!"; }
    
        loadUser().findByAuthToken(token, decoded.exp, (err, user) => {
            if(err)
            {
                return res.status(err.sCode || 500).send({
                    message: help.getErrorMessage(err)
                });
            }
            req.user = user;
            return next();
        });
    } catch(e){
        console.log("Filter-error-token", e);
        return res.status(401).send({
            message: 'Token expirado, por favor faça o login novamente'
        });
    }
};