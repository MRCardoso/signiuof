# A Node package to signin and signup

When this package is installer in your application, in your base path  'app/views',is copied the following views:
* **signin.ejs:** The view that render the interface to signin on application
* **signup.ejs:** The view that render the interface to create account on application
* **email.ejs:** The view that render the interface to sent the email with new password
* **reset.ejs:** The view that render the interface to reset password with token save in post of the request forgot
* **mail.html:** The default view with template html to sent email

The default engine template is '.ejs' to render the views
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
    // the template of view send mail
    view: "(default mail) The name of the view template to send email",
    rPath: "(default app/views) The base path when your view template is, the root is your own application"
    ext: "(default html) The extension of the view template"
    // the routes of this package
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

## User(default model)
* **Fields:**
    * **name:** The full name of the user
    * **email:** The email address of the user
    * **username:**(required) The username to auth in app
    * **password:**(required) The password the auth in app
    * **status:** (default true) The status of the user in app
    * **image:** The profile image of the user(is an Object when data of the image)
    * **authToken:** The token to authenticate in app by jwt(JSON WEB TOKEN)
    * **authTokenExpires:** The expires date of the authToken
    * **resetToken:** The token to reset the password
    * **resetExpires:** The expires date of the resetToken
    * **created:** (default Date.now())The date of the creating of this user
    
## Custom methods

## statics(used in the instance of the model User)

### E.g
```javascript
let User = require('mongoose').model('User');
// use arrow function
User.findByEmail('email@test.com', (err, user) => console.log(err, user));
```

* **findAndAuthenticate:** Find a user by username and validate password in hash
    * **credentials:** (object) The list of the credentials to find
    * **credentials.username:** (string) The username to be found
    * **credentials.password:** (string) The passowrd to be found
    * **next:** (function) The callback function called when success and fail

* **findByToken:** Find a user by your token to auth in the app
    * **token:** (string) The token of the user
    * **next:** (function) The callback function called when success and fail

* **findByEmail:**
    * **email:** (string) The email of the user
    * **next:** (function) The callback function called when success and fail

* **findByResetToken:** Find a user by your reset token
    * **token:** (string) the token to be load the user
    * **expires:**(int) the expires date
    * **next:** (function) The callback function called when success and fail
    
## methods(use in the object of the model)

### E.g
```javascript
let User = require('mongoose').model('User');
// use arrow function
User.findByEmail('email@test.com', (err, user) => {
    if(!err) throw err;
    
    user.authenticate('passwdtest', isMatch => console.log( isMatch ? 'valid': 'invalid'));
})
```

* **authenticate:** Method to verify if the password is valid
    * **password:** (string) The password of the user
    * **next:** (function) The callback function called when success and fail

* **updateToken:** Update the token and expires date of the load user
    * **token:** (string) The token to be save of the load user
    * **expires:** (int) The data of expiration for this token
    * **next:** (function) The callback function called when success and fail
    
* **updateResetToken:** Update the reset password token and expires date of the load user
    * **next:** (function) The callback function called when success and fail
    
* **updatePasswd:** Update the Password of a load user
    * **credentials:** (object) The list of the credentials to find
    * **credentials.password:** (string) The password to be updated
    * **credentials.confirmation:** (string) The password confirmation
    * **next:** (function) The callback function called when success and fail
   
* **setFillables:** Fill the fields of the model(availables name, email, username and status)
    * **post:** (object) The object with the post data to be updated
    * **post.username:** (string) The username to be update
    * **post.status:** (string) The status to be update
    * **post.name** (string) The name to be update
    * **post.email** (string) The email to be update
