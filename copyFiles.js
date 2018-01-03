var base = process.env.PWD;
console.log(base);

require('fs').writeFile(`${base}/major.txt`, 'message', err => {  
    if (err){
        console.log('LOG-ERR:', err);
    }
    console.log('LOG-SUCCESS');
});