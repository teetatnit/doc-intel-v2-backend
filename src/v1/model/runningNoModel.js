/*
Creator:            Apiwat Emem
Creation date:      28/06/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getRunningNo: async (prefix = null) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .input('prefix', sql.NVarChar, prefix)
          .query('MERGE INTO TRN_RunningNo AS TARGET USING (SELECT COUNT(*) as [COUNT] FROM TRN_RunningNo) AS SOURCE ON (prefix = @prefix) WHEN MATCHED THEN UPDATE SET running_no = running_no + 1 WHEN NOT MATCHED BY TARGET THEN INSERT (prefix, running_no) VALUES (@prefix, 1); SELECT prefix + RIGHT(CONCAT(\'0000\', running_no), 4) AS RefNo FROM TRN_RunningNo WHERE prefix = @prefix; ')
      } 
    } catch (error) {
      return error
    }
    return result
  }
}
