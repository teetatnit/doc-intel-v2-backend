/*
Creator:            Apiwat Emem
Creation date:      13/05/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getGRApprovalFor: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .query('select * from MST_GrApprovalFors where code = @code')
      } else {
        result = await pool.request()
          .query('select * from MST_GrApprovalFors order by code ' + sort)
      }  
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 27/08/2021 Apiwat Emem Add Start ***** //
  getGRApprovalForByCompanyCode: async (company_code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (company_code !== null) {
        result = await pool.request()
          .input('company_code', sql.NVarChar, company_code)
          .query('select * from MST_GrApprovalFors where company_code = @company_code order by code ' + sort)
      } 
    } catch (error) {
      return error
    }
    return result
  }
  // ***** 27/08/2021 Apiwat Emem Add End ***** //
}
