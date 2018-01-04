let config = () => module.parent.exports.getConfig();

var User = require('mongoose').model('User'),
    help = require('../utils/helpers');

/**
 * Validate password
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.verifyPassword = function(req,res,next)
{
    User.findAndAuthenticate({
        username: req.user.username, 
        password: (req.body.password || '')
    }, (err, user) =>{
        if (err){
            return res.status(err.sCode || 500).send({
                message: help.getErrorMessage(err)
            });
        }

        next();
    });
};

/**
 * Update password
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @returns {*}
 */
exports.modifyPassword = function (req, res)
{
    let params = {
        password: (req.body.new_password || '')
    };
    if( 'confirmation' in req.body )
        params.confirmation = req.body.confirmation;

    req.user.updatePasswd(params, function(err, u){
        if(err)
        {
            return res.status(err.sCode || 500).send({
                message: help.getErrorMessage(err)
            });
        }
        
        res.json({
            message: `Senha para usuário '${u.username}' foi atualizada com sucesso!`,
            module: u
        });
    });
};

/**
 * method to signout end session and redirect to home page
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.signout = function(req, res)
{
    req.logout();
    res.redirect('/');
};

/**
 * Method to create a account in the system
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.signup = function(req,res)
{
    req.flash('post-data', req.body);

    var user = new User({
        name: [req.body.firstName, req.body.lastName].join(' '),
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    user.save((err, u) => {
        if (err){
            req.flash('error', help.getErrorMessage(err, true, false));
            return res.redirect(config()._routes.signup);
        }
        
        req.login(u, err => {
            if (err){
                req.flash('error', help.getErrorMessage(err, true, false));
                return res.redirect(config()._routes.signup);
            }
            return res.redirect('/');
        });
    });
};

/**
 * post request to sent email forward an email with token with recovery passwords
 * success: set flash with succes message and redirect to config()._routes.signin
 * fail: set flash with errors and redirect to config()._routes.forgot 
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param {*} next
 */
exports.forgotPassword = function(req, res, next)
{
    let c = config();
    User.findByEmail((req.body.email || ''), function(err, user){
        if(err) {
            req.flash('error', help.getErrorMessage(err, true, false));
            return res.redirect(c._routes.forgot);
        }
        let expires = null;
        if(c.resetToken != undefined && c.resetToken.length==2){
            expires = require('moment')().add(c.resetToken[0], c.resetToken[1]).valueOf();
        }

        user.updateResetToken(expires,(err, u) => {
            if(err) {
                req.flash('error', help.getErrorMessage(err, true, false));
                return res.redirect(c._routes.forgot);
            }

            let url = `${req.protocol}://${req.get('host')}${c._routes.reset.replace(':token', u.resetToken)}`;
            
            help.sendMail({
                mail: u.email,
                subject: "Token de Recuperação de senha.",
                content: `
                    {strong}Token:{/strong}{br}
                    {a href="${url}" title="token"}Clique aqui{/a}{br}
                    ou cole este link em seu navegador: ${url}`,
                title: 'Token de Recuperação de senha'
            }, function(err, info){
                if(err) {
                    req.flash('error', help.getErrorMessage(err, true, false));
                    return res.redirect(c._routes.forgot);
                }
                req.flash('success', "E-mail encaminhado com sucesso!");
                res.redirect(c._routes.signin);
            }, c);
        });
    });
};

/**
 * post request with new password for user
 * success: set flash with succes message, save new password and login
 * fail: set flash with errors and redirect to config()._routes.reset
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param next
 */
exports.resetPassword = function(req, res, next)
{
    var url = `${config()._routes.reset.replace(':token', req.params.token)}`;

    req.user.updatePasswd({
        password: (req.body.password || ''),
        confirmation: (req.body.confirmation || '')
    }, (err, user) => {
        req.user = null;
        if(err) {
            req.flash('error', help.getErrorMessage(err, true, false));
            return res.redirect(url);
        }

        req.login(user, (err) => {
            if (err)
            {
                req.flash('error', help.getErrorMessage(err, true, false));
                return res.redirect(url);
            }
            res.redirect('/');
        });
    });
}