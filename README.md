# A Node package to signin and signup

When this package is installer in your application, in your base path  'app/views',is copied the following views:
* **signin.ejs:** The view that render the interface to signin on application
* **signup.ejs:** The view that render the interface to create account on application
* **email.ejs:** The view that render the interface to sent the email with new password
* **reset.ejs:** The view that render the interface to reset password with token save in post of the request forgot

# Installation

```
$ npm install signiuof
```

## Require modules

```javascript
let signiuof = require('signiuof');
// Required configurations configs used in the package
let iuof = signiuof.Iuof({
    appName: '(default Default site) The name of the app',
    // required to enabled the sent of email in reset password
    serviceMail: "(Required)the service to send email(e.g: Gmail)",
    loginMail: "(Required)your login of the service of email",
    passMail: "(Required)your password of the service of email",
    signin: '(default /signin) The request used in the signin',
    signup: '(default /signup) The request used in the signup',
    signout: '(default /signout) The request used in the signout',
    forgot: '(default /forgot) The request used in the forgot',
    reset: '(default /reset/:token) The request used in the reset',
    passwdChange: '(default /changePassword) The request used in the changePassword',
});
```

## available methods

### routes(main)

The method that implement the list of request to signin in your application

* **app:** The instance of the 'express' package, to register the required request of this package

This method register the requests below to enabled in your app, the interfaces and request to create a simple auth:
* **signin:** The requests, GET to render view signin and POST submit for the authentication
* **signup:** The requests, GET to render view singup and POST submit for create a account
* **forgot:** The requests, GET to render view email and POST submit for update token to recovery password and sent in email
* **reset:** The requests, GET to render view reset and POST submit for update your password and authenticate
* **passwdChange:** The POST request to change your password, when authenticated

#### E.g
```javascript
let express = require('express')
let app = express();
// star the default routes
iuof.routes(app);
```

### connectMongo(main)

Start the connection with the mongodb and load the models of your app(the user is loaded by default)

* **config:** The Object with the configuration of the mongo connection
  * **db:** The path of the local db(e.g: mongodb://localhost/your-db-name)
  * **options:** set in the second argument of the 'mongoose.connect()'
  
#### E.g
```javascript
iuof.connectMongo(require(PATH_TO_YOUR_CONFIG), function(db){
    // add the list of the models that you require
    require(PATH_TO_YOUR_MODEL);
    return db;
});
```

### middlewares(helper)

The default middlewares use in the package and available for your application too

* **requireLogin(request,response, next):** The middleware to validate of the user is logged
* **isVisitant(request,response, next):** The middlware to validate of the user is not logged
* **requireResetToken(request,response, next):** The middleware to validate of the token is valid

#### E.g
```javascript
app.route('/api/users').get(iuof.middlewares.requireLogin, user.list);
```
