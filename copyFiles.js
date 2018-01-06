let folder = "app/views";
let fs = require("fs");
let extra = require("fs-extra");
let colors = require('colors');

if( require("./lib/utils/helpers").getBasePath() != process.env.PWD ){
    if( !fs.existsSync(`../../${folder}`) )
    {
        console.log("Init Copy".blue);
        extra.copy(`./example/${folder}`, `../../${folder}`, function (err) {
            if (err) {
                console.log("erro in copy the files, try to copy manually the folder 'example/app'".red,err);
            } else {
                console.log("Copy Success!".green);
            }
        });
    }
    else{
        console.log(`Already exists ../../${folder}`.blue);
    }
}
else{
    console.log("You are in the signiuof package".blue);
}