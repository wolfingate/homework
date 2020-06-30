const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) => {
    fs.writeFile(__dirname + '/header01.json',
        JSON.stringify(req.headers),
        (error) => {
            if (error) {
                console.log('error:', error);
                res.end(error);

            }
            else {
                console.log('OK');
                res.end('ok');
            }
        })



});

server.listen(3000);    