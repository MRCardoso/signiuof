let open = require("open"),
    port = 3000;

let app = require('./config/express')();

open(`http://localhost:${port}`);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
