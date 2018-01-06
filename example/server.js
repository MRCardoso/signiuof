let port = 3000;

let app = require('./config/express')();

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
