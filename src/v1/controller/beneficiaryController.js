/*
Creator:            Apiwat Emem
Creation date:      06/05/2021
*/

var beneficiaryModel = require('../model/beneficiaryModel')
var logger = require('../../../util/logger4js')

const beneficiaryList = [
  { fileFieldName: null, databaseFieldName: "code" },
  { fileFieldName: "Vendor Code", databaseFieldName: "vendor_code" },
  { fileFieldName: "Account No", databaseFieldName: "accountno" },
  { fileFieldName: "Beneficiary Code", databaseFieldName: "beneficiarycode" },
  { fileFieldName: "Beneficiary Name", databaseFieldName: "beneficiaryname" },
  { fileFieldName: "Beneficiary Address", databaseFieldName: "beneficiaryaddress" },
  { fileFieldName: "Beneficiary Country", databaseFieldName: "beneficiarycountrycode" },
  { fileFieldName: "ABA No", databaseFieldName: "abano" },
  { fileFieldName: "IBAN No", databaseFieldName: "ibanno" },
  { fileFieldName: "BSB Number", databaseFieldName: "bsbno" },
  { fileFieldName: "IFSC Code", databaseFieldName: "ifsccode" },

  { fileFieldName: "Beneficiary's Bank Name", databaseFieldName: "beneficiarybankname" },
  { fileFieldName: "Beneficiary's Bank Address", databaseFieldName: "beneficiarybankaddress" },
  { fileFieldName: "Beneficiary's Bank SWIFT Code", databaseFieldName: "beneficiarybankswiftcode" },
  { fileFieldName: "Beneficiary's Bank Country", databaseFieldName: "beneficiarybankcountrycode" },

  { fileFieldName: "Intermediate's Bank Name", databaseFieldName: "intermediatebankname" },
  { fileFieldName: "Intermediate's Bank Address", databaseFieldName: "intermediatebankaddress" },
  { fileFieldName: "Intermediate's Bank SWIFT Code", databaseFieldName: "intermediatebankswiftcode" },
  { fileFieldName: "Intermediates Bank Country", databaseFieldName: "intermediatesbankcountrycode" },
  { fileFieldName: "Company Code", databaseFieldName: "company_code" },
]

var mapDatabaseBeneficiaryToFileFieldName = (itemList) => {
  let resultList = []
  itemList.forEach(item => {
    let result = Object.assign({})
    beneficiaryList.forEach(beneficiary => {
      if (beneficiary.fileFieldName) {
        result[beneficiary.fileFieldName] = item[beneficiary.databaseFieldName] ? item[beneficiary.databaseFieldName] : null
      }
    })
    resultList.push(result)
  })
  return resultList
}


var validateAndModifyItemList = async (companyCode, headerList, itemList) => {
  logger.info("validateAndModifyItemList in : ")
  logger.info(JSON.stringify(headerList))
  logger.info(JSON.stringify(itemList))
  let result = {
    validateStatus: true,
    validateMsg: '',
    itemList: [],

  }

  // validate field
  let invalidHeaderList = []
  beneficiaryList.forEach(beneficiary => {
    if (beneficiary.fileFieldName && !headerList.includes(beneficiary.fileFieldName)) {
      invalidHeaderList.push(beneficiary.fileFieldName)
    }
  })

  if (invalidHeaderList.length > 0) {
    result.validateStatus = false
    result.validateMsg = `Invalid header ${invalidHeaderList.join()}`
  }

  let modifyItemList = []
  let duplicateList = []
  if (result.validateStatus) {
    itemList.forEach(item => {
      if (item["Company Code"] !== companyCode) {
        result.validateStatus = false
        result.validateMsg = `Invalid company code, In data file [${item["Company Code"]}] `
      }

      let modifyItem = Object.assign({})
      beneficiaryList.forEach(beneficiary => {
        if (beneficiary.databaseFieldName === 'code') {
          modifyItem['code'] = item["Beneficiary Code"] + (item["Account No"] && ![`'-`, `-`].includes(item["Account No"]) ? `-${item["Account No"]}` : '')
        } else {
          let value = item[beneficiary.fileFieldName] ? item[beneficiary.fileFieldName] : null
          // if(value && value.toUpperCase().includes("WITH")){
          //   value.replace("with","wit_h")
          //   value.replace("WITH","WIT_H")
          // }

          if(typeof(value) === 'number'){
            value = value.toString()
          }
          if (value && value.includes(";")) {
            value = value.replaceAll(";", ' ')
          }
          if (value && value.includes(":")) {
            value = value.replaceAll(":", ' ')
          }
          if (value && value.includes("\r")) {
            value = value.replaceAll("\r", ' ')
          }
          if (value && value.includes("\n")) {
            value = value.replaceAll("\n", ' ')
          }
          if (value && value.includes(",")) {
            value = value.replaceAll(",", ' ')
          }
          if (value && value.includes(`'`)) {
            value = value.replaceAll(`'`, ' ')
          }

          if (value && value.includes(`"`)) {
            value = value.replaceAll(`"`, ' ')
          }

          if (item[beneficiary.fileFieldName] === "'-") {
            value = null
          }
          modifyItem[beneficiary.databaseFieldName] = value
        }
      })

      let duplicateIndex = modifyItemList.findIndex(i => i.code === modifyItem.code)
      if (duplicateIndex !== -1) {
        duplicateList.push(modifyItem)
      } else {
        modifyItemList.push(modifyItem)
      }
    })
  }

  if (result.validateStatus) {
    result.itemList = modifyItemList

    if (duplicateList.length > 0) {
      let duplicateString = ''
      duplicateList.forEach(item => {
        duplicateString += `[ Beneficiary Code : ${item["beneficiarycode"]}, Account No : ${item["accountno"]}] `
      })
      result.validateMsg = `Duplicate data ${duplicateString}`
    }
  }
  logger.info("validateAndModifyItemList out : ")
  logger.info(JSON.stringify(result))
  return result
}

module.exports = {
  getBeneficiary: async (req, res, next) => {
    var code = (typeof req.params.code !== 'undefined' ? req.params.code : null)
    var errMsg = null
    try {
      var result = await beneficiaryModel.getBeneficiary(code, 'asc')
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
  // ***** 28/05/2021 Apiwat Emem Add Start ***** //
  getBeneficiaryByVendorCode: async (req, res, next) => {
    var errMsg = null
    try {
      var vendor_code = (typeof req.query.vendor_code !== 'undefined' ? req.query.vendor_code : null)
      var company_code = (typeof req.query.company_code !== 'undefined' ? req.query.company_code : null)
      var data = []
      if (vendor_code !== null) {
        var result = await beneficiaryModel.getBeneficiaryByVendorCode(vendor_code, company_code, 'asc')
        var statusCode = 200
        if (result.recordsets[0].length > 0) {
          data = result.recordsets[0]
        }
      } else {
        var result = await beneficiaryModel.getBeneficiary()
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
  getBeneficiaryDownload: async (req, res, next) => {
    var company_code = (typeof req.query.company_code !== 'undefined' ? req.query.company_code : null)
    var errMsg = null
    try {
      var result = await beneficiaryModel.getBeneficiaryDownload(company_code, 'asc')
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = mapDatabaseBeneficiaryToFileFieldName(result.recordsets[0])
      } else {
        data = mapDatabaseBeneficiaryToFileFieldName([{ id: null }])
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
  getBeneficiaryHistoryByCompanyCode: async (req, res, next) => {
    var company_code = (typeof req.query.company_code !== 'undefined' ? req.query.company_code : null)
    var errMsg = null
    try {
      var result = await beneficiaryModel.getBeneficiaryHistoryByCompanyCode(company_code, 'desc')
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

  updateBeneficiaryUpload: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      logger.info("reqBody : ")
      logger.info(JSON.stringify(reqBody))
      var reqBodyHeaderList = JSON.parse(reqBody.header_list)
      var reqBodyItemList = JSON.parse(reqBody.item_list)
      var reqBodyCompanyCode = reqBody.company_code
      var reqBodyCreateBy = reqBody.create_by

      const { validateStatus, validateMsg, itemList } = await validateAndModifyItemList(reqBodyCompanyCode, reqBodyHeaderList, reqBodyItemList)
      logger.info("itemList : ")
      logger.info(JSON.stringify(itemList))
      if (validateStatus) {
        let beneficiaryUpdate = await beneficiaryModel.updateBeneficiaryUpload(itemList, reqBodyCompanyCode)
        console.log("beneficiaryUpdate", beneficiaryUpdate)
        if (beneficiaryUpdate !== null && beneficiaryUpdate.rowsAffected.length > 0) {
          let beneficiaryHistoryInsert = await beneficiaryModel.insertBeneficiaryHistory(reqBodyCompanyCode, reqBodyCreateBy)
          console.log("beneficiaryHistoryInsert", beneficiaryHistoryInsert)
          data = { status: validateMsg ? 'warning' : 'success', message: `Update Success${validateMsg ? `, ${validateMsg}` : ''}` }
        } else {
          data = { status: 'fail', message: `Update Fail${validateMsg ? `, ${validateMsg}` : ''}` }
        }
      } else {
        data = { status: 'fail', message: `Update Fail${validateMsg ? `, ${validateMsg}` : ''}` }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong',
        error : error
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
}