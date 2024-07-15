var masterDataModel = require('../model/masterDataModel')
var favoriteModel = require('../model/favoriteModel')

module.exports = {
  getMasterdatasByModelTemplateId: async (req, res, next) => {
    var errMsg = null
    try {
      var modelTemplateId = (typeof req.params.model_template_id !== 'undefined' ? req.params.model_template_id : null)
      var masterDataItem = await masterDataModel.getMasterdatasByModelTemplateId(modelTemplateId)
      var data = []
      var statusCode = 200
      if (masterDataItem.recordsets[0].length > 0) {
        data = masterDataItem.recordsets[0]
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
  getMasterData: async (req, res, next) => {
    var errMsg = null
    try {
      var reqMasterDataId = (typeof req.params.masterdata_id !== 'undefined' ? req.params.masterdata_id : null)
      var sort = (typeof req.query.sort !== 'undefined' && req.query.sort.toLowerCase() === 'asc' ? 'asc' : 'desc')
      // ***** 05/05/2021 Apiwat Emem Modify Start ***** //
      var email = (typeof req.query.email !== 'undefined' ? req.query.email : '')
      var masterData = await masterDataModel.getMasterData(reqMasterDataId, email, sort, 'Y')
      // ***** 05/05/2021 Apiwat Emem Modify Start ***** //
      var data = []
      var statusCode = 200
      if (masterData.recordsets[0].length > 0) {
        data = masterData.recordsets[0]
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
  getMasterDataItem: async (req, res, next) => {
    var errMsg = null
    try {
      var reqMasterDataId = (typeof req.params.masterdata_id !== 'undefined' ? req.params.masterdata_id : null)
      var masterDataItem = await masterDataModel.getMasterDataItem(reqMasterDataId, 'asc', 'Y', 'Y')
      var data = []
      var statusCode = 200
      if (masterDataItem.recordsets[0].length > 0) {
        data = masterDataItem.recordsets[0]
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
  insertMasterData: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Fail' }
      var statusCode = 200
      var checkMasterData = await masterDataModel.checkMasterData(null, reqBody.document_code, reqBody.vendor_code, reqBody.additional_info, 'Y')
      if (checkMasterData.recordsets[0].length > 0) {
        if (checkMasterData.recordset[0].count === 0) {
          // create and copy master data
          var masterDataCreate = await masterDataModel.createMasterData(reqBody.document_code, reqBody.vendor_code, reqBody.additional_info, reqBody.number_style_id, reqBody.model_id, reqBody.model_template_id, reqBody.ai_prompt, reqBody.day_auto_duedate, reqBody.create_by)
          if (masterDataCreate !== null && masterDataCreate.rowsAffected.length > 0) {
            var masterDataItemCreate = await masterDataModel.createMasterDataItem(masterDataCreate.recordset[0].id, reqBody.items)
            if (masterDataItemCreate !== null && masterDataItemCreate.rowsAffected.length > 0) {
              var favoriteCreate = await favoriteModel.upsertFavorite(masterDataCreate.recordset[0].id, true, reqBody.create_by)
              if (favoriteCreate !== null && favoriteCreate.rowsAffected.length > 0) {
                data = { status: 'success', message: reqBody.state + ' Success' }
              } else {
                data = { status: 'fail', message: reqBody.state + ' Fail' }
              }
            }
            else {
              data = { status: 'fail', message: reqBody.state + ' Fail' }
            }
          } else {
            data = { status: 'fail', message: reqBody.state + ' Fail' }
          }
        } else {
          data = { status: 'fail', message: reqBody.state + ' Fail Duplicate Master Data' }
        }
      } else {
        data = { status: 'fail', message: reqBody.state + ' Fail' }
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
  deleteMasterData: async (req, res, next) => {
    var errMsg = null
    try {
      var reqMasterDataId = (typeof req.params.masterdata_id !== 'undefined' ? req.params.masterdata_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (reqMasterDataId !== null) {
        var masterDataUpdate = await masterDataModel.deleteMasterDataByMasterDataId(reqMasterDataId, reqBody.is_active, reqBody.update_by)
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
  updateMasterData: async (req, res, next) => {
    var errMsg = null
    try {
      var reqMasterDataId = (typeof req.params.masterdata_id !== 'undefined' ? req.params.masterdata_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Fail' }
      var statusCode = 200
      if (reqMasterDataId !== null) {
        var checkMasterData = await masterDataModel.checkMasterData(reqMasterDataId, reqBody.document_code, reqBody.vendor_code, reqBody.additional_info, 'Y')
        if (checkMasterData.recordsets[0].length > 0) {
          if (checkMasterData.recordset[0].count === 0) {
            var masterDataUpdate = await masterDataModel.updateMasterData(reqMasterDataId, reqBody.additional_info, reqBody.number_style_id, reqBody.ai_prompt, reqBody.day_auto_duedate, reqBody.update_by)
            if (masterDataUpdate !== null && masterDataUpdate.rowsAffected.length > 0) {
              var masterDataItemUpdate = await masterDataModel.upsertMasterDataItem(reqMasterDataId, reqBody.items)
              if (masterDataItemUpdate !== null && masterDataItemUpdate.rowsAffected.length > 0) {
                var masterDataItemDelete = await masterDataModel.deleteMasterDataItem(reqMasterDataId, reqBody.delete_items)
                if (masterDataItemDelete !== null) {
                  data = { status: 'success', message: 'Update Success' }
                } else {
                  data = { status: 'fail', message: 'Update Fail' }
                }
              } else {
                data = { status: 'fail', message: 'Update Fail' }
              }
            } else {
              data = { status: 'fail', message: 'Update Fail' }
            }
          } else {
            data = { status: 'fail', message: 'Update Fail Duplicate Master Model' }
          }

        } else {
          data = { status: 'fail', message: 'Update Fail' }
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
  // ***** 07/05/2021 Apiwat Emem Modify Start ***** //
  getVendorByDocumentCode: async (req, res, next) => {
    var errMsg = null
    try {
      var reqDocumentCode = (typeof req.params.document_code !== 'undefined' ? req.params.document_code : null)
      var masterData = await masterDataModel.getVendorByDocumentCode(reqDocumentCode, 'asc', 'Y', req.cur_user)
      var data = []
      var statusCode = 200
      if (masterData.recordsets[0].length > 0) {
        data = masterData.recordsets[0]
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
  // ***** 07/05/2021 Apiwat Emem Modify End ***** //
  getAdditionalInfoByDocumentCodeVendorCode: async (req, res, next) => {
    var errMsg = null
    try {
      var reqDocumentCode = (typeof req.params.document_code !== 'undefined' ? req.params.document_code : null)
      var reqVendorCode = (typeof req.params.vendor_code !== 'undefined' ? req.params.vendor_code : null)
      var masterData = await masterDataModel.getAdditionalInfoByDocumentCodeVendorCode(reqDocumentCode, reqVendorCode, 'asc', 'Y', req.cur_user)
      var data = []
      var statusCode = 200
      if (masterData.recordsets[0].length > 0) {
        data = masterData.recordsets[0]
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

  // ***** 10/Oct/2022 Kittichai R. Add train model Start ***** //
  getMasterDataItemsByModelTemplateId: async (req, res, next) => {
    var errMsg = null
    try {
      var model_template_id = typeof req.params.model_template_id !== 'undefined' && req.params.model_template_id !== 'null' ? req.params.model_template_id : null
      var masterData = await masterDataModel.getMasterDataItemsByModelTemplateId(model_template_id, 'ASC', 'Y')
      var data = []
      var statusCode = 200
      if (masterData.recordsets[0].length > 0) {
        data = masterData.recordsets[0]
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
  getBusinessPartnerByDocumentCode: async (req, res, next) => {
    var errMsg = null
    try {
      var document_code = typeof req.params.document_code !== 'undefined' && req.params.document_code !== 'null' ? req.params.document_code : null
      var masterData = await masterDataModel.getBusinessPartnerByDocumentCode(document_code, 'ASC', 'Y')
      var data = []
      var statusCode = 200
      if (masterData.recordsets[0].length > 0) {
        data = masterData.recordsets[0]
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
  getAdditionalInfoByDocumentCodeBusinessPartnerCode: async (req, res, next) => {
    var errMsg = null
    try {
      var document_code = typeof req.params.document_code !== 'undefined' && req.params.document_code !== 'null' ? req.params.document_code : null
      var partner_code = typeof req.params.partner_code !== 'undefined' && req.params.partner_code !== 'null' ? req.params.partner_code : null
      var masterData = await masterDataModel.getAdditionalInfoByDocumentCodeBusinessPartnerCode(document_code, partner_code, 'ASC', 'Y')
      var data = []
      var statusCode = 200
      if (masterData.recordsets[0].length > 0) {
        data = masterData.recordsets[0]
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
  // ***** 10/Oct/2022 Kittichai R. Add train model End ***** //
}
