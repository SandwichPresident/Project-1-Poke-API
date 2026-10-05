const fs = require('fs');
const path = require('path');


const rawData = fs.readFileSync(path.resolve(__dirname, '../pokedex.json'));
let pokemonList = JSON.parse(rawData);

// Helper function to compose and send JSON responses
const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  };

  response.writeHead(status, headers);


  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }
  response.end();
};


const getPokemon = (request, response, params) => {
  let results = [...pokemonList];

  if (params.get('type')) {
    const filterType = params.get('type').toLowerCase();
    results = results.filter((p) => p.type.some((t) => t.toLowerCase() === filterType));
  }

  if (params.get('weakness')) {
    const filterWeakness = params.get('weakness').toLowerCase();
    results = results.filter((p) => p.weaknesses && p.weaknesses.some((w) => w.toLowerCase() === filterWeakness));
  }

  if (params.get('limit')) {
    const limit = parseInt(params.get('limit'), 10);
    if (!isNaN(limit) && limit > 0) {
      results = results.slice(0, limit);
    }
  }

  const responseObj = {
    message: `Retrieved ${results.length} Pokémon.`,
    count: results.length,
    data: results,
  };

  return respondJSON(request, response, 200, responseObj);
};


const getPokemonById = (request, response, params) => {
  const idStr = params.get('id');

  if (!idStr) {
    return respondJSON(request, response, 400, {
      id: 'badRequest',
      message: 'Missing required query parameter "id".',
    });
  }

  const id = parseInt(idStr, 10);
  const found = pokemonList.find((p) => p.id === id);

  if (!found) {
    return respondJSON(request, response, 404, {
      id: 'notFound',
      message: `No Pokémon found with ID ${id}.`,
    });
  }

  return respondJSON(request, response, 200, { data: found });
};


const getRandomPokemon = (request, response) => {
  const randomIndex = Math.floor(Math.random() * pokemonList.length);
  const randomMon = pokemonList[randomIndex];

  return respondJSON(request, response, 200, { data: randomMon });
};


const getTypes = (request, response) => {
  const typesSet = new Set();
  pokemonList.forEach((p) => {
    if (p.type && Array.isArray(p.type)) {
      p.type.forEach((t) => typesSet.add(t));
    }
  });

  return respondJSON(request, response, 200, {
    count: typesSet.size,
    data: Array.from(typesSet),
  });
};


const addPokemon = (request, response, body) => {
  if (!body.name || !body.type) {
    return respondJSON(request, response, 400, {
      id: 'addPokemonMissingParams',
      message: 'Name and type parameters are required.',
    });
  }

  const newId = pokemonList.length > 0 ? Math.max(...pokemonList.map((p) => p.id)) + 1 : 1;
  const newNum = String(newId).padStart(3, '0');
  const typesArray = Array.isArray(body.type)
    ? body.type
    : body.type.split(',').map((t) => t.trim());

  const newPokemon = {
    id: newId,
    num: newNum,
    name: body.name,
    img: body.img || `http://www.serebii.net/pokemongo/pokemon/${newNum}.png`,
    type: typesArray,
    height: body.height || '1.00 m',
    weight: body.weight || '10.0 kg',
    weaknesses: body.weaknesses
      ? (Array.isArray(body.weaknesses) ? body.weaknesses : body.weaknesses.split(',').map((w) => w.trim()))
      : [],
  };

  pokemonList.push(newPokemon);

  return respondJSON(request, response, 201, {
    message: 'Pokémon created successfully.',
    data: newPokemon,
  });
};


const updatePokemon = (request, response, body) => {
  if (!body.id) {
    return respondJSON(request, response, 400, {
      id: 'updatePokemonMissingId',
      message: 'Parameter "id" is required to update a Pokémon.',
    });
  }

  const targetId = parseInt(body.id, 10);
  const index = pokemonList.findIndex((p) => p.id === targetId);

  if (index === -1) {
    return respondJSON(request, response, 404, {
      id: 'notFound',
      message: `Pokémon with ID ${targetId} not found.`,
    });
  }

  const existing = pokemonList[index];
  if (body.name) existing.name = body.name;
  if (body.height) existing.height = body.height;
  if (body.weight) existing.weight = body.weight;
  if (body.type) {
    existing.type = Array.isArray(body.type) ? body.type : body.type.split(',').map((t) => t.trim());
  }


  return respondJSON(request, response, 204, {});
};


const notFound = (request, response) => respondJSON(request, response, 404, {
  id: 'notFound',
  message: 'The page or endpoint you are looking for was not found.',
});

module.exports = {
  getPokemon,
  getPokemonById,
  getRandomPokemon,
  getTypes,
  addPokemon,
  updatePokemon,
  notFound,
};