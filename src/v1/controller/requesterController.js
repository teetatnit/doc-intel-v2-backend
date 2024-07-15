var http = require('../../../util/controllerHttp')
var config = require('../../../config/sitConfig')
var requesterModel = require('../model/requesterModel')

module.exports = {
  getRequesterRaw: async (req, res, next) => {
    var errMsg = null
    try {
      var result = await requesterModel.getRequesterRaw()
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
  getRequesterByStartWithName: async (req, res, next) => {
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
  getRequesterByAdAccount: async (req, res, next) => {
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
  getRequesterDbByStartWithName: async (req, res, next) => {
    var prefix = (typeof req.query.prefix !== 'undefined' ? req.query.prefix : '')
    var errMsg = null
    try {
      var result = await requesterModel.getRequestersByStartWithName(prefix, 'asc')
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
  getRequesterDbByStartWithEmail: async (req, res, next) => {
    var prefix = (typeof req.query.prefix !== 'undefined' ? req.query.prefix : '')
    var errMsg = null
    try {
      var result = await requesterModel.getRequestersByStartWithEmail(prefix, 'asc')
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
  // ***** 06/05/2021 Apiwat Emem Add End ***** //
}