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