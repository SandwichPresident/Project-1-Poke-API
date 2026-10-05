const http = require('http');
const query = require('querystring');
const jsonHandler = require('./jsonResponses');

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


const onRequest = (request, response) => {
    const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
    const pathname = parsedUrl.pathname;
    const params = parsedUrl.searchParams;

    if (request.method === 'POST') {
        parseBody(request, (body) => {
            if (pathname === '/api/add-pokemon') {
                jsonHandler.addPokemon(request, response, body);
            } else if (pathname === '/api/update-pokemon') {
                jsonHandler.updatePokemon(request, response, body);
            } else {
                jsonHandler.notFound(request, response);
            }
        });
        return;
    }

    if (request.method === 'GET' || request.method === 'HEAD') {
        if (pathname === '/' || pathname === '/api/pokemon') {
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
        return;
    }

    jsonHandler.notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
    console.log(`Server listening on 127.0.0.1:${port}`);
});