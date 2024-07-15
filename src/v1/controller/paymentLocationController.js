/*
Creator:            Apiwat Emem
Creation date:      21/06/2021
*/

var paymentLocationModel = require('../model/paymentLocationModel')
module.exports = {
  getPaymentLocation: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await paymentLocationModel.getPaymentLocation(code, 'asc')
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
  getPaymentLocationByPaymentTypeCode: async (req, res, next) => {
    var errMsg = null
    try {
      var paymenttype_code = (typeof req.query.paymenttype_code !== 'undefined' ? req.query.paymenttype_code : null)
      var data = []
      if (paymenttype_code !== null) {
        var result = await paymentLocationModel.getPaymentLocationByPaymentTypeCode(paymenttype_code, 'asc')
        var statusCode = 200
        if (result.recordsets[0].length > 0) {
          data = result.recordsets[0]
        }
      } else {
        var result = await paymentLocationModel.getPaymentLocation(null, 'asc')
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
  // ***** 27/08/2021 Apiwat Emem Add Start ***** //
  getPaymentLocationByPaymentTypeCodeCompanyCode: async (req, res, next) => {
    var errMsg = null
    try {
      var paymenttype_code = (typeof req.query.paymenttype_code !== 'undefined' ? req.query.paymenttype_code : null)
      var company_code = (typeof req.query.company_code !== 'undefined' ? req.query.company_code : null)
      var data = []
      if (paymenttype_code !== null) {
        if (company_code !== null){
          var result = await paymentLocationModel.getPaymentLocationByPaymentTypeCodeCompanyCode(paymenttype_code, company_code, 'asc')
          var statusCode = 200
          if (result.recordsets[0].length > 0) {
            data = result.recordsets[0]
          }
        } else {
          var result = await paymentLocationModel.getPaymentLocationByPaymentTypeCode(paymenttype_code, 'asc')
          var statusCode = 200
          if (result.recordsets[0].length > 0) {
            data = result.recordsets[0]
          }
        } 
      } else {
        var result = await paymentLocationModel.getPaymentLocation(null, 'asc')
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