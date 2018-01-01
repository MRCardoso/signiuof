module.exports = {
    init: _init
};

function _init(app){
    let passport = require('passport');
    let server = require('./controller');
    /*
    | ------------------------------------------------------------------
    | Authentication request
    | ------------------------------------------------------------------
    */
    app.route('/signin')
        .get(server.renderSignin)
        .post(passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/signin',
            failureFlash: true,
            badRequestMessage: 'Usuário e Senha são obrigatórios!'
        }));
    /*
    | ------------------------------------------------------------------
    | Signout request
    | ------------------------------------------------------------------
    */
    app.route('/signup')
        .get(server.renderSignup)
        .post(server.signup);
    /*
    | ------------------------------------------------------------------
    | Signout request
    | ------------------------------------------------------------------
    */
    app.get('/signout', server.signout);
    /*
    | ------------------------------------------------------------------
    | Restore password and sent token with recovery
    | ------------------------------------------------------------------
    */
    app.route('/forgot').get(server.renderForgot).post(server.forgotPassword);
    /*
    | ------------------------------------------------------------------
    | Reset password and login
    | ------------------------------------------------------------------
    */
    app.route('/reset/:token').get(server.renderReset).post(server.resetPassword);
}