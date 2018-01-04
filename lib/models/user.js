var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

let fillables = [
    "name",
    "email",
    "username",
    "status"
];
/**
 * Create a Schema of the table 'User'
 * */
var UserSchema = new Schema({
    name: {
        type: String,
        trim: true,
        default: ""
    },
    email: {
        type: String,
        match: [
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            ,"Por favor preencha um endereço de E-mail válido!"
        ],
        default: ''
    },
    username: {
        type: String,
        unique: true,
        required: "O campo usuário é obrigatório!",
        trim: true
    },
    password: {
        type: String,
        required: "O campo senha é obrigatória!",
        validate: [
            function(password)
            {
                return password && password.length > 6;
            }, "A senha deve ter mais de 6 caracteres!"
        ]
    },
    status: {
        type: Number,
        default: 1 // 1 - active | 0 - inactive
    },
    image: {
        type: Object,
        default: null
    },
    authToken: {
        type: String,
        default: null,
    },
    authTokenExpires: {
        type: Number,
        default: null,
    },
    resetToken: {
        type: String,
        default: null
    },
    resetExpires:{
        type: Date,
        default: Date.now
    },
    created:{
        type: Date,
        default: Date.now
    },
});
/**
 * method pre('save')
 * set a hash to password only in insert
 */
UserSchema.pre('save', function(next)
{
    var user = this;
    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(5, function(err, salt) {
        if (err) 
            return next(err);
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

/**
 * method authenticate
 * to validation of the password the user
 * @param password
 */
UserSchema.methods.authenticate = function(password, next) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) 
            return next(err);
        next(isMatch);
    });
};

/**
 * find a user by username and validate password in hash
 * @param {Object} credentials the object with login data
 * @param {string} credentials.username the username to be found
 * @param {string} credentials.password the password to be found
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findAndAuthenticate = function(credentials,next)
{
    var validations = [];
    if (credentials && credentials.username == '')
        validations.push({message: `Usuário é obrigatório!`});

    if (credentials && credentials.password == '')
        validations.push({message: `Senha é obrigatória!`});

    if(validations.length>0){
        return next({errors: validations, sCode: 400},null);
    }

    this.findOne({username: credentials.username, status : true}, (err, user) => {
        if (err){
            return next(err, null);
        }
        if(!user){            
            return next({errors: [{message:`Usuário '${credentials.username}' não encontrado!`}], sCode: 404}, null);
        }
        user.authenticate(credentials.password, (isMatch) => {
            if (!isMatch) {
                return next({errors: [{message: 'Senha inválida!'}], sCode: 400}, null);
            }

            return next(false, user);
        });
    });
};

/**
 * verify if username already exists
 * join with suffix the username
 * use the method findOne of the mongoose
 * if username don't exist, execute the callback
 * @param value the username to be validate
 * @param done the callback with response
 */
UserSchema.path('username').validate(function(value, done) {
    this.model('User')
    .count({_id: {$ne : this._id},username: value}, (err, count) =>{
        if (err)
            return done(err);
        done(!count);
    });
}, 'Este usuário já existe');

/**
 * Find a user by your token to auth in the app
 * @param {string} token the token to be save of the load user
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByToken = function(token, next)
{
    if( token == null || token == undefined || token == '' ){
        return next({errors: [{message:`O token é obrigatório!`}], sCode: 400}, null);
    }
    this.findOne({authToken: token}, (err, user)=>{
        if(err)
        {
            next(err,null);
        }
        if(!user){
            return next({errors: [{message:`Token não encontrado!`}], sCode: 404}, null);
        }
        return next(false, user);
    });
};

/**
 * Find a user by your email address to sent the email with new password
 * @param {string} email the email of the user
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByEmail = function(email, next){
    if(email==undefined || email==null || email=='')
    {
        return next({errors: [{message:`E-mail é obrigatório!`}], sCode: 400}, null);
    }
    this.findOne({email: email}, (err, user) => {
        if(err){
            return next(err, null);
        }
        
        if (!user) {
            return next({errors: [{message: 'E-mail de usuário não encontrado!'}], sCode: 404}, null);
        }

        return next(false, user);
    });
};

/**
 * Find a user by your reset token
 * @param {string} token the token to be load the user
 * @param {string} expires the expires date
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByResetToken = function(token, expires, next){
    this.findOne({
        resetToken: token,
        resetExpires: {$gt: expires}
    }, (err, user) => {
        if(err) {
            return next(err, null);
        }
        
        if (!user){
            return next({errors: [{message: 'Este token já expirou!'}], sCode: 404}, null);
        }
        return next(false, user);
    });
};

/**
 * Update the token and expires date of the load user
 * @param {string} token the token to be save of the load user
 * @param {int} expires the data of expiration for this token
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.updateToken = function(token, expires, next)
{
    this.authToken = token;
    this.authTokenExpires = expires;
    this.save((err,user)=>{
        return next(err, user);
    });
};

/**
 * Update the reset password token and expires date of the load user
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.updateResetToken = function(next)
{
    this.password = new Date().getTime()+1000;
    this.resetToken = require('crypto').randomBytes(32).toString('hex');
    this.resetExpires = require('moment')().add(1,'minute').valueOf(); // Date.now() + 3600000; // 1 hour

    this.save((err, user) => {
        return next(err, user);
    });
};

/**
 * Update the Password of a load user
 * @param {Object} credentials
 * @param {string} credentials.password the password to be updated
 * @param {string} credentials.confirmation the password confirmation
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.updatePasswd = function(credentials, next)
{
    var validations = [];
    if (credentials.password==undefined || credentials.password==null || credentials.password=='')
        validations.push({message: 'A nova senha é obrigatória!'});

    if ('confirmation' in credentials)
    {
        if(credentials.confirmation==undefined || credentials.confirmation==null || credentials.confirmation=='')
            validations.push({message: 'O campo confirmação de senha é obrigatória!'});
        if(credentials.password != credentials.confirmation)
            validations.push({message: "A Senha e confirmação de senha não coincidem!"});
    }

    if(validations.length>0){
        return next({errors: validations, sCode: 400},null);
    }
    
    this.resetToken = null;
    this.resetExpires = null;
    this.password = credentials.password;
    this.save(function(err,user)
    {
        return next(err, user);
    });
};

/** 
| ---------------------------------------------------------------
| Fill the fields of the model
| ---------------------------------------------------------------
* @param {Object} post
*/
UserSchema.methods.setFillables = function(post) {
    fillables.map(item => this[item] = post[item] );
};

/**config 'UserSchema' for use getters and virtuals when is transformed in JSON*/
UserSchema.set('toJSON', {
    getters: true,
    virtuals: true
});
/**create the model by UserSchema*/
mongoose.model('User', UserSchema);