var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    UserApi = () => mongoose.model('UserApi'),
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
    resetToken: {
        type: String,
        default: null
    },
    resetExpires:{
        type: Date,
        default: Date.now
    },
    userApis: [{
        type: Schema.Types.ObjectId,
        ref: 'UserApi'
    }],
    created:{
        type: Date,
        default: Date.now
    },
    /**
     * OAuth Credentials
    */
    provider: {
        type: String,
        required: "O campo providor é obrigatório!",
        default: 'local',
        trim: true
    },
    providerId: {
        type: String,
        trim: true,
        default: null
    },
    providerData: {
        type: Object,
        default: null
    }
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
 * find a user by username and validate password in hash
 * @param {object} credentials the object with login data
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
 * Find a user by your email address to sent the email with new password
 * @param {string} email the email of the user
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByEmail = function(email, next)
{
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
 * Find a user by your token to auth in the app
 * @param {string} token the token of the user
 * @param {int} expires the expires date of the user
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByAuthToken = function(token, expires = false, next)
{
    let validations = [];
    let params = {token: token};
    
    if(token == undefined || token == null || token == ''){
        validations.push({message:`O token é obrigatório!`});
    }
    if( expires != false ){
        if(expires == undefined || expires == null || expires == ''){
            validations.push({message:`A data de expiração é obrigatória!`});
        }
        params['expires'] = expires;
    }

    if(validations.length>0){
        return next({errors: validations, sCode: 400}, null);
    }
    UserApi()
    .findOne(params)
    .populate('userId')
    .exec((err, dataApi) =>{
        if(err)
        {
            next(err,null);
        }
        if(!dataApi){
            return next({errors: [{message:`Token não encontrado!`}], sCode: 404}, null);
        }
        var rsUser = dataApi.userId;
        rsUser.apiToken = dataApi.token;
        rsUser.apiExpires = dataApi.expires;
        return next(false, rsUser);
    });
};

/**
 * Find a user by your reset token
 * @param {string} token the token to be load the user
 * @param {int} expires the expires date
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByResetToken = function(token, expires, next)
{
    let validations = [];
    if( token == undefined || token == null || token == ''){
        validations.push({message: 'O token é obrigatório!'});
    }
    if( expires == undefined || expires == null || expires == ''){
        validations.push({message: 'A data de expiração é obirgatória!'});
    }

    if(validations.length>0){
        return next({errors: validations, sCode: 400}, null);
    }

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
 * Find or create account by oauth third part
 * @param {object} data the user data to be add
 * @param {function} next the callback function called when success and fail
 */
UserSchema.statics.findByOAuth = function(data, next){
    this.findOne({ providerId: data.providerId }, (err, user) => {
        if(err){
            return next(err, null);
        }
        if(user){
            return next(null, user);
        }
        data.password = Math.floor((Math.random() * (Date.now() + data.providerId.id)) + 1);
        
        new User(data).save((err, u) => {
            if(err){
                return next(err, null);
            }
            return next(null, u);
        });
    });
};

/**
 * Method to verify if the password is valid
 * @param password The password of the user
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.authenticate = function(password, next) {
    bcrypt.compare(password, this.password, function(err, isMatch) {
        if (err) 
            return next(err);
        next(isMatch);
    });
};

/**
 * Create a new token in the foreign table(user_api) for authenticated user by jwt
 * @param {object} params the data to be create a new api authentication
 * @param {string} params.token the token to be save of the load user
 * @param {int} [params.expires=Date.now() + 3600000] the data of expiration for this token
 * @param {string} params.name the name of the origin to be create auth
 * @param {int} params.platform the origin type to be create auth
 * @param {string} [params.version=''] the origin version to be create auth
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.createApiToken = function(params, next)
{
    if (params.expires == undefined || params.expires == null){
        params.expires = Date.now() + 3600000; // 1 hour
    }
    let UserApiModel = UserApi();

    let userApi = new UserApiModel(params);
    userApi.userId = this._id;
    userApi.save((err,dataApi)=>{
        return next(err, dataApi);
    });
};

/**
 * Remove the token created in signin for authenticated user by jwt
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.removeApiToken = function (next) {
    var $this = this;
    UserApi().remove({
        userId: $this._id,
        token: $this.apiToken,
        expires: $this.apiExpires
    }, next);
};
/**
 * Update the reset password token and expires date of the load user
 * @param {int} [expires=Date.now() + 3600000] the data of expiration for this token
 * @param {function} next the callback function called when success and fail
 */
UserSchema.methods.updateResetToken = function(expires = false, next)
{
    if( expires == false ){
        expires = Date.now() + 3600000; // 1 hour
    }
    this.password = new Date().getTime()+1000;
    this.resetToken = require('crypto').randomBytes(32).toString('hex');
    this.resetExpires = expires;

    this.save((err, user) => {
        return next(err, user);
    });
};

/**
 * Update the Password of a load user
 * @param {Object} credentials The list of the credentials to find/update
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
 * Fill the fields of the model
 * @param {object} post
 * @param {string} post.name
 * @param {string} post.email
 * @param {string} post.username
 * @param {string} post.status
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