import config from '../config';

const apiService = {
  getPeopleInLine() {
    return fetch(`${config.REACT_APP_API_BASE}/people`)
      .then(res =>
        (!res.ok)
          ? res.json().then(e => Promise.reject(e))
          : res.json()
      )
  },

  addPerson(name) {
    return fetch(`${config.REACT_APP_API_BASE}/people`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
      .then(res =>
        (!res.ok)
          ? res.json().then(e => Promise.reject(e))
          : res.json()
      )
  },

  adopt(type) {
    return fetch(`${config.REACT_APP_API_BASE}/${type}`, {
      method: 'DELETE'
    })
      .then(res =>
        (!res.ok)
          ? res.json().then(e => Promise.reject(e))
          : res.json()
      )
  },

  getNextPet(type) {
    return fetch(`${config.REACT_APP_API_BASE}/${type}`)
      .then(res =>
        (!res.ok)
          ? res.json().then(e => Promise.reject(e))
          : res.json()
      )
  }
};

export default apiService;