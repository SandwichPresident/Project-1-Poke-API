const handleResponse = async (response) => {
    const statusDiv = document.querySelector('#status');
    const contentPre = document.querySelector('#content');

    statusDiv.textContent = `Status Code: ${response.status}`;

    if (response.status === 204) {
        contentPre.textContent = 'Updated successfully (204 No Content).';
        return;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        contentPre.textContent = JSON.stringify(json, null, 2);
    } else {
        contentPre.textContent = 'Received non-JSON response.';
    }
};

const sendFetch = async (url, method, bodyObj = null) => {
    const options = {
        method,
        headers: {
            Accept: 'application/json',
        },
    };

    if (bodyObj) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(bodyObj);
    }

    const response = await fetch(url, options);
    handleResponse(response);
};

const init = () => {
    const getPokemonForm = document.querySelector('#getPokemonForm');
    const addPokemonForm = document.querySelector('#addPokemonForm');
    const updatePokemonForm = document.querySelector('#updatePokemonForm');
    const btnRandom = document.querySelector('#btnRandom');
    const btnTypes = document.querySelector('#btnTypes');

    getPokemonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.querySelector('#typeSelect').value;
        const weakness = document.querySelector('#weaknessSelect').value;
        const limit = document.querySelector('#limitSelect').value;

        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (weakness) params.append('weakness', weakness);
        if (limit) params.append('limit', limit);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        sendFetch(`/api/pokemon${queryString}`, 'GET');
    });

    addPokemonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.querySelector('#addName').value;
        const type = document.querySelector('#addType').value;
        const height = document.querySelector('#addHeight').value;
        const weight = document.querySelector('#addWeight').value;

        sendFetch('/api/add-pokemon', 'POST', { name, type, height, weight });
    });

    updatePokemonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.querySelector('#updateId').value;
        const name = document.querySelector('#updateName').value;
        const height = document.querySelector('#updateHeight').value;

        sendFetch('/api/update-pokemon', 'POST', { id, name, height });
    });

    btnRandom.addEventListener('click', () => sendFetch('/api/pokemon/random', 'GET'));
    btnTypes.addEventListener('click', () => sendFetch('/api/types', 'GET'));
};

window.onload = init;