/*
Creator:            Apiwat Emem
Creation date:      13/05/2021
*/

var grApprovalForModel = require('../model/grApprovalForModel')
module.exports = {
  getGRApprovalFor: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await grApprovalForModel.getGRApprovalFor(code, 'asc')
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
  getGRApprovalForByCompanyCode: async (req, res, next) => {
    var errMsg = null
    try {
      var company_code = (typeof req.query.company_code !== 'undefined' ? req.query.company_code : null)
      var data = []
      if (company_code !== null) {
        var result = await grApprovalForModel.getGRApprovalForByCompanyCode(company_code, 'asc')
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