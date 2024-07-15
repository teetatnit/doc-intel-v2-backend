var trainModelFileModel = require('../model/trainModelFileModel')
var trainModelTemplateModel = require('../model/trainModelTemplateModel')
var fs = require('fs')

module.exports = {
  getTrainModelFile: async (req, res, next) => {
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await trainModelFileModel.getTrainModelFile()
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0];
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
  deleteTrainModelFile: async (req, res, next) => {
    var model_file_id = (typeof req.body.model_file_id !== 'undefined' ? req.body.model_file_id : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var trainModelFileResult = await trainModelFileModel.getTrainModelFileByModelFileId(model_file_id)
      if (trainModelFileResult.recordsets[0].length > 0) {
        var trainModelFile = trainModelFileResult.recordsets[0][0];
        var deleteFileBlobResult = await trainModelFileModel.deleteFileFromAzureBlob(trainModelFile)
        console.log("deleteFileBlobResult", deleteFileBlobResult)
        if(deleteFileBlobResult.success){
          var trainModelFileDelete = await trainModelFileModel.deleteTrainModelFileByModelFileId(model_file_id)
          if (trainModelFileDelete !== null && trainModelFileDelete.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Delete Model File Success' }
          } else {
            data = { status: 'fail', message: 'Delete Model File Fail' }
          }
        }else{
          data = { status: 'fail', message: 'Delete File From Azure Blob Fail' }
        }
      }else{
        data = { status: 'fail', message: 'Not found model_file_id' }
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
  getTrainModelFileByModelTemplateId: async (req, res, next) => {
    var model_template_id = (typeof req.params.model_template_id !== 'undefined' ? req.params.model_template_id : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await trainModelFileModel.getTrainModelFileByModelTemplateId(model_template_id)
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0];
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
  insertTrainModelFile: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var create_by = req.cur_user.trim()
      var data = { status: 'fail', message: 'Update Model File Fail' }
      var statusCode = 200

      var trainModelFileCreate = await trainModelFileModel.insertTrainModelFile(reqBody.file_name, reqBody.original_name, reqBody.file_size, reqBody.file_path, reqBody.full_path, create_by, reqBody.model_template_id)
      if (trainModelFileCreate !== null && trainModelFileCreate.rowsAffected.length > 0) {
        data = { status: 'success', message: 'Update Model File Success' }
      } else {
        data = { status: 'fail', message: 'Update Model File Fail' }
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
  azureUploadTrainModelFile: async (req, res, next) => {
    var errMsg = null
    var data = []
    var statusCode = 200
    var model_template_id = req.dataModelTemplate.model_template_id
    var folder_name = req.dataModelTemplate.display_name
    try {
      var modelTemplateStatus = 'in-progress'
      var chkWstatus = true;

      // Update 'in-progress' status to MST_ModelTemplate
      var modelFileData = await trainModelTemplateModel.updateModelTemplateStatus(model_template_id, modelTemplateStatus)

      modelTemplateStatus = 'upload-success'
      do {
        // get data file from MST_ModelFile
        var modelFileData = await trainModelFileModel.getModelFileByModelTemplateIdAndStatus(model_template_id, "server-uploaded")
        if (modelFileData !== false && Array.isArray(modelFileData.recordset) && modelFileData.recordset.length > 0) {
          var modelFile = modelFileData.recordset[0]
          // console.log('query Model File Data =', modelFile)
          let modelFileStatus = 'azure-uploading'
          let modelFileOriginalResult = modelFile.original_result

          // Update 'azure-uploading' status to MST_ModelFile
          var updateModelFileBeforeUpload = await trainModelFileModel.updateModelFileStatusAndOriginalResult(modelFileStatus, modelFileOriginalResult, modelFile.model_file_id)
          // console.log('updateModelFileBeforeUpload =', updateModelFileBeforeUpload)

          // Upload file from server to azure storage-blob and delete original file in server
          var uploadFileToAzureBlobRes = await trainModelFileModel.uploadFileToAzureBlob(modelFile, folder_name)
          modelFileOriginalResult = JSON.stringify(uploadFileToAzureBlobRes)
          // console.log('uploadFileToAzureBlobRes =', uploadFileToAzureBlobRes)
          // Check upload to azure status
          if (uploadFileToAzureBlobRes.success) {
            modelFileStatus = 'azure-successed'
          } else {
            modelFileStatus = 'azure-failed'
            modelTemplateStatus = 'azure-failed'
          }

          // update original_result and status to MST_ModelFile
          var updateModelFileAfterUpload = await trainModelFileModel.updateModelFileStatusAndOriginalResult(modelFileStatus, modelFileOriginalResult, modelFile.model_file_id)
          // console.log('updateModelFileAfterUpload =', updateModelFileAfterUpload)

        }

        // get data file from MST_ModelFile
        chkWstatus = await trainModelFileModel.getModelFileByModelTemplateIdAndStatus(model_template_id, "server-uploaded")
      } while (chkWstatus !== false && Array.isArray(chkWstatus.recordset) && chkWstatus.recordset.length > 0)

      // Update 'upload-success' or 'azure-failed' status to MST_ModelTemplate
      var modelFileData = await trainModelTemplateModel.updateModelTemplateStatus(model_template_id, modelTemplateStatus)

      if (modelTemplateStatus == "upload-success") {
        const full_folder_path = `./upload/traindoc/${folder_name}`
        fs.rmdir(full_folder_path, (err) => {
          if (err) {
            console.error(err)
            return
          }
        });
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
