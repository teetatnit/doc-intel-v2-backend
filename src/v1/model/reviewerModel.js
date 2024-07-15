const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getReviewerRaw: async (sort = 'ASC') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)

      result = await pool.request()
        .query('SELECT * FROM TRN_Reviewers ORDER BY user_id ' + sort)
    } catch (error) {
      return error
    }
    return result
  },
  getReviewersByStartWithName: async (prefix = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Reviewers where name like '%${prefix}%' order by name ${sort}`)
      } else {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Reviewers order by name ${sort}`)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getReviewersByStartWithEmail: async (prefix = null, sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (prefix !== null) {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Reviewers where email like '%${prefix}%' order by name ${sort}`)
      } else {
        result = await pool.request()
          .query(`select email as [value], name as [text] from TRN_Reviewers order by name ${sort}`)
      }
    } catch (error) {
      return error
    }
    return result
  },
  checkReviewerByEmail: async (email) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('email', sql.Char, email)
        .query('SELECT COUNT(email) as "count" from TRN_Reviewers WHERE email = @email')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  updateReviewer: async (user_id, email, name, company_code, division_code, update_by) => {
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
      .query('UPDATE TRN_Reviewers SET email = @email, name = @name, company_code = @company_code, division_code = @division_code, update_by = @update_by, update_date = getdate() WHERE user_id = @user_id')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  insertReviewer: async (email, name, company_code, division_code, create_by) => {
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
        .query('INSERT INTO TRN_Reviewers(email, name, company_code, division_code, is_active, create_by, create_date) VALUES (@email, @name, @company_code, @division_code, @is_active, @create_by, getdate());')
      } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  deleteReviewerByUserId: async (user_id, is_active, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('user_id', sql.Char, user_id)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        .query('UPDATE TRN_Reviewers SET is_active = @is_active, update_by = @update_by, update_date = getdate() WHERE user_id = @user_id')
      } catch (error) {
      return error
    }
    return result
  },
}
