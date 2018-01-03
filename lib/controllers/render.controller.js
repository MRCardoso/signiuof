/**
 * render the view signin
 * if user don't is logged redirect to home page
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.renderSignin = function (req, res)
{
    if(!req.isAuthenticated())
    {
        res.render('form', {
            title: 'Acessar Conta',
            view: 'signin',
            routes: this.getConfig()._routes,
            messages: req.flash('error') || req.flash('info'),
            success: req.flash('success')
        });
    }
    else
    {
        return res.redirect('/');
    }
};

/**
 * render the view signup, create a account
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.renderSignup = function (req, res)
{
    if(!req.isAuthenticated())
    {
        res.render('form', {
            title: 'Criar Conta',
            view: 'signup',
            routes: this.getConfig()._routes,
            data: req.flash('post-data')[0] || {},
            messages: req.flash('error') || req.flash('info'),
            success: req.flash('success')
        });
    }
    else
    {
        return res.redirect('/');
    }
};

/**
 * render the view Forgot password
 * if user don't is logged redirect to home page
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.renderForgot = function (req, res)
{
    if(!req.isAuthenticated())
    {
        res.render('form', {
            title: 'E-mail para Restaurar Senha',
            view: 'email',
            routes: this.getConfig()._routes,
            messages: req.flash('error') || req.flash('info'),
            success: req.flash('success')
        });
    }
    else
    {
        return res.redirect('/');
    }
};

/**
 * render the view Reset password
 * if user don't is logged redirect to home page
 * @param {Object} req the object with request information(input)
 * @param {Object} res the object with response information(output)
 */
exports.renderReset = function (req, res)
{
    if(!req.isAuthenticated())
    {
        res.render('form', {
            title: 'Restaurar Senha',
            view: 'reset',
            routes: this.getConfig()._routes,
            data: {token: req.params.token},
            messages: req.flash('error') || req.flash('info'),
            success: req.flash('success')
        });
    }
    else
    {
        return res.redirect('/');
    }
};