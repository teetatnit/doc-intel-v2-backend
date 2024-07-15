var masterFieldModel = require('../model/masterFieldModel')
module.exports = {
  getMasterField: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await masterFieldModel.getMasterField('asc', 'Y', 'Y')
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