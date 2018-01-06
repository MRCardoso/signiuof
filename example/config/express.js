module.exports = function()
{
    let express = require('express'),
        app = express(),
        passport = require('passport'),
        bodyParser = require('body-parser'),
        flash = require('connect-flash'),
        session = require('express-session');
    

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(session({saveUninitialized: true,resave: true,secret: 'signiuof'}));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    
    app.use(express.static("./example/public"));
    app.set('view engine', 'ejs');
    app.set('views', `./example/app/views/`);

    let iuof = require("../../lib/index").Iuof({
        /*
        | ------------------------------------------------------------------
        | is better create a specific file(unversioned), to control this configurations
        | ------------------------------------------------------------------
        */
        serviceMail: "",
        loginMail: "",
        passMail: "",
        appName: 'Example App',
        rPath: "example/app/views",
        resetToken: [1, 'minute']
    });
    
    /*
    | ------------------------------------------------------------------
    | Boot the DATABASE
    | is better create a specific file(e.g: app/routes.js), to organize the routes of your app
    | ------------------------------------------------------------------
    */
    iuof.routes(app);
    
    app.get('/', (req, res) => {
        res.render('index', {
            title: "Example Signiuof",
            user: JSON.stringify(req.user)
        }) 
    });
    /*
    | ------------------------------------------------------------------
    | Boot the DATABASE
    | is better create a specific file(e.g: config/mongoose.js), to organize load models of your app
    | ------------------------------------------------------------------
    */
    iuof.connectMongo({
        db: 'mongodb://localhost/example-app'
    }, function(db){
        return db;
    });

    /*
    | ------------------------------------------------------------------
    | Boot the strategies
    | is better create a specific file(e.g: config/passport.js), to organize yours strategies
    | ------------------------------------------------------------------
    */
    let LocalStrategy = require('passport-local').Strategy,
        User = require('mongoose').model('User');
    
    passport.serializeUser((user,done) => {
        done(null,user.id);
    });
    
    passport.deserializeUser((id,done) =>{
        User.findOne({_id:id}, '-password', (err,user) => {
            done(err,user); 
        });
    });
    
    passport.use(new LocalStrategy((username, password, done) => {
        User.findAndAuthenticate({username: username, password:password}, (err, user) =>{
            if(err){                
                return done(null,false, require("../../lib/utils/helpers").getErrorMessage(err));
            }
            return done(null,user);
        });
    }));

	return app;
};