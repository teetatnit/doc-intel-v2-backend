/*
Revisor:            Apiwat Emem
Revision date:      07/05/2021
Revision Reason:    Modify parameter
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  // ***** 07/05/2021 Apiwat Emem Mod Start ***** // 
  getDocument: async (code = null, sort = 'asc', is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()   
          .input('code', sql.NVarChar, code)
          .input('is_active', sql.Char, is_active)// ***** 07/05/2021 Apiwat Emem Mod Start ***** //
          .query('select code as [document_code], name as [document_name] from MST_Documents where code = @code and is_active = @is_active')       
      } else {
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          .query('select code as [document_code], name as [document_name] from MST_Documents where is_active = @is_active order by code ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  }
  // ***** 07/05/2021 Apiwat Emem Mod End ***** //
}
