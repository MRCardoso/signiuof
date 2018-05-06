var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

let fillables = [
    "name",
    "platform",
    "token",
    "expires"
];
/**
 * Create a Schema of the table 'UserApi'
 * */
var UserApiSchema = new Schema({
    name: {
        type: String,
        required: "O nome é obrigatória!",
        trim: true
    },
    version: {
        type: String,
        default: '',
        trim: true
    },
    platform: {
        type: Number, // 1 - mobile, 2 - third party
        required: "A Plataforma é obrigatória!",
        default: 1,
    },
    token: {
        type: String,
        required: "O token é obrigatória!",
    },
    expires: {
        type: Number,
        required: "A expires é obrigatória!",
    },
    userId: {
        type: Schema.ObjectId,
        required: "O usuário é obrigatória!",
        ref: 'User'
    },
    created:{
        type: Date,
        default: Date.now
    },
});

/** 
 * Fill the fields of the model
 * @param {object} post
 * @param {string} post.name
 * @param {string} post.platform
 * @param {string} post.token
 * @param {string} post.expires
*/
UserApiSchema.methods.setFillables = function(post) {
    fillables.map(item => this[item] = post[item] );
};
/**create the model by UserApiSchema*/
mongoose.model('UserApi', UserApiSchema);