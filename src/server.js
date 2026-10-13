const http = require('http');
const query = require('querystring');
const jsonHandler = require('./jsonResponses');
const htmlHandler = require('./htmlResponses');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const parseBody = (request, callback) => {
    const bodyChunks = [];

    request.on('data', (chunk) => {
        bodyChunks.push(chunk);
    });

    request.on('end', () => {
        const bodyString = Buffer.concat(bodyChunks).toString();
        const contentType = request.headers['content-type'] || '';

        let parsedBody = {};
        if (bodyString.length > 0) {
            if (contentType.includes('application/json')) {
                try {
                    parsedBody = JSON.parse(bodyString);
                } catch {
                    parsedBody = {};
                }
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                parsedBody = query.parse(bodyString);
            }
        }

        callback(parsedBody);
    });
};

const handlePost = (request, response, pathname) => {
    parseBody(request, (body) => {
        if (pathname === '/api/add-pokemon') {
            jsonHandler.addPokemon(request, response, body);
        } else if (pathname === '/api/update-pokemon') {
            jsonHandler.updatePokemon(request, response, body);
        } else {
            jsonHandler.notFound(request, response);
        }
    });
};

const handleGetHead = (request, response, pathname, params) => {
    if (pathname === '/') {
        htmlHandler.getIndex(request, response);
    } else if (pathname === '/docs' || pathname === '/docs.html') {
        htmlHandler.getDocs(request, response);
    } else if (pathname === '/style.css') {
        htmlHandler.getCSS(request, response);
    } else if (pathname === '/client.js') {
        htmlHandler.getClientJS(request, response);
    } else if (pathname === '/api/pokemon') {
        jsonHandler.getPokemon(request, response, params);
    } else if (pathname === '/api/pokemon/by-id') {
        jsonHandler.getPokemonById(request, response, params);
    } else if (pathname === '/api/pokemon/random') {
        jsonHandler.getRandomPokemon(request, response);
    } else if (pathname === '/api/types') {
        jsonHandler.getTypes(request, response);
    } else {
        jsonHandler.notFound(request, response);
    }
};

const onRequest = (request, response) => {
    const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = parsedUrl.pathname;
    const params = parsedUrl.searchParams;

    if (request.method === 'POST') {
        handlePost(request, response, pathname);
    } else if (request.method === 'GET' || request.method === 'HEAD') {
        handleGetHead(request, response, pathname, params);
    } else {
        jsonHandler.notFound(request, response);
    }
};

http.createServer(onRequest).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
});