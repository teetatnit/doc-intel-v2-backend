var divisionModel = require('../model/divisionModel')
module.exports = {
  getDivision: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await divisionModel.getDivision('Y', 'asc')
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
  updateDivision: async (req, res, next) => {
    var errMsg = null
    try {
      var divisionCode = (typeof req.params.division_code !== 'undefined' ? req.params.division_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkDivision = await divisionModel.checkDivisionByCode(divisionCode, 'Y')
      if (checkDivision.recordsets[0].length > 0) {
        if (checkDivision.recordset[0].count > 0) {
          var companyUpdate = await divisionModel.updateDivision(divisionCode, reqBody.division_name, reqBody.update_by)
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
  insertDivision: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkDivision = await divisionModel.checkDivisionByCode(reqBody.division_code, 'Y')
      if (checkDivision.recordsets[0].length > 0) {
        if (checkDivision.recordset[0].count === 0) {
          var companyCreate = await divisionModel.insertDivision(reqBody.division_code, reqBody.division_name, reqBody.create_by)
          if (companyCreate !== null && companyCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
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
  deleteDivision: async (req, res, next) => {
    var errMsg = null
    try {
      var divisionCode = (typeof req.params.division_code !== 'undefined' ? req.params.division_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (divisionCode !== null) {
        var masterDataUpdate = await divisionModel.deleteDivisionByDivisionCode(divisionCode, reqBody.is_active, reqBody.update_by)
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
