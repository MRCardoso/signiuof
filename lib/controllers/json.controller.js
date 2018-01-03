let config = () => module.parent.exports.getConfig();

var User = require('mongoose').model('User'),
    help = require('../utils/helpers');

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
            return res.status(err.status || 500).send({
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
    if(req.body.new_password==null || req.body.new_password=='')
    {
        return res.status(400).send({
            message: "O campo senha é obrigatória!"
        });
    }
    var user = req.user;
    user.password = req.body.new_password;
    user.save(function(err)
    {
        if(err)
        {
            return res.status(400).send({
                message: help.getErrorMessage(err)
            });
        }
        else
        {
            res.json({
                message: `Senha para usuário '${user.username}' foi atualizada com sucesso!`,
                module: user
            });
        }
    });
};

/**
 * post request to sent email forward an email with token with recovery passwords
 * success: set flash with succes message and redirect toconfig()._routes.signin
 * fail: set flash with errors and redirect to config()._routes.forgot 
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param {*} next
 */
exports.forgotPassword = function(req, res, next)
{
    if( req.body.email != null && req.body.email != '' )
    {
        User.findOne({email: req.body.email}, function(err, user)
        {
            if(err) {
                req.flash('error', help.getErrorMessage(err, true));
                return res.redirect(config()._routes.forgot);
            }
            else if (!user) {
                req.flash('error', "E-mail de usuário não encontrado!");
                return res.redirect(config()._routes.forgot);
            }
            else {
                var moment = require('moment');
                var token = require('crypto').randomBytes(32).toString('hex');

                user.password = new Date().getTime()+1000;
                user.resetToken = token;
                user.resetExpires = moment().add(10,'minutes').valueOf(); //Date.now() + 3600000; // 1 hour

                user.save(function(err) 
                {
                    if(err) {
                        req.flash('error', help.getErrorMessage(err, true));
                        return res.redirect(config()._routes.forgot);
                    }

                    let url = `${req.protocol}://${req.get('host')}/reset/${token}`;
                    help.sendMail({
                        mail: user.email,
                        subject: "Token de Recuperação de senha.",
                        content: `
                        {strong}Token:{/strong}{br}
                        {a href="${url}" title="toke"}${token}{/a}{br}
                        ou cole este link em seu navegador: ${url}
                        `,
                        title: 'Token de Recuperação de senha'
                    }, function(err, info){
                        if(err) {
                            req.flash('error', help.getErrorMessage(err, true));
                            return res.redirect(config()._routes.forgot);
                        }
                        req.flash('success', "E-mail encaminhado com sucesso!");
                        res.redirect(config()._routes.signin);
                    }, config);                    
                });                
            }            
        })
    }
    else
    {
        req.flash('error', "E-mail não informado!");
        res.redirect(config()._routes.forgot);
    }
};

/**
 * post request with new password for user
 * success: set flash with succes message, save new password and login
 * fail: set flash with errors and redirect to /reset/:token
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 * @param next
 */
exports.resetPassword = function(req, res, next)
{
    var url = `/reset/${req.params.token}`;
    if( req.body.confirmation != '' && req.body.password != '' )
    {
        if( req.body.confirmation == req.body.password )
        {
            User.findOne({
                resetToken: req.params.token, resetExpires: {$gt: Date.now()}
            }).exec(function(err, user){
                if(err) {
                    req.flash('error', help.getErrorMessage(err, true));
                    return res.redirect(url);
                }
                else if (!user) {
                    req.flash('error', "Este token já expirou!");
                    return res.redirect(url);
                }
                else {
                    user.resetToken = null;
                    user.resetExpires = null;
                    user.password = req.body.password;
                    user.save(function(err){
                        if(err) {
                            req.flash('error', help.getErrorMessage(err, true));
                            return res.redirect(url);
                        }

                        req.login(user, function (err)
                        {
                            if (err)
                            {
                                req.flash('error', help.getErrorMessage(err, true));
                                return res.redirect(url);
                            }
                            res.redirect('/');
                        });
                    });
                }
            });
        }
        else
        {
            req.flash('error', "A Senha e conformação de senha não coincidem!");
            return res.redirect(url);
        }
    }
    else{
        req.flash('error', "A Senha e conformação de senha são Obrigatórias!");
        return res.redirect(url);
    }
}