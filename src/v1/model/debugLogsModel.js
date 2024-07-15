const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  createDebugLogs: async (keyword, message) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('keyword', sql.NVarChar, keyword)
        .input('message', sql.Text, message)
        .query('insert into TRN_DebugLogs(keyword, message, datetime) values(@keyword, @message, getdate()); select scope_identity() as id;')
    } catch (error) {
      return error
    }
    return result
  },
}
