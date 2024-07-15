/*
Creator:            Kittichai R
Creation date:      03/11/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getTrainModelByModelTemplateId: async (model_template_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `SELECT 
                            model_id,
                            model_template_id, 
                            name,
                            model_number,
                            CONVERT(DATETIME,create_datetime AT TIME ZONE 'UTC' AT TIME ZONE 'SE Asia Standard Time') AS [create_datetime],
                            status,
                            average_model_accuracy,
                            total_pages_train,
                            is_default
                          FROM MST_Model 
                          WHERE model_template_id = @model_template_id ;`
      result = await pool.request()
        .input('model_template_id', sql.Int, model_template_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  // getTrainModelDefaultByMasterDataId: async (masterdata_id) => {
  //   var result = false
  //   try {
  //     var pool = await sql.connect(config.sqlConn)
  //     var queryString = `SELECT 
  //                         m.name AS [model_name],
  //                         m.model_number AS [model_id],
  //                         m.create_datetime
  //                       FROM MST_ModelTemplate mt
  //                       LEFT JOIN MST_Model m
  //                       ON mt.model_template_id = m.model_template_id
  //                       WHERE mt.masterdata_id = @masterdata_id 
  //                       AND is_default = 1;`
  //     result = await pool.request()
  //       .input('masterdata_id', sql.Int, masterdata_id)
  //       .query(queryString)

  //   } catch (error) {
  //     return error
  //   }
  //   return result
  // },
  getTrainModelDefaultByMasterDataId: async (masterdata_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `SELECT 
                            model.name AS [model_name],
                            model.model_number AS [model_id],
                            model_template.display_name AS [model_template_display_name],
                            model.create_datetime
                          FROM TRN_MasterDatas masterdata
                          LEFT JOIN MST_Model model
                          ON masterdata.model_template_id = model.model_template_id
                          LEFT JOIN MST_ModelTemplate model_template
                          ON masterdata.model_template_id = model_template.model_template_id
                          WHERE masterdata.masterdata_id = @masterdata_id 
                          AND model.is_default = 1 ;`
      result = await pool.request()
        .input('masterdata_id', sql.Int, masterdata_id)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  insertTrainModel: async (model_template_id, name, model_number, create_datetime, update_datetime, status, average_model_accuracy,total_pages_train, is_default) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `INSERT INTO MST_Model (
                    [model_template_id], 
                    [name],
                    [model_number],
                    [create_datetime],
                    [update_datetime],
                    [status],
                    [average_model_accuracy],
                    [total_pages_train],
                    [is_default]
                ) VALUES (
                    @model_template_id, 
                    @name, 
                    @model_number,
                    @create_datetime,
                    @update_datetime,
                    @status,
                    @average_model_accuracy,
                    @total_pages_train,
                    @is_default
                );
                SELECT scope_identity() AS model_id;`
      result = await pool.request()
        .input('model_template_id', sql.Int, model_template_id)
        .input('name', sql.Char, name)
        .input('model_number', sql.Char, model_number)
        .input('create_datetime', sql.Char, create_datetime)
        .input('update_datetime', sql.Char, update_datetime)
        .input('status', sql.Char, status)
        .input('average_model_accuracy', sql.Char, average_model_accuracy)
        .input('total_pages_train', sql.Int, total_pages_train)
        .input('is_default', sql.Char, is_default)
        .query(queryString)
    } catch (error) {
      console.log("error : ", error)
      return error
    }
    return result
  },
  updateTrainModelSetIsDefault: async (model_id, model_template_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var queryString = `UPDATE MST_Model SET is_default = 0 WHERE model_template_id = @model_template_id ;
                         UPDATE MST_Model SET is_default = 1 WHERE model_id = @model_id ;`
      result = await pool.request()
        .input('model_template_id', sql.Int, model_template_id)
        .input('model_id', sql.Int, model_id)
        .query(queryString)
    } catch (error) {
      console.log("error : ", error)
      return error
    }
    return result
  },
}