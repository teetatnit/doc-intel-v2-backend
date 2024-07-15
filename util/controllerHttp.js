const fetch = require('node-fetch')
module.exports = {

  httppost: (URI, DATA, JSONT = true, OUTJSON = true) => {
    const postDATA = (JSONT === false ? DATA : JSON.stringify(DATA))
    const contentType = (JSONT === false ? 'text/plain' : 'application/json')
    return fetch(URI, {
      method: 'POST',
      body: postDATA,
      headers: {
        'Content-Type': contentType
      }
    })
      .then(function (res) {
        return (OUTJSON === true ? res.json() : res.text())
      }).then(function (json) {
        return json
      }).catch(function (err) {
        return err
      })
  },
  httppostWithHeader: (URI, DATA, HEADERS = null, DATAJSON = true, OUTJSON = true) => {
    const postDATA = (DATAJSON === false ? DATA : JSON.stringify(DATA))
    return fetch(URI, {
      method: 'POST',
      headers: HEADERS,
      body: postDATA
    })
      .then(function (res) {
        return (OUTJSON === true ? res.json() : res.text())
      }).then(function (json) {
        return json
      }).catch(function (err) {
        return err
      })
  },
  httpputWithHeader: (URI, DATA, HEADERS = null, DATAJSON = true, OUTJSON = true) => {
    const postDATA = (DATAJSON === false ? DATA : JSON.stringify(DATA))
    return fetch(URI, {
      method: 'PUT',
      headers: HEADERS,
      body: postDATA
    })
      .then(function (res) {
        return (OUTJSON === true ? res.json() : res.text())
      }).then(function (json) {
        return json
      }).catch(function (err) {
        return err
      })
  },

  httpget: (URI) => {
    return fetch(URI, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(function (res) {
        return res.json()
      }).then(function (json) {
        return json
      }).catch(function (err) {
        return err
      })
  }
}
