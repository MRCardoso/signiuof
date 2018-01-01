require('fs').writeFile('test.txt', 'message', (err,d) => {  
    if (err){
        console.log('LOG-ERR:', err);
    }
    console.log('LOG-SUCCESS:', d);
});