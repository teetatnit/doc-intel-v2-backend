var paymentTypeModel = require('../model/paymentTypeModel')
module.exports = {
  getPaymentType: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await paymentTypeModel.getPaymentType(code, 'asc')
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
  },
  // ***** 27/08/2021 Apiwat Emem Add Start ***** //
  getPaymentTypeByCompanyCode: async (req, res, next) => {
    var errMsg = null
    try {
      var company_code = (typeof req.query.company_code !== 'undefined' ? req.query.company_code : null)
      var data = []
      if (company_code !== null) {
        var result = await paymentTypeModel.getPaymentTypeByCompanyCode(company_code, 'asc')
        var statusCode = 200
        if (result.recordsets[0].length > 0) {
          data = result.recordsets[0]
        }
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
  },
  // ***** 27/08/2021 Apiwat Emem Add End ***** //
}