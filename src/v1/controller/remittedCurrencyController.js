/*
Creator:            Apiwat Emem
Creation date:      27/05/2021
*/

var remittedCurrencyModel = require('../model/remittedCurrencyModel')
module.exports = {
  getRemittedCurrency: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await remittedCurrencyModel.getRemittedCurrency(code, 'asc')
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