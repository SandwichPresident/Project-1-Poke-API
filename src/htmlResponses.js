const fs = require('fs');
const path = require('path');

const index = fs.readFileSync(path.resolve(__dirname, '../client/index.html'));
const docs = fs.readFileSync(path.resolve(__dirname, '../client/docs.html'));
const css = fs.readFileSync(path.resolve(__dirname, '../client/style.css'));
const clientJs = fs.readFileSync(path.resolve(__dirname, '../client/client.js'));

const serveFile = (request, response, content, contentType) => {
    const headers = {
        'Content-Type': contentType,
        'Content-Length': Buffer.byteLength(content),
    };
    response.writeHead(200, headers);
    if (request.method !== 'HEAD') {
        response.write(content);
    }
    response.end();
};

const getIndex = (request, response) => serveFile(request, response, index, 'text/html');
const getDocs = (request, response) => serveFile(request, response, docs, 'text/html');
const getCSS = (request, response) => serveFile(request, response, css, 'text/css');
const getClientJS = (request, response) => serveFile(request, response, clientJs, 'application/javascript');

module.exports = {
    getIndex,
    getDocs,
    getCSS,
    getClientJS,
};