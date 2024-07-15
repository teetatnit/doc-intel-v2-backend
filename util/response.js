
var response = {
  responseData: (req, res, next) => {
    var statusCode = typeof res.statusCode !== 'undefined' ? res.statusCode : 200
    var data = typeof res.data !== 'undefined' ? res.data : null
    // const method = (req.method) ? req.method : 'GET'
    // const cacheTime = (res.cacheTime) ? res.cacheTime : 10
    // if (statusCode === 200 && method === 'GET') {
    //   res.set('Cache-Control', 'public, max-age=' + cacheTime)
    // }
    res.status(statusCode)
    res.send(data)
  },
  responseDataJson: (req, res, next) => {
    const statusCode = typeof res.statusCode !== 'undefined' ? res.statusCode : 200
    const data = typeof res.data !== 'undefined' ? res.data : null
    // const method = (req.method) ? req.method : 'GET'
    // const cacheTime = (res.cacheTime) ? res.cacheTime : 10
    // if (statusCode === 200 && method === 'GET') {
    //   res.set('Cache-Control', 'public, max-age=' + cacheTime)
    // }
    res.status(statusCode)
    res.json(data)
  },
  errorHandle: (err, req, res, next) => {
    const status = err.status || 500
    res.status(status)
    res.json(err)
  }
}
module.exports = response
