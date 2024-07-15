/*
Creator:            Apiwat Emem
Creation date:      21/06/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getPaymentLocation: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .query('select code as [code], name as [name], paymenttype_code from MST_PaymentLocations where code = @code')
      } else {
        result = await pool.request()
          .query('select code as [code], name as [name], paymenttype_code from MST_PaymentLocations order by code ' + sort)
      }  
    } catch (error) {
      return error
    }
    return result
  },
  getPaymentLocationByPaymentTypeCode: async (paymenttype_code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (paymenttype_code !== null) {
        result = await pool.request()
          .input('paymenttype_code', sql.NVarChar, paymenttype_code)
          .query('select code as [code], name as [name], paymenttype_code from MST_PaymentLocations where paymenttype_code = @paymenttype_code order by code ' + sort)
      } 
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 27/08/2021 Apiwat Emem Add Start ***** //
  getPaymentLocationByPaymentTypeCodeCompanyCode: async (paymenttype_code = null, company_code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (paymenttype_code !== null && company_code !== null) {
        result = await pool.request()
          .input('paymenttype_code', sql.NVarChar, paymenttype_code)
          .input('company_code', sql.NVarChar, company_code)
          .query('select code as [code], name as [name], paymenttype_code from MST_PaymentLocations where paymenttype_code = @paymenttype_code and company_code = @company_code order by code ' + sort)
      } 
    } catch (error) {
      return error
    }
    return result
  }
  // ***** 27/08/2021 Apiwat Emem Add End ***** //
}
