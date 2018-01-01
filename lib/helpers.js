var fs = require('fs');

/**
 * return error use the obj err of the mongoose
 * @param err
 * @param nobr
 * @returns {string}
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
        this.writeLogs(JSON.stringify(err, null, 4));
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
            this.writeLogs(JSON.stringify(err, null, 4));
            message.push('server error internal!');
        }
    }
    if( isString )
        return message.join(noTags?'<br>':'');
    else
        return message;
};
exports.replaceCharacters = function (html, content, title)
{
    while( content.indexOf("{") != -1 || content.indexOf("}") != -1 )
    {
        content = content.replace(/\{/ig, '<').replace(/\}/ig,'>');
    }
    return html.replace("{title}",title)
               .replace("{content}",content);
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
        fs.readFile(`${__dirname}/../views/mail.html`, 'utf8', function (err,template)
        {
            if (err)
            {
                return console.log('erro template',err);
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
                    from: ["Playlist System <",credentials.loginMail,">"].join(''),
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
                if( err )
                    console.log('email-error', err);
                next(err, info);
            });
        });
    }
};