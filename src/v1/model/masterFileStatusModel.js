/*
Creator:            Chanakan C.
Creation date:      27/Apr/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getMasterFileStatus: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .query('select * from MST_FileStatus where code = @code')
      } else {
        result = await pool.request()
          .query('select * from MST_FileStatus order by code ' + sort)
      }  
    } catch (error) {
      return error
    }
    return result
  }
}
