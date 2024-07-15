/*
Creator:            Apiwat Emem
Creation date:      06/05/2021
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
var logger = require('../../../util/logger4js')
module.exports = {
  getBeneficiary: async (code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (code !== null) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .query('select * from MST_Beneficiaries where code = @code')
      } else {
        result = await pool.request()
          .query('select * from MST_Beneficiaries order by code ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 28/05/2021 Apiwat Emem Add Start ***** //
  getBeneficiaryByVendorCode: async (vendor_code = null, company_code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (vendor_code !== null && company_code !== null) {
        result = await pool.request()
          .input('vendor_code', sql.NVarChar, vendor_code)
          .input('company_code', sql.NVarChar, company_code)
          .query('select code as [code], code + \' \' + accountno as [name] from MST_Beneficiaries where vendor_code = @vendor_code AND company_code = @company_code order by code + \' \' + accountno ' + sort)
      } else if (vendor_code !== null) {
        result = await pool.request()
          .input('vendor_code', sql.NVarChar, vendor_code)
          .query('select code as [code], code + \' \' + accountno as [name] from MST_Beneficiaries where vendor_code = @vendor_code order by code + \' \' + accountno ' + sort)
      } else {
        result = await pool.request()
          .query('select code as [code], code + \' \' + accountno as [name] from MST_Beneficiaries order by code + \' \' + accountno ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getBeneficiaryDownload: async (company_code = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (company_code !== null) {
        result = await pool.request()
          .input('company_code', sql.NVarChar, company_code)
          .query('select * from MST_Beneficiaries where company_code = @company_code')
      } else {
        result = await pool.request()
          .query('select * from MST_Beneficiaries order by code ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getBeneficiaryHistoryByCompanyCode: async (company_code = null, sort = 'DESC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (company_code !== null) {
        let sqlQuery = `SELECT 
                          company.code AS company_code,
                          company.name AS company_name,
                          users.name AS user_update_name,
                          ben_history.update_datetime
                        FROM MST_BeneficiariesHistory ben_history
                        LEFT JOIN MST_Companies company
                        ON ben_history.company_code = company.code
                        LEFT JOIN TRN_Users users
                        ON ben_history.update_by = users.email
                        WHERE ben_history.company_code = @company_code
                        ORDER BY ben_history.id ${sort}`
        result = await pool.request()
          .input('company_code', sql.NVarChar, company_code)
          .query(sqlQuery)
      } else {
        let sqlQuery = `SELECT 
                          company.code AS company_code,
                          company.name AS company_name,
                          users.name AS user_update_name,
                          ben_history.update_datetime
                        FROM MST_BeneficiariesHistory ben_history
                        LEFT JOIN MST_Companies company
                        ON ben_history.company_code = company.code
                        LEFT JOIN TRN_Users users
                        ON ben_history.update_by = users.email
                        ORDER BY ben_history.id ${sort}`
        result = await pool.request()
          .query(sqlQuery)
      }
    } catch (error) {
      console.log('error', error)
      return error
    }
    return result
  },
  insertBeneficiaryHistory: async (company_code, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('company_code', sql.NVarChar, company_code)
        .input('update_by', sql.NVarChar, update_by)
        .query('insert into MST_BeneficiariesHistory(company_code, update_by, update_datetime) values (@company_code, @update_by, getdate());')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  // ***** 28/05/2021 Apiwat Emem Add End ***** //
  updateBeneficiaryUpload: async (itemList, company_code) => {
    logger.info('Update beneficiary query start')
    let fieldNameList = ["code", "vendor_code", "accountno", "beneficiarycode", "beneficiaryname", "beneficiaryaddress", "beneficiarycountrycode",
      "abano", "ibanno", "bsbno", "ifsccode", "beneficiarybankname", "beneficiarybankaddress", "beneficiarybankswiftcode",
      "beneficiarybankcountrycode", "intermediatebankname", "intermediatebankaddress", "intermediatebankswiftcode", "intermediatesbankcountrycode", "company_code"]
    let valueString = ''
    itemList.forEach((item, index) => {
      let itemSting = '('
      fieldNameList.forEach((fieldName, fieldIndex) => {
        itemSting += item[fieldName] ? `'${item[fieldName]}'` : `''`
        if (fieldIndex !== fieldNameList.length - 1) {
          itemSting += ','
        }
      })
      itemSting += ")"
      if (index !== itemList.length - 1) {
        itemSting += ","
      }
      valueString += itemSting
    })
    let sqlQuery = `BEGIN TRY
                      BEGIN TRAN T1;
                  
                      DELETE FROM MST_Beneficiaries
                      WHERE company_code = @company_code
                      
                      INSERT INTO MST_Beneficiaries (${fieldNameList.join()}) 
                      SELECT ${fieldNameList.map(i => `t.${i}`)}
                      FROM (VALUES ${valueString}) 
                      AS t(${fieldNameList.join()});
                      
                      COMMIT TRAN T1;
                      
                      END TRY
                      BEGIN CATCH
                              ROLLBACK TRAN T1;
                      END CATCH`

    logger.info('sqlQuery :')
    logger.info(sqlQuery)

    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('company_code', sql.NVarChar, company_code)
        .query(sqlQuery)

    } catch (error) {
      console.log("error", error)
      return error
    }
    logger.info('Update beneficiary query end')
    return result
  },
}
