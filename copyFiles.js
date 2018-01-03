var base = process.env.INIT_PWD;
console.log(base);

require('fs').writeFile(`${base}/major.txt`, 'message', err => {  
    if (err){
        console.log('LOG-ERR:', err);
    }
    console.log('LOG-SUCCESS');
});