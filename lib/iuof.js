function Iuof(options)
{
    if( !(this instanceof Iuof)) return new Iuof(options);

    this._options = options;

    this.routes = _routes;

    this.connectMongo = _connectMongo;

    return this;
}

exports.Iuof = Iuof;

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
    };
    
    controller.configure(options);
    
    /*
    | ------------------------------------------------------------------
    | Authentication request
    | ------------------------------------------------------------------
    */
    app.route(options._routes.signin)
        .get(controller.renderSignin)
        .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: options._routes.signin,
            failureFlash: true,
            badRequestMessage: 'Usuário e Senha são obrigatórios!'
        }));
    /*
    | ------------------------------------------------------------------
    | Signout request
    | ------------------------------------------------------------------
    */
    app.route(options._routes.signup)
        .get(controller.renderSignup)
        .post(controller.signup);
    /*
    | ------------------------------------------------------------------
    | Signout request
    | ------------------------------------------------------------------
    */
    app.get(options._routes.signout, controller.signout);
    /*
    | ------------------------------------------------------------------
    | Restore password and sent token with recovery
    | ------------------------------------------------------------------
    */
    app.route(options._routes.forgot)
        .get(controller.renderForgot)
        .post(controller.forgotPassword);
    /*
    | ------------------------------------------------------------------
    | Reset password and login
    | ------------------------------------------------------------------
    */
    app.route(options._routes.reset)
        .get(controller.renderReset)
        .post(controller.resetPassword);
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
    return next(db);
}