var companyModel = require('../model/companyModel')
module.exports = {
  getCompanyRaw: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await companyModel.getCompanyRaw()
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
  getCompany: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await companyModel.getCompany('Y', 'asc')
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
  // getCompanyByCode: async (req, res, next) => {
  //   var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
  //   var errMsg = null
  //   try {
  //     var result = await companyModel.getCompanyByCode(code, 'Y', 'asc')
  //     var data = []
  //     var statusCode = 200
  //     if (result.recordsets[0].length > 0) {
  //       data = result.recordsets[0]
  //     }
  //   } catch (error) {
  //     errMsg = {
  //       status: 400,
  //       message: 'something wrong'
  //     }
  //     console.log(error)
  //     next(errMsg)
  //   }
  //   res.statusCode = statusCode
  //   res.data = data
  //   next()
  // },
  updateCompany: async (req, res, next) => {
    var errMsg = null
    try {
      var companyCode = (typeof req.params.company_code !== 'undefined' ? req.params.company_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkCompany = await companyModel.checkCompanyByCode(companyCode, 'Y')
      if (checkCompany.recordsets[0].length > 0) {
        if (checkCompany.recordset[0].count > 0) {
          var companyUpdate = await companyModel.updateCompany(companyCode, reqBody.company_name, reqBody.business_unit_code, reqBody.update_by)
          if (companyUpdate !== null && companyUpdate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Update Success' }
          } else {
            data = { status: 'fail', message: 'Update Fail' }
          }
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
  insertCompany: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkCompany = await companyModel.checkCompanyByCode(reqBody.company_code, 'Y')
      if (checkCompany.recordsets[0].length > 0) {
        if (checkCompany.recordset[0].count === 0) {
          var companyCreate = await companyModel.insertCompany(reqBody.company_code, reqBody.company_name, reqBody.business_unit_code, reqBody.create_by)
          if (companyCreate !== null && companyCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
          }
        }else{
          data = { status: 'fail', message: 'Create Fail, Duplicate company code' }
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
  deleteCompany: async (req, res, next) => {
    var errMsg = null
    try {
      var companyCode = (typeof req.params.company_code !== 'undefined' ? req.params.company_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (companyCode !== null) {
        var masterDataUpdate = await companyModel.deleteCompanyByCompanyCode(companyCode, reqBody.is_active, reqBody.update_by)
        if (typeof masterDataUpdate.rowsAffected !== 'undefined' && masterDataUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Delete Success' }
        } else {
          data = { status: 'fail', message: 'Delete Fail' }
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
}