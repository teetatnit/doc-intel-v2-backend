const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getCompanyRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .query('SELECT * FROM MST_Companies ORDER BY code ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  getCompany: async (is_active = 'Y', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      const queryString = `select 
                              company.code as [company_code], 
                              company.name as [company_name], 
                              company.business_unit_code as [business_unit_code],
                              bu.name as [business_unit_name] 
                            from MST_Companies company
                            LEFT JOIN MST_BusinessUnit bu
                            ON company.business_unit_code = bu.code
                            where company.is_active = @is_active 
                            order by company.code ${sort}`
      result = await pool.request()
        .input('is_active', sql.NVarChar, is_active)
        .query(queryString)

    } catch (error) {
      return error
    }
    return result
  },
  // getCompanyByCode: async (company_code = null, is_active = 'Y', sort = 'asc') => {
  //   var result = false
  //   try {
  //     var pool = await sql.connect(config.sqlConn)
  //     if (code !== null) {
  //       result = await pool.request()
  //         .input('code', sql.NVarChar, company_code)
  //         .query('select code as [company_code], code + \' \' + name as [company_name] from MST_Companies where code = @code')
  //     } else {
  //       result = await pool.request()
  //         .input('is_active', sql.NVarChar, is_active)
  //         .query('select code as [company_code], code + \' \' + name as [company_name] from MST_Companies where is_active = @is_active order by code ' + sort)
  //     }
  //   } catch (error) {
  //     return error
  //   }
  //   return result
  // },
  checkCompanyByCode: async (company_code, is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, company_code)
        .input('is_active', sql.Char, is_active)
        .query('select count(code) as "count" from MST_Companies where code = @code and is_active = @is_active')
    } catch (error) {
      return error
    }
    return result
  },
  updateCompany: async (company_code, company_name, business_unit_code, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, company_code)
        .input('name', sql.Char, company_name)
        .input('business_unit_code', sql.Char, business_unit_code)
        .input('update_by', sql.NVarChar, update_by)
        .query('update MST_Companies set name = @name, business_unit_code = @business_unit_code, update_by = @update_by, update_date = getdate() where code = @code')
    } catch (error) {
      return error
    }
    return result
  },
  insertCompany: async (company_code, company_name, business_unit_code, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, company_code)
        .input('name', sql.Char, company_name)
        .input('business_unit_code', sql.Char, business_unit_code)
        .input('create_by', sql.NVarChar, create_by)
        .query('insert into MST_Companies(code, name, business_unit_code, create_by, create_date) values (@code, @name, @business_unit_code, @create_by, getdate());')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteCompanyByCompanyCode: async (company_code, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('code', sql.Char, company_code)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        .query('update MST_Companies set is_active = @is_active, update_by = @update_by, update_date = getdate() where code = @code')
    } catch (error) {
      return error
    }
    return result
  },
}
