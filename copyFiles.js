let folder = "app/views";
let fs = require("fs");
let extra = require("fs-extra");

console.log(require("./lib/utils/helpers").getBasePath(), process.env.PWD);
// if( require("./lib/utils/helpers").getBasePath() != process.env.PWD ){
//     if( !fs.existsSync(`../../${folder}`) )
//     {
//         console.log("Init Copy");
//         extra.copy(`./example/${folder}`, `../../${folder}`, function (err) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log("Copy Success!");
//             }
//         });
//     }
//     else{
//         console.log(`Already exists ../../${folder}`);
//     }
// }