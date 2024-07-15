const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getApproverRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .query('SELECT * FROM TRN_Approvers ORDER BY user_id ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  getApproversByStartWithName: async (prefix = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Approvers where name like '%${prefix}%' order by name ${sort}`)
      } else {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Approvers order by name ${sort}`)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getApproversByStartWithEmail: async (prefix = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Approvers where email like '%${prefix}%' order by name ${sort}`)
      } else {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Approvers order by name ${sort}`)
      }
    } catch (error) {
      return error
    }
    return result
  },
  checkApproverByEmail: async (email) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('email', sql.Char, email)
        .query('SELECT COUNT(email) as "count" from TRN_Approvers WHERE email = @email')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  updateApprover: async (user_id, email, name, company_code, division_code, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
      .input('email', sql.Char, email)
      .input('name', sql.Char, name)
      .input('company_code', sql.Char, company_code)
      .input('division_code', sql.Char, division_code)
      .input('update_by', sql.NVarChar, update_by)
      .input('user_id', sql.Int, user_id)
      .query('UPDATE TRN_Approvers SET email = @email, name = @name, company_code = @company_code, division_code = @division_code, update_by = @update_by, update_date = getdate() WHERE user_id = @user_id')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  insertApprover: async (email, name, company_code, division_code, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('email', sql.Char, email)
        .input('name', sql.Char, name)
        .input('company_code', sql.Char, company_code)
        .input('division_code', sql.Char, division_code)
        .input('is_active', sql.Char, "Y")
        .input('create_by', sql.NVarChar, create_by)
        .query('INSERT INTO TRN_Approvers(email, name, company_code, division_code, is_active, create_by, create_date) VALUES (@email, @name, @company_code, @division_code, @is_active, @create_by, getdate());')
      } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteApproverByUserId: async (user_id, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('user_id', sql.Char, user_id)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        .query('UPDATE TRN_Approvers SET is_active = @is_active, update_by = @update_by, update_date = getdate() WHERE user_id = @user_id')
      } catch (error) {
      return error
    }
    return result
  },
}
