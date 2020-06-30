const http = require('http');
const server = http.createServer((req , res)=>{
    res.writeHead(200,{
        'Content-Type' : 'text/html' //'text/plain'純文字顯示
    });
    res.end(`
    <h1>Hola</h1>
    <h2>${req.url}</h2>    
    `);
});

server.listen(3000);    