let folder = "app/views";
let origin = `./example/${folder}/`;
let destination = `../../${folder}/`;
let fs = require("fs");
let shelljs = require("shelljs");
require('colors');

if( require("./lib/utils/helpers").getBasePath() != process.env.PWD )
{
    let walkSync = function(dir, fileItens){
        let files = fs.readdirSync(dir);
        fileItens = fileItens || [];

        files.forEach((file) => {
            if(fs.statSync(dir+file).isDirectory()){
                fileItens = walkSync(dir+file+"/", fileItens);
            }
            else{
                fileItens.push({destiny: (dir.replace(origin,'')), file: file});
            }
        });
        return fileItens;
    }
    let itens = walkSync(origin);

    itens.forEach(i =>
    {
        let f = (i.destiny != "" ? destination+i.destiny : destination);
        let d = `${f}${i.file}`;
        if( !fs.existsSync(d))
        {
            if(!fs.existsSync(f)){
                shelljs.mkdir("-p",f);
            }
        
            fs.copyFile(`${origin}${f}${i.file}`, d, err =>{
                if (err) {
                    console.log("erro in copy the files, try to copy manually the folder 'example/app'".red,err);
                } else {
                    console.log("Copy Success!".green);
                }
            })
        }
        else{
            console.log(`File ${d} already exists`.blue);
        }
    });
}
else{
    console.log("You are in the signiuof package".blue);
}