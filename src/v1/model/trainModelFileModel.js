/*
Creator:            Kittichai R
Creation date:      03/11/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')

var apiConfig = require('../../../config/sitConfig')
const { BlobServiceClient } = require('@azure/storage-blob')
var fs = require('fs')

module.exports = {
  uploadFileToAzureBlob: async (trainModelFile, folder_name) => {
    try {
      const uploadBlobName = `${folder_name}/${trainModelFile.file_name}`
      const blobServiceClient = BlobServiceClient.fromConnectionString(apiConfig.trainModelFile.azureStorage.connectionString);
      const containerClient = blobServiceClient.getContainerClient(apiConfig.trainModelFile.azureStorage.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(uploadBlobName);

      const blobOptions = {
        blobHTTPHeaders: { blobContentType: 'application/pdf' },
      };
      const localFilePath = `${trainModelFile.file_path}/${trainModelFile.file_name}`
      var uploadBlobResponse = await blockBlobClient.uploadFile(localFilePath, blobOptions)
      console.log("Blob was uploaded successfully. Request id: ", uploadBlobResponse.requestId);


      // Delete original file in localpath
      fs.unlink(localFilePath, (error) => {
        if (error) {
          console.error(error)
          return { success: false, error: error }
        }
      });

      return { success: true, response: uploadBlobResponse }
    } catch (error) {
      console.log('formrecognizer fail')
      console.log(error)
      return { success: false, error: error }
    }
  },
  deleteFileFromAzureBlob: async (trainModelFile) => {
    try {
      const filePathsplitList = trainModelFile.file_path.split('/')
      const folder_name = filePathsplitList[filePathsplitList.length - 1]
      const uploadBlobName = `${folder_name}/${trainModelFile.file_name}`
      const blobServiceClient = BlobServiceClient.fromConnectionString(apiConfig.trainModelFile.azureStorage.connectionString);
      const containerClient = blobServiceClient.getContainerClient(apiConfig.trainModelFile.azureStorage.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(uploadBlobName);

      // include: Delete the base blob and all of its snapshots.
      // only: Delete only the blob's snapshots and not the blob itself.
      const blobOptions = {
        deleteSnapshots: 'include' // or 'only'
      }

      await blockBlobClient.delete(blobOptions)
      console.log("Blob was deleted successfully. blobName : ", uploadBlobName);
      return { success: true, uploadBlobName: uploadBlobName }
    } catch (error) {
      console.log('deleteBlobTrainModelFile fail')
      if(error.code === 'BlobNotFound'){
        return { success: true, error: error }
      }else{
        console.log(error)
        return { success: false, error: error }
      }
    }
  },
  getTrainModelFile: async () => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `SELECT *  FROM MST_ModelFiles ;`
      result = await pool.request()
        .input('is_active', sql.Char, is_active)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  getTrainModelFileByModelFileId: async (model_file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `SELECT * FROM MST_ModelFiles WHERE model_file_id = @model_file_id;`
      result = await pool.request()
        .input('model_file_id', sql.Char, model_file_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  deleteTrainModelFileByModelFileId: async (model_file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `DELETE FROM MST_ModelFiles WHERE model_file_id = @model_file_id;`
      result = await pool.request()
        .input('model_file_id', sql.Char, model_file_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  getTrainModelFileByModelTemplateId: async (model_template_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `SELECT * 
                          FROM MST_ModelFiles
                          WHERE model_template_id = @model_template_id ;`
      result = await pool.request()
        .input('model_template_id', sql.Char, model_template_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  insertTrainModelFile: async (file_name, original_name, file_size, file_path, full_path, create_by, model_template_id) => {
    var result = false
    var status = 'server-uploaded'
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `INSERT INTO MST_ModelFiles (
                    [file_name], 
                    [original_name], 
                    [file_size], 
                    [file_path], 
                    [full_path],
                    [create_by], 
                    [create_date], 
                    [status],
                    [model_template_id]
                ) VALUES (
                    @file_name,
                    @original_name,
                    @file_size, 
                    @file_path,
                    @full_path,
                    @create_by,
                    getdate(),
                    @status,
                    @model_template_id
                );
                SELECT scope_identity() AS model_file_id;`
      result = await pool.request()
        .input('file_name', sql.Char, file_name)
        .input('original_name', sql.Char, original_name)
        .input('file_size', sql.Char, file_size)
        .input('file_path', sql.Char, file_path)
        .input('full_path', sql.Char, full_path)
        .input('create_by', sql.Char, create_by)
        .input('status', sql.Char, status)
        .input('model_template_id', sql.Int, model_template_id)
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },
  updateModelFileStatusAndOriginalResult: async (status, original_result, model_file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `UPDATE MST_ModelFiles SET 
                          status = @status
                          WHERE model_file_id = @model_file_id ;`
      result = await pool.request()
        .input('status', sql.NVarChar, status)
        // .input('original_result', sql.NVarChar, original_result)
        .input('model_file_id', sql.Int, model_file_id)
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },
  getModelFileByModelTemplateIdAndStatus: async (model_template_id, status) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `SELECT * 
                          FROM MST_ModelFiles
                          WHERE model_template_id = @model_template_id 
                          AND status = @status;`
      result = await pool.request()
        .input('model_template_id', sql.Int, model_template_id)
        .input('status', sql.Char, status)
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },
}