var http = require('../../../util/controllerHttp')
var config = require('../../../config/sitConfig')
var approverModel = require('../model/approverModel')

module.exports = {
  getApproverRaw: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await approverModel.getApproverRaw()
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
  getApproverByStartWithName: async (req, res, next) => {
    var prefix = (typeof req.query.prefix !== 'undefined' ? req.query.prefix : '')
    var data = []
    if (prefix.length > 2) {
      var data = []
      try {
        var mdmGetReference = config.mdmGetReference
        const params = new URLSearchParams()
        for (const key in mdmGetReference.body) {
          params.append(key, mdmGetReference.body[key])
        }
        mdmGetReference.header.ApplicationId = config.mdmConf.ApplicationId
        mdmGetReference.header.SecretKey = config.mdmConf.SecretKey
        var mdmRef = await http.httppostWithHeader(mdmGetReference.url, params, mdmGetReference.header, false, true)
        if (typeof mdmRef.access_token !== 'undefined') {
          var mdmMembersInfo = config.mdmMembersInfoByStartWithName
          mdmMembersInfo.body.referenceToken = mdmRef.access_token
          mdmMembersInfo.body.startWithName = prefix
          //var respMdmMembersInfo = await http.httppostWithHeader(mdmMembersInfo.url, mdmMembersInfo.body, mdmMembersInfo.header, true, true)
          var respMdmMembersInfo = await http.httppost(mdmMembersInfo.url, mdmMembersInfo.body, true, true)
          if (respMdmMembersInfo.responseData !== null && respMdmMembersInfo.responseBase.messageType === 0) {
            respMdmMembersInfo.responseData.forEach((item) => {
              var obj = {};
              obj["value"] = item.adAccount;
              obj["text"] = item.e_FullName
              data.push(obj)
            })
            res.data = data
          } else {
            console.log('something wrong [messageType = ' + respMdmMembersInfo.responseBase.messageTypeName +']')
            res.data = data
          }
        } else {
          console.log('something wrong [auth: access token]')
          res.data = data
        }
      } catch (error) {
        console.log('something wrong [auth]')
        res.data = data
      }
    } else {
      console.log('something wrong')
      res.data = data
    }
    next()
  },
  // ***** 06/05/2021 Apiwat Emem Add Start ***** //
  getApproverByAdAccount: async (req, res, next) => {
    var adAccount = (typeof req.query.adaccount !== 'undefined' ? req.query.adaccount : '')
    var data = []
    if (adAccount.length > 0) {
      var splitAdAccount = adAccount.split(",");
      var data = []

      for (var i=0; i<splitAdAccount.length; i++) {
        try {
          var mdmGetReference = config.mdmGetReference
          const params = new URLSearchParams()
          for (const key in mdmGetReference.body) {
            params.append(key, mdmGetReference.body[key])
          }
          mdmGetReference.header.ApplicationId = config.mdmConf.ApplicationId
          mdmGetReference.header.SecretKey = config.mdmConf.SecretKey
          var mdmRef = await http.httppostWithHeader(mdmGetReference.url, params, mdmGetReference.header, false, true)
          if (typeof mdmRef.access_token !== 'undefined') {
            var mdmMembersInfo = config.mdmMembersInfoByAdAccount
            mdmMembersInfo.body.referenceToken = mdmRef.access_token
            mdmMembersInfo.body.adAccount = splitAdAccount[i]
            var respMdmMembersInfo = await http.httppost(mdmMembersInfo.url, mdmMembersInfo.body, true, true)
            if (respMdmMembersInfo.responseData !== null && respMdmMembersInfo.responseBase.messageType === 0) {
              respMdmMembersInfo.responseData.forEach((item) => {
                var obj = {};
                obj["value"] = item.adAccount;
                obj["text"] = item.e_FullName
                data.push(obj)
              })
              res.data = data
            } else {
              console.log('something wrong [messageType = ' + respMdmMembersInfo.responseBase.messageTypeName +']')
              res.data = data
            }
          } else {
            console.log('something wrong [auth: access token]')
            res.data = data
          }
        } catch (error) {
          console.log('something wrong [auth]')
          res.data = data
        }
      }   
      
    } else {
      console.log('something wrong')
      res.data = data
    }
    next()
  },
  getApproverDbByStartWithName: async (req, res, next) => {
    var prefix = (typeof req.query.prefix !== 'undefined' ? req.query.prefix : '')
    var errMsg = null
    try {
      var result = await approverModel.getApproversByStartWithName(prefix, 'asc')
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
  getApproverDbByStartWithEmail: async (req, res, next) => {
    var prefix = (typeof req.query.prefix !== 'undefined' ? req.query.prefix : '')
    var errMsg = null
    try {
      var result = await approverModel.getApproversByStartWithEmail(prefix, 'asc')
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
  insertApprover: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkRreviewer = await approverModel.checkApproverByEmail(reqBody.email)
      if (checkRreviewer.recordsets[0].length > 0) {
        if (checkRreviewer.recordset[0].count === 0) {
          var reviewerCreate = await approverModel.insertApprover(reqBody.email, reqBody.name, reqBody.company_code, reqBody.division_code, reqBody.create_by)
          if (reviewerCreate !== null && reviewerCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Create Success' }
          } else {
            data = { status: 'fail', message: 'Create Fail' }
          }
        }else{
          data = { status: 'fail', message: 'Create Fail, Duplicate approver email' }
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
  updateApprover: async (req, res, next) => {
    var errMsg = null
    try {
      var userId = (typeof req.params.user_id !== 'undefined' ? req.params.user_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      var checkRreviewer = await approverModel.checkApproverByEmail(reqBody.email)
      if (checkRreviewer.recordsets[0].length > 0) {
        if (checkRreviewer.recordset[0].count > 0) {
          var reviewerUpdate = await approverModel.updateApprover(userId, reqBody.email, reqBody.name, reqBody.company_code, reqBody.division_code, reqBody.update_by)
          if (reviewerUpdate !== null && reviewerUpdate.rowsAffected.length > 0) {
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
  deleteApprover: async (req, res, next) => {
    var errMsg = null
    try {
      var userId = (typeof req.params.user_id !== 'undefined' ? req.params.user_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Delete Fail' }
      var statusCode = 200
      if (userId !== null) {
        var reviewerDelete = await approverModel.deleteApproverByUserId(userId, reqBody.is_active, reqBody.update_by)
        if (typeof reviewerDelete.rowsAffected !== 'undefined' && reviewerDelete.rowsAffected.length > 0) {
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