/*
Revisor:            Apiwat E.
Revision date:      30/Apr/2021
Revision Reason:    Modify table name
*/

const sql = require('mssql')
const config = require('../../../config/sitConfig')
module.exports = {
  getUserRole: async (email = null, is_active = 'Y', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (email !== null) {
        var sqlQuery = `select 
                    u.user_id as [user_id], 
                    u.email as [email], 
                    u.company_code as [company_code], 
                    u.division_code as [division_code], 
                    u.role as [role], 
                    c.name as [company_name], 
                    d.code as [division_code], 
                    d.name as [division_name], 
                    u.[name] as [name],
                    bu.name as [bu]  
                  from TRN_Users u 
                  left join MST_Companies c 
                  on u.company_code = c.code 
                  left join MST_BusinessUnit bu 
                  on c.business_unit_code = bu.code 
                  left join MST_Divisions d 
                  on u.division_code = d.code 
                  where u.email = @email 
                  and u.is_active = @is_active`
        result = await pool.request()
          .input('email', sql.NVarChar, email)
          .input('is_active', sql.Char, is_active)
          .query(sqlQuery)
      } else {
        var sqlQuery = `select 
                    u.user_id as [user_id], 
                    u.email as [email], 
                    u.company_code as [company_code], 
                    u.division_code as [division_code], 
                    u.role as [role], 
                    c.name as [company_name], 
                    d.code as [division_code], 
                    d.name as [division_name], 
                    u.[name] as [name],
                    bu.name as [bu] 
                    from TRN_Users u 
                    left join MST_Companies c 
                    on u.company_code = c.code 
                    left join MST_BusinessUnit bu 
                    on c.business_unit_code = bu.code 
                    left join MST_Divisions d 
                    on u.division_code = d.code 
                    where u.is_active = @is_active 
                    order by u.email ${sort} `
        result = await pool.request()
          .input('is_active', sql.Char, is_active)
          .query(sqlQuery)
      }
    } catch (error) {
      return error
    }
    return result
  },
  createUser: async (email, name, company_code, division_code, role = 'U', create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('company_code', sql.NVarChar, company_code)
        .input('division_code', sql.NVarChar, division_code)
        .input('role', sql.Char, role)
        .input('create_by', sql.NVarChar, create_by)
        // ***** 14/05/2021 Apiwat Emem Modify Start ***** //
        .input('name', sql.NVarChar, name)
        .query('insert into TRN_Users(email, [name], company_code, division_code, role, create_by, create_date) values(@email, @name, @company_code, @division_code, @role, @create_by, getdate());')
        // ***** 14/05/2021 Apiwat Emem Modify End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  updateRole: async (user_id, role = 'U', update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('user_id', sql.Int, user_id)
        .input('role', sql.Char, role)
        .input('update_by', sql.NVarChar, update_by)
        // ***** 30/Apr/2021 Apiwat Emem Mod Start ***** //
        .query('update TRN_Users set role = @role, update_by = @update_by, update_date = getdate() where user_id = @user_id')
        // ***** 30/Apr/2021 Apiwat Emem Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  deleteUserByUserId: async (user_id, is_active = 'N', update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('user_id', sql.Int, user_id)
        .input('is_active', sql.Char, is_active)
        .input('update_by', sql.NVarChar, update_by)
        // ***** 30/Apr/2021 Apiwat Emem Mod Start ***** //
        .query('update TRN_Users set is_active = @is_active, update_by = @update_by, update_date = getdate() where user_id = @user_id')
        // ***** 30/Apr/2021 Apiwat Emem Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  getUserRoleCount: async (role, is_active) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('role', sql.Char, role)
        .input('is_active', sql.Char, is_active)
        // ***** 30/Apr/2021 Apiwat Emem Mod Start ***** //
        .query('select count(email) as "count" from TRN_Users where role = @role and is_active = @is_active')
        // ***** 30/Apr/2021 Apiwat Emem Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 05/05/2021 Apiwat Emem Add Start ***** //
  checkUserByEmailCompanyDivision: async (email, company_code, division_code, is_active = 'Y') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('company_code', sql.NVarChar, company_code)
        .input('division_code', sql.NVarChar, division_code)
        .input('is_active', sql.Char, is_active)   
        .query('select count(email) as "count" from TRN_Users where email = @email and company_code = @company_code and division_code = @division_code and is_active = @is_active')       
    } catch (error) {
      return error
    }
    return result
  }
  // ***** 05/05/2021 Apiwat Emem Add End ***** //
}
