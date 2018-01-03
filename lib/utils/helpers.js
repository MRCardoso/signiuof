var fs = require('fs');

/**
 * Method to returns the error ocurred in the backend node server
 * @param {Object|string} err the err occurred
 * @param {Bool} nobr add br tag html in errors returned
 * @param {Bool} isString define the return of the errors a array or a string
 * @returns {string|Array}
 */
exports.getErrorMessage = function(err, noTags = true, isString = true)
{
    var message = [];
    if( err == null || err == 'undefined')
        return "erro inesperado aconteceu!";
    if( typeof err == 'string'){
        return err;
    }
    if('code' in err)
    {        
        switch (err.code)
        {
            case 11000:
            case 11001:
                message.push('Usuário já existe');
                break;
            default:                
                message.push('Erro desconhecido!');
        }
    }
    else
    {
        if ('errors' in err)
        {
            for(var errName in err.errors)
            {                
                if(err.errors[errName].message)
                {
                    message.push(err.errors[errName].message);
                }
            }
        }
        else
        {
            message.push('server error internal!');
        }
    }
    if( isString )
        return message.join(noTags?'<br>':'');
    else
        return message;
};

/**
| ----------------------------------------------------------------------------------
| Sent mail
| configure the transport with the service and your credentials
| set body and header to mail before sent
| and finally execution the sent
| fail: return with status 400 and error message
| success: return an json with information of the mail sent
| ----------------------------------------------------------------------------------
 * @param {Object} data
 * @param {*} next
 * @param {String} view
 */
exports.sendMail = function (data, next, credentials)
{
    var $this = this;
    if(data != null)
    {
        // credentials.view
        console.log('mail-process', process);
        console.log('mail-dir', __dirname);
        console.log('mail-pwd', process.env.PWD);
        fs.readFile(`${__dirname}/../views/mail.html`, 'utf8', function (err,template)
        {
            if (err)
            {
                console.log('erro template',err);
                return next(err, null);
            }

            console.log('sending-mail');

            var nodemailer = require('nodemailer');            
            var transporte = nodemailer.createTransport({
                    service: credentials.serviceMail,
                    auth: {
                        user: credentials.loginMail,
                        pass: credentials.passMail
                    }
                }),
                email = {
                    from: [credentials.appName || 'Default Site', " <",credentials.loginMail,">"].join(''),
                    to: data.mail,
                    subject: data.subject,
                    headers: {'content-type': 'text/html'},
                    html: $this.replaceCharacters(template, data.content, data.title)
                };

            if('annex' in data)
            {
                if('name' in data.annex && 'path' in data.annex)
                    email.attachments = [{filename: data.annex.name,path: data.annex.path}];
            }
            transporte.sendMail(email, function(err, info)
            {
                if( err ){
                    console.log('email-error', err);
                    return next(err, null);
                }
                return next(false, info);
            });
        });
    }
};

function replaceCharacters(html, content, title)
{
    while( content.indexOf("{") != -1 || content.indexOf("}") != -1 )
    {
        content = content.replace(/\{/ig, '<').replace(/\}/ig,'>');
    }
    return html.replace("{title}",title)
               .replace("{content}",content);
}