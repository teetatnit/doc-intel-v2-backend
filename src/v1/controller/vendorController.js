var vendorModel = require('../model/vendorModel')
module.exports = {
  getVendorRaw: async (req, res, next) => {
    var errMsg = null
    try {   
      var vendor = await vendorModel.getVendorRaw('ASC',)
      var data = []
      var statusCode = 200
      if (vendor.recordsets[0].length > 0) {
        data = vendor.recordsets[0]
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
  getVendor: async (req, res, next) => {
    var reqVendorCode = (typeof req.params.vendor_code !== 'undefined' ? req.params.vendor_code : null)
    var errMsg = null
    try {   
      var vendor = await vendorModel.getVendor(reqVendorCode, 'ASC', 'Y')
      var data = []
      var statusCode = 200
      if (vendor.recordsets[0].length > 0) {
        data = vendor.recordsets[0]
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
  updateVendor: async (req, res, next) => {
    var errMsg = null
    try {
      var vendorCode = (typeof req.params.vendor_code !== 'undefined' ? req.params.vendor_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkVendor = await vendorModel.checkVendorByCode(vendorCode)
      if (checkVendor.recordsets[0].length > 0) {
        if (checkVendor.recordset[0].count > 0) {
          var companyUpdate = await vendorModel.updateVendor(vendorCode, reqBody.name, reqBody.update_by)
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
  insertVendor: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkVendor = await vendorModel.checkVendorByCode(reqBody.code)
      if (checkVendor.recordsets[0].length > 0) {
        if (checkVendor.recordset[0].count === 0) {
          var companyCreate = await vendorModel.insertVendor(reqBody.code, reqBody.name, reqBody.create_by)
          if (companyCreate !== null && companyCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
          }
        }else{
          data = { status: 'fail', message: 'Create Fail, Duplicate vendor code' }
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
  deleteVendor: async (req, res, next) => {
    var errMsg = null
    try {
      var vendorCode = (typeof req.params.vendor_code !== 'undefined' ? req.params.vendor_code : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (vendorCode !== null) {
        var masterDataUpdate = await vendorModel.deleteVendorByVendorCode(vendorCode, reqBody.is_active, reqBody.update_by)
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
