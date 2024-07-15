const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getPaymentType: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_PaymentTypes where code = @code')
          // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      } else {
        result = await pool.request()
          // ***** 30/04/2021 Apiwat Emem Modify Start ***** //
          .query('select * from MST_PaymentTypes order by code ' + sort)
          // ***** 30/04/2021 Apiwat Emem Modify End ***** //
      }  
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 27/08/2021 Apiwat Emem Add Start ***** //
  getPaymentTypeByCompanyCode: async (company_code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (company_code !== null) {
        result = await pool.request()
          .input('company_code', sql.NVarChar, company_code)
          .query('select * from MST_PaymentTypes where company_code = @company_code order by code ' + sort)
      } 
    } catch (error) {
      return error
    }
    return result
  }
  // ***** 27/08/2021 Apiwat Emem Add End ***** //
}
