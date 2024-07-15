var numberStyleModel = require('../model/numberStyleModel')
module.exports = {
  getNumberStyle: async (req, res, next) => {
    var id = (typeof req.params.id !== 'undefined' ? req.params.id : null)
    var errMsg = null
    try {
      var result = await numberStyleModel.getNumberStyle(id, 'asc')
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  }
}