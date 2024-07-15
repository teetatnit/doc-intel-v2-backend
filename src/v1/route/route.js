/*
Revisor:            Chanakan C.
Revision date:      27/Apr/2021
Revision Reason:    Add router for masterFileStatusController

Revisor:            Apiwat E.
Revision date:      6/May/2021
Revision Reason:    Add controllers
*/

var router = require('express').Router()
var moment = require('moment')
var uploadController = require('../controller/uploadController')
var userController = require('../controller/userController')
var masterController = require('../controller/masterController')
var responseHandle = require('../../../util/response')
var documentController = require('../controller/documentController')
var vendorController = require('../controller/vendorController')
var masterDataController = require('../controller/masterDataController')
// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
var masterFileStatusController = require('../controller/masterFileStatusController')
// ***** 27/Apr/2021 Chanakan C. Add End ***** //
var ocrFileController = require('../controller/ocrFileController')
var businessUnitController = require('../controller/businessUnitController')
var companyController = require('../controller/companyController')
var divisionController = require('../controller/divisionController')
var masterFieldController = require('../controller/masterFieldController')
var currencyController = require('../controller/currencyController')
var numberStyleController = require('../controller/numberStyleController')
var formTypeController = require('../controller/formTypeController')
var statusController = require('../controller/statusController')
var paymentTypeController = require('../controller/paymentTypeController')
var approverController = require('../controller/approverController')
var reviewerController = require('../controller/reviewerController')
var requesterController = require('../controller/requesterController')
var serviceTeamController = require('../controller/serviceTeamController')
// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
var documentTypeController = require('../controller/documentTypeController')
// ***** 27/Apr/2021 Chanakan C. Add End ***** //
var taxRateController = require('../controller/taxRateController')
var whtRateController = require('../controller/whtRateController')
// ***** 6/May/2021 Apiwat Emem Add Start ***** //
var expenseController = require('../controller/expenseController')
var costCenterController = require('../controller/costCenterController')
var beneficiaryController = require('../controller/beneficiaryController')
var grApprovalForController = require('../controller/grApprovalForController')
var internalOrderController = require('../controller/internalOrderController')
var bankChargeController = require('../controller/bankChargeController')
var paidForController = require('../controller/paidForController')
var preAdviceController = require('../controller/preAdviceController')
var remittedCurrencyController = require('../controller/remittedCurrencyController')
// ***** 6/May/2021 Apiwat Emem Add End ***** //
// ***** 21/06/2021 Apiwat Emem Add Start ***** //
var paymentLocationController = require('../controller/paymentLocationController')
// ***** 21/06/2021 Apiwat Emem Add End ***** //
// ***** 29/06/2021 Apiwat Emem Add Start ***** //
var favoriteController = require('../controller/favoriteController')
// ***** 29/06/2021 Apiwat Emem Add End ***** //

// ***** 10/Oct/2022 Kittichai R. Add train model Start *****//
var trainModelController = require('../controller/trainModelController')
var trainModelTemplateController = require('../controller/trainModelTemplateController')
var trainModelFileController = require('../controller/trainModelFileController')
var uploadTrainModelFileController = require('../controller/uploadTrainModelFileController')
var trainmodelCfgController = require('../controller/trainmodelCfgController')
// ***** 10/Oct/2022 Kittichai R. Add train model End *****//

const config = require('../../../config/sitConfig')

const serviceStartDateTime = new Date()
const getVersion = async (req, res, next) => {
  const statusCode = 200
  const dateFormat = "YYYY-MM-DD HH:mm:ss"
  const data = {
    version: "1.0.0",
    environment: config.environment,
    serviceName: "Document Analytics API",
    serviceStartDateTime: moment(serviceStartDateTime).format(dateFormat),
    datetime: moment(new Date()).format(dateFormat)
  }
  res.statusCode = statusCode
  res.data = data
  next()
}

router.get('/version', getVersion, responseHandle.responseDataJson, responseHandle.errorHandle)


/// /User ////
router.get('/users', userController.getUserProfile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/users/:email/email', userController.getUserProfile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/users', userController.upsertUserProfile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/users/:user_id/role', userController.upsertUserProfile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/users/:user_id/delete', userController.deleteUserProfile, responseHandle.responseDataJson, responseHandle.errorHandle)
/// /User-END ////

/// / master data ////
router.get('/master/config', masterController.getMasterConfig, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/master', masterController.updateMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / master data- END ////

/// / Vendor ////
router.get('/vendors/raw', vendorController.getVendorRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/vendors', vendorController.getVendor, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/vendors/:vendor_code', vendorController.getVendor, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/vendors/:vendor_code/update', vendorController.updateVendor, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/vendors', vendorController.insertVendor, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/vendors/:vendor_code/delete', vendorController.deleteVendor, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Vendor - END ////

/// / Master Data ////
router.get('/masterdatas', masterDataController.getMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/masterdatas/modeltemplateid/:model_template_id', masterDataController.getMasterdatasByModelTemplateId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/masterdatas/:masterdata_id', masterDataController.getMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/masterdatas', masterDataController.insertMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/masterdatas/:masterdata_id/update', masterDataController.updateMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/masterdatas/:masterdata_id/delete', masterDataController.deleteMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/masterdatas/:document_code/vendor', masterDataController.getVendorByDocumentCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/masterdatas/:document_code/:vendor_code/additional_info', masterDataController.getAdditionalInfoByDocumentCodeVendorCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/masterdatas/:masterdata_id/items', masterDataController.getMasterDataItem, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Master Data - END ////

/// / OCR File /////
router.post('/uploadocr', [
  uploadController.singleFile,
  uploadController.responseFileUpload,
  responseHandle.responseDataJson,
  responseHandle.errorHandle
])
router.get('/ocrfiles', ocrFileController.getOCRFiles, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/ocrfiles/totalpageextracted', ocrFileController.getOCRFilesTotalPageExtracted, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/ocrfiles/:file_id', ocrFileController.getOCRFiles, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/ocrfiles/:file_id/content', ocrFileController.getOCRFileContent, responseHandle.errorHandle)
router.post('/ocrfiles', ocrFileController.upsertOCRFileAndStatus, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/validatedateformat', ocrFileController.validateDateFormatOcr, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id', ocrFileController.upsertOCRFileAndStatus, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/delete', ocrFileController.deleteOCRFileByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
router.post('/ocrfiles/:file_id/status', ocrFileController.updateOCRFileStatus, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/multipledelete', ocrFileController.deleteMultipleOCRFilesByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/updatefields', ocrFileController.updateFieldsByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
// ***** 27/Apr/2021 Chanakan C. Add End ***** //
// ***** 6/May/2021 Apiwat Emem Add Start ***** //
router.get('/ocrfiles/ocrresult/:file_id', ocrFileController.getOCRResultByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/ocrfiles/:file_id/export', ocrFileController.getOCRFileExportExcelByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/ocrfiles/:file_id/attachfile', ocrFileController.getAttachFileByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/attachfile', ocrFileController.insertAttachFile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/attachfile/update', ocrFileController.updateAttachFile, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/ocrfiles/:file_id/receiptfile', ocrFileController.getReceiptFileByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/receiptfile', ocrFileController.insertReceiptFile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/receiptfile/update', ocrFileController.updateReceiptFile, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/ocrfiles/:file_id/supportingdocfile', ocrFileController.getSupportingDocFileByFileId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/supportingdocfile', ocrFileController.insertSupportingDocFile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/ocrfiles/:file_id/supportingdocfile/update', ocrFileController.updateSupportingDocFile, responseHandle.responseDataJson, responseHandle.errorHandle)


// ***** 6/May/2021 Apiwat Emem Add End ***** //
// ***** 24/June/2021 Apiwat Emem Add Start ***** //
router.post('/ocrfiles/:file_id/sendtoallpay', ocrFileController.sendToAllpay, responseHandle.responseDataJson, responseHandle.errorHandle)
// ***** 24/June/2021 Apiwat Emem Add End ***** //
/// / OCR File - END /////

/// / Extract OCR File By AI /////
// ***** 13/Jun/2023 Supawit N. Add Start ***** //
router.post('/extractOCRFilesByAI', ocrFileController.extractOCRFilesByAI, responseHandle.responseDataJson, responseHandle.errorHandle)
// ***** 13/Jun/2023 Supawit N. Add End ***** //
/// / Extract OCR File By AI - END /////

/// / Extract OCR File /////
// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
router.get('/extractOCRFiles', ocrFileController.extractOCRFiles, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/modifyResultOCRFiles/:file_id', ocrFileController.modifyResultOCRFiles, responseHandle.responseDataJson, responseHandle.errorHandle)
// ***** 27/Apr/2021 Chanakan C. Add End ***** //
/// / Extract OCR File - END /////

/// / Document /////
router.get('/documents', documentController.getDocument, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/documents/:document_code', documentController.getDocument, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Document - END /////

/// / Business Unit /////
router.get('/businessunit', businessUnitController.getBusinessUnit, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/businessunit/raw', businessUnitController.getBusinessunitRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/businessunit', businessUnitController.insertBusinessUnit, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/businessunit/:business_unit_code/update', businessUnitController.updateBusinessUnit, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/businessunit/:business_unit_code/delete', businessUnitController.deleteBusinessUnit, responseHandle.responseDataJson, responseHandle.errorHandle)

/// / Company /////
router.get('/companies', companyController.getCompany, responseHandle.responseDataJson, responseHandle.errorHandle)
// router.get('/companies/:code', companyController.getCompanyByCode, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/companies/raw', companyController.getCompanyRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/companies', companyController.insertCompany, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/companies/:company_code/update', companyController.updateCompany, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/companies/:company_code/delete', companyController.deleteCompany, responseHandle.responseDataJson, responseHandle.errorHandle)

/// / Company - END /////

/// / Division /////
router.get('/divisions', divisionController.getDivision, responseHandle.responseDataJson, responseHandle.errorHandle)
// router.get('/divisions/:code', divisionController.getDivision, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/divisions/:division_code/update', divisionController.updateDivision, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/divisions', divisionController.insertDivision, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/divisions/:division_code/delete', divisionController.deleteDivision, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Division - END /////

/// / Master Field ////
router.get('/masterfields', masterFieldController.getMasterField, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Master Field - END ////

/// / Currency ////
router.get('/currencies', currencyController.getCurrency, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/currencies/:code', currencyController.getCurrency, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Currency - END ////

/// / Number Style ////
router.get('/numberstyle', numberStyleController.getNumberStyle, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/numberstyle/:id', numberStyleController.getNumberStyle, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Currency - END ////

/// / Form Type ////
router.get('/formtypes', formTypeController.getFormType, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/formtypes/:code', formTypeController.getFormType, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Form Type - END ////

/// / Status ////
router.get('/status', statusController.getStatus, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/status/:code', statusController.getStatus, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Status - END ////

/// / Payment Type ////
router.get('/paymenttypes', paymentTypeController.getPaymentTypeByCompanyCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/paymenttypes/:code', paymentTypeController.getPaymentType, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Payment Type - END ////

// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
/// / File status ////
router.get('/MST_FileStatus', masterFileStatusController.getMasterFileStatus, responseHandle.responseDataJson, responseHandle.errorHandle)
// ***** 27/Apr/2021 Chanakan C. Add End ***** //

/// / Service Team ////
router.get('/serviceteams', serviceTeamController.getServiceTeam, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/serviceteams/:code', serviceTeamController.getServiceTeam, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Service Team - END ////

// ***** 27/Apr/2021 Chanakan C. Add Start ***** //
/// / Document Type ////
router.get('/documenttypes', documentTypeController.getDocumentType, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/documenttypes/:code', documentTypeController.getDocumentType, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Document Type - END ////
// ***** 27/Apr/2021 Chanakan C. Add End ***** //

/// / Tax Rate ////
router.get('/taxrates', taxRateController.getTaxRate, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/taxrates/:code', taxRateController.getTaxRate, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Tax Rate - END ////

/// / WHT Rate ////
router.get('/whtrates', whtRateController.getWhtRate, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/whtrates/:code', whtRateController.getWhtRate, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / WHT Rate - END ////

// ***** 23/05/2022 Kittichai Rueangpoon Modify Start ***** //
/// / Approver ////
router.get('/approvers/gdc/startwithname', approverController.getApproverByStartWithName, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/approvers/gdc/adaccount', approverController.getApproverByAdAccount, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/approvers/db/startwithname', approverController.getApproverDbByStartWithName, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/approvers/db/startwithemail', approverController.getApproverDbByStartWithEmail, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/approvers/raw', approverController.getApproverRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/approvers', approverController.insertApprover, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/approvers/:user_id/update', approverController.updateApprover, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/approvers/:user_id/delete', approverController.deleteApprover, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Approver - END ////

/// / Reviewer ////
router.get('/reviewers/gdc/startwithname', reviewerController.getReviewerByStartWithName, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/reviewers/gdc/startwithemail', reviewerController.getReviewerByAdAccount, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/reviewers/db/startwithname', reviewerController.getReviewerDbByStartWithName, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/reviewers/db/startwithemail', reviewerController.getReviewerDbByStartWithEmail, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/reviewers/raw', reviewerController.getReviewerRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/reviewers', reviewerController.insertReviewer, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/reviewers/:user_id/update', reviewerController.updateReviewer, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/reviewers/:user_id/delete', reviewerController.deleteReviewer, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Reviewer - END ////

/// / Requester ////
router.get('/requesters/gdc/startwithname', requesterController.getRequesterByStartWithName, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/requesters/gdc/startwithemail', requesterController.getRequesterByAdAccount, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/requesters/db/startwithname', requesterController.getRequesterDbByStartWithName, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/requesters/db/startwithemail', requesterController.getRequesterDbByStartWithEmail, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/requesters/raw', requesterController.getRequesterRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Requester - END ////
// ***** 23/05/2022 Kittichai Rueangpoon Modify End ***** //


/// / Expense ////
router.post('/expenses', expenseController.insertExpense, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/expenses/:expense_code/update', expenseController.updateExpense, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/expenses/:expense_code/delete', expenseController.deleteExpense, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/expenses/raw', expenseController.getExpenseRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/expenses/:code', expenseController.getExpense, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/expenses', expenseController.getExpense, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Expense - END ////

/// / Cost Center ////
router.post('/costcenters', costCenterController.insertCostCenter, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/costcenters/:costcenter_code/update', costCenterController.updateCostCenter, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/costcenters/:costcenter_code/delete', costCenterController.deleteCostCenter, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/costcenters/raw', costCenterController.getCostCenterRaw, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/costcenters/:code', costCenterController.getCostCenter, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/costcenters', costCenterController.getCostCenter, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Cost Center - END ////

/// / Beneficiary ////
router.get('/beneficiaries', beneficiaryController.getBeneficiaryByVendorCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/beneficiaries/download', beneficiaryController.getBeneficiaryDownload, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/beneficiaries/history', beneficiaryController.getBeneficiaryHistoryByCompanyCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/beneficiaries/:code', beneficiaryController.getBeneficiary, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/beneficiaries/upload', beneficiaryController.updateBeneficiaryUpload, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Beneficiary - END ////

/// / GR Approval For ////
router.get('/grapprovalfors', grApprovalForController.getGRApprovalForByCompanyCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/grapprovalfors/:code', grApprovalForController.getGRApprovalFor, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / GR Approval For - END ////

/// / Internal Order ////
router.get('/internalorders', internalOrderController.getInternalOrder, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/internalorders/:code', internalOrderController.getInternalOrder, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Internal Order - END ////

/// / Bank Charge ////
router.get('/bankcharges', bankChargeController.getBankCharge, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/bankcharges/:code', bankChargeController.getBankCharge, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Bank Charge - END ////

/// / Paid For ////
router.get('/paidfors', paidForController.getPaidFor, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/paidfors/:code', paidForController.getPaidFor, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Paid For - END ////

/// / Pre-Advice ////
router.get('/preadvices', preAdviceController.getPreAdvice, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/preadvices/:code', preAdviceController.getPreAdvice, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Pre-Advice - END ////

/// / Remitted Currency ////
router.get('/remittedcurrencies', remittedCurrencyController.getRemittedCurrency, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/remittedcurrencies/:code', remittedCurrencyController.getRemittedCurrency, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Remitted Currency - END ////
// ***** 6/May/2021 Apiwat Emem Add End ***** //

// ***** 21/06/2021 Apiwat Emem Add Start ***** //
/// / Payment Location ////
router.get('/paymentlocations', paymentLocationController.getPaymentLocationByPaymentTypeCodeCompanyCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/paymentlocations/:code', paymentLocationController.getPaymentLocation, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Payment Location - END ////
// ***** 21/06/2021 Apiwat Emem Add End ***** //

// ***** 29/06/2021 Apiwat Emem Add Start ***** //
/// / Favorite ////
router.get('/favorites', favoriteController.getFavorite, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/favorites/:favorite_id', favoriteController.getFavorite, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/favorites/:masterdata_id/upsert', favoriteController.upsertMasterData, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Favorite - END ////
// ***** 29/06/2021 Apiwat Emem Add End ***** //



// ***** 10/Oct/2022 Kittichai R. Add train model Start ***** //

router.get('/masterdatas/items/:model_template_id', masterDataController.getMasterDataItemsByModelTemplateId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/masterdatas/businesspartner/:document_code', masterDataController.getBusinessPartnerByDocumentCode, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get(
  '/masterdatas/additional_info/:document_code/:partner_code',
  masterDataController.getAdditionalInfoByDocumentCodeBusinessPartnerCode,
  responseHandle.responseDataJson,
  responseHandle.errorHandle
)

/// / Upload model file to local server   /////
router.post('/uploadtrainmodelfile/:model_template_id', [
  uploadTrainModelFileController.getDataModelTemplate,
  uploadTrainModelFileController.singleFile,
  uploadTrainModelFileController.responseFileUpload,
  responseHandle.responseDataJson,
  responseHandle.errorHandle
])

router.get('/modeltemplate', trainModelTemplateController.getTrainModel, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/modeltemplate/:model_id', trainModelTemplateController.getTrainModelById, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/modeltemplate', trainModelTemplateController.insertTrainModel, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/model/modeltemplateid/:model_template_id', trainModelController.getTrainModelByModelTemplateId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/model/defaultmodel/:masterdata_id', trainModelController.getTrainModelDefaultByMasterDataId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/model', trainModelController.insertTrainModel, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/model/:model_id/isdefault', trainModelController.updateTrainModelSetIsDefault, responseHandle.responseDataJson, responseHandle.errorHandle)

router.get('/trainmodelfile', trainModelFileController.getTrainModelFile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.delete('/trainmodelfile', trainModelFileController.deleteTrainModelFile, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/trainmodelfile/:model_template_id', trainModelFileController.getTrainModelFileByModelTemplateId, responseHandle.responseDataJson, responseHandle.errorHandle)
router.post('/trainmodelfile', trainModelFileController.insertTrainModelFile, responseHandle.responseDataJson, responseHandle.errorHandle)
/// / Upload model file to azure server   /////
router.get('/trainmodelfile/azureupload/modeltemplateid/:model_template_id', [
  uploadTrainModelFileController.getDataModelTemplate,
  trainModelFileController.azureUploadTrainModelFile,
  responseHandle.responseDataJson,
  responseHandle.errorHandle
])
router.get('/trainmodelcfg/connection/:model_template_id', trainmodelCfgController.getTrainModelCfgConnection, responseHandle.responseDataJson, responseHandle.errorHandle)
router.get('/trainmodelcfg/project/:model_template_id', trainmodelCfgController.getTrainModelCfgProject, responseHandle.responseDataJson, responseHandle.errorHandle)

// ***** 10/Oct/2022 Kittichai R. Add train model End *****//

module.exports = router

