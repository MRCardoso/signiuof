let middlewares = require('./utils/middlewares');

function Iuof(options)
{
    if( !(this instanceof Iuof)) return new Iuof(options);

    this._options = options;

    this.routes = _routes;

    this.middlewares = middlewares;

    this.helpers = require("./utils/helpers");

    this.connectMongo = _connectMongo;

    return this;
}

exports.Iuof = Iuof;

/**
 * Method to register the routes to signin, signup, signout,forgot and reset
 * @param {*} app 
 */
function _routes(app){
    let passport = require('passport');
    let controller = require('./controllers/controller');
    let options = this._options || {};
    options._routes = {
        signin: options.signin || '/signin',
        signup: options.signup || '/signup',
        signout: options.signout || '/signout',
        forgot: options.forgot || '/forgot',
        reset: options.reset || '/reset/:token',
        passwdChange: options.passwdChange || '/changePassword',
    };
    
    controller.configure(options);
    middlewares.configure(options);
    
    /*
    | ------------------------------------------------------------------
    | Authentication request
    | ------------------------------------------------------------------
    */
    app.route(options._routes.signin)
        .get(middlewares.isVisitant, controller.renderSignin)
        .post(middlewares.isVisitant, passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: options._routes.signin,
            failureFlash: true,
            badRequestMessage: 'Usuário e Senha são obrigatórios!'
        }));
    /*
    | ------------------------------------------------------------------
    | Signup request
    | ------------------------------------------------------------------
    */
    app.route(options._routes.signup)
        .get(middlewares.isVisitant, controller.renderSignup)
        .post(middlewares.isVisitant, controller.signup);
    /*
    | ------------------------------------------------------------------
    | Restore password and sent token with recovery
    | ------------------------------------------------------------------
    */
    app.route(options._routes.forgot)
        .get(middlewares.isVisitant, controller.renderForgot)
        .post(middlewares.isVisitant, controller.forgotPassword);
    /*
    | ------------------------------------------------------------------
    | Reset password and login
    | ------------------------------------------------------------------
    */
    app.route(options._routes.reset)
        .get(middlewares.isVisitant, middlewares.requireResetToken, controller.renderReset)
        .post(middlewares.isVisitant, middlewares.requireResetToken, controller.resetPassword);

    /*
    | ------------------------------------------------------------------
    | Signout request
    | ------------------------------------------------------------------
    */
    app.get(options._routes.signout, controller.signout);
    /**
    | ------------------------------------------------------------------
    | Change password
    | ------------------------------------------------------------------
    */
    app.post(
        options._routes.passwdChange, 
        middlewares.requireLogin, 
        controller.verifyPassword, 
        controller.modifyPassword
    );
}

/**
 * Method to open connection with mongo db
 * @param {Object} config
 * @param {String} config.db the path name of database
 * @param {String} config.options the otions this connection
 * @param {function} next the callback returned
 * @returns function
 */
function _connectMongo(config, next)
{
    let mongoose = require('mongoose');
    let db = mongoose.connect(config.db, Object.assign({}, { useMongoClient: true },config.options) );
    require('./models/user.js');
    require('./models/user_api.js');
    return next(db);
}