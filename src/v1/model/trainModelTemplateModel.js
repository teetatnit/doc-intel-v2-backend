/*
Creator:            Kittichai R
Creation date:      03/11/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getTrainModel: async (email = null, sort = 'DESC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      // var queryString = `SELECT 
      //                         mt.model_template_id, 
      //                         mt.display_name, 
      //                         mt.description, 
      //                         mt.status, 
      //                         SUM(m.total_pages_train) as total_pages_train
      //                     FROM MST_ModelTemplate mt
      //                     LEFT JOIN MST_Model m
      //                     ON mt.model_template_id = m.model_template_id
      //                     GROUP BY mt.model_template_id, mt.display_name, mt.description, mt.status
      //                     ORDER BY mt.model_template_id ${sort}`
      var queryString = `SELECT 
                            mt.model_template_id, 
                            mt.display_name, 
                            mt.description, 
                            mt.status, 
                            SUM(m.total_pages_train) as total_pages_train
                          
                        FROM MST_ModelTemplate mt
                        LEFT JOIN (
                                  SELECT 
                                    md.masterdata_id,
                                    md.model_template_id
                                  FROM TRN_MasterDatas md
                                  LEFT JOIN TRN_Users u 
                                  ON md.create_by = u.email
                                  WHERE u.email = '${email}'
                        ) md 
                        ON mt.model_template_id = md.model_template_id
                        LEFT JOIN MST_Model m
                        ON mt.model_template_id = m.model_template_id
                        WHERE md.masterdata_id IS NOT NULL
                        GROUP BY mt.model_template_id, mt.display_name, mt.description, mt.status
                        ORDER BY mt.model_template_id ${sort}`
      result = await pool.request()
        .query(queryString)
    } catch (error) {
      console.log("error : ", error)
      return error
    }
    return result
  },
  getTrainModelById: async (model_template_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = 'SELECT * FROM MST_ModelTemplate WHERE model_template_id = @model_template_id'
      result = await pool.request()
        .input('model_template_id', sql.Int, model_template_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  getTrainModelByDisplayName: async (display_name) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = 'SELECT * FROM MST_ModelTemplate WHERE display_name = @display_name'
      result = await pool.request()
        .input('display_name', sql.Char, display_name)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  getTrainModelByMasterDataId: async (masterdata_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = 'SELECT * FROM MST_ModelTemplate WHERE masterdata_id = @masterdata_id'
      result = await pool.request()
        .input('masterdata_id', sql.Char, masterdata_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  insertTrainModel: async (document_code, vendor_code, masterdata_id, display_name, description, status) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `INSERT INTO MST_ModelTemplate (
                    [document_code], 
                    [vendor_code],
                    [masterdata_id],
                    [display_name],
                    [description],
                    [status]
                ) VALUES (
                    @document_code, 
                    @vendor_code, 
                    @masterdata_id,
                    @display_name,
                    @description,
                    @status
                );
                SELECT scope_identity() AS model_template_id;`
      result = await pool.request()
        .input('document_code', sql.Int, document_code)
        .input('vendor_code', sql.Char, vendor_code)
        .input('masterdata_id', sql.Char, masterdata_id)
        .input('display_name', sql.Char, display_name)
        .input('description', sql.Char, description)
        .input('status', sql.Char, status)
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },
  updateModelTemplateStatus: async (model_template_id, status) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `UPDATE MST_ModelTemplate SET 
                          status = @status
                          WHERE model_template_id = @model_template_id ;`
      result = await pool.request()
        .input('status', sql.NVarChar, status)
        .input('model_template_id', sql.Int, model_template_id)
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },
}