/*
Revisor:            Chanakan C.
Revision date:      29/Apr/2021
Revision Reason:    Modify query and table name

Revisor:            Apiwat E.
Revision date:      07/May/2021
Revision Reason:    Modify query and table name
*/
const fs = require('fs')
const sql = require('mssql')
const config = require('../../../config/sitConfig')
// ***** 29/Apr/2021 Chanakan C. Add Start ***** //
const JsonFind = require('json-find');
const moment = require('moment');
const { BlobServiceClient } = require('@azure/storage-blob')
var debugLogsModel = require('./debugLogsModel')

const monthTHList = [
  { name: "มกราคม", code: '01' },
  { name: "กุมภาพันธ", code: '02' },
  { name: "มีนาคม", code: '03' },
  { name: "เมษายน", code: '04' },
  { name: "พฤษภาคม", code: '05' },
  { name: "มิถุนายน", code: '06' },
  { name: "กรกฎาคม", code: '07' },
  { name: "สิงหาคม", code: '08' },
  { name: "กันยายน", code: '09' },
  { name: "ตุลาคม", code: '10' },
  { name: "พฤศจิกายน", code: '11' },
  { name: "ธันวาคม", code: '12' },

  { name: "ม.ค.", code: '01' },
  { name: "ก.พ.", code: '02' },
  { name: "มี.ค.", code: '03' },
  { name: "เม.ย.", code: '04' },
  { name: "พ.ค.", code: '05' },
  { name: "มิ.ย.", code: '06' },
  { name: "ก.ค.", code: '07' },
  { name: "ส.ค.", code: '08' },
  { name: "ก.ย.", code: '09' },
  { name: "ต.ค.", code: '10' },
  { name: "พ.ย.", code: '11' },
  { name: "ธ.ค.", code: '12' },
]

const dateFormatList = [
  "DDMMYYYY",
  "DDMMYY",
  "DDMMMYYYY",
  "DDMMMYY",
  "DDMMMMYYYY",
  "DDMMMMYY",

  "DMMMYYYY",
  "DMMMYY",
  "DMMMMYYYY",
  "DMMMMYY",

  "DD/M/YYYY",
  "DD-M-YYYY",
  "DD.M.YYYY",
  "DD M YYYY",


  "DD/M/YY",
  "DD-M-YY",
  "DD.M.YY",
  "DD M YY",

  "DD/MM/YYYY",
  "DD-MM-YYYY",
  "DD.MM.YYYY",
  "DD MM YYYY",


  "DD/MM/YY",
  "DD-MM-YY",
  "DD.MM.YY",
  "DD MM YY",


  "DD/MMM/YYYY",
  "DD-MMM-YYYY",
  "DD.MMM.YYYY",
  "DD MMM YYYY",


  "DD/MMM/YY",
  "DD-MMM-YY",
  "DD.MMM.YY",
  "DD MMM YY",


  "DD/MMMM/YYYY",
  "DD-MMMM-YYYY",
  "DD.MMMM.YYYY",
  "DD MMMM YYYY",


  "DD/MMMM/YY",
  "DD-MMMM-YY",
  "DD.MMMM.YY",
  "DD MMMM YY",

  "D/MM/YYYY",
  "D-MM-YYYY",
  "D.MM.YYYY",
  "D MM YYYY",

  "DD/M/YY",
  "DD-M-YY",
  "DD.M.YY",
  "DD M YY",

  "D/MM/YYYY",
  "D-MM-YYYY",
  "D.MM.YYYY",
  "D MM YYYY",

  "DD/MM/YY",
  "DD-MM-YY",
  "DD.MM.YY",
  "DD MM YY",

  "D/MMM/YYYY",
  "D-MMM-YYYY",
  "D.MMM.YYYY",
  "D MMM YYYY",

  "D/MMM/YY",
  "D-MMM-YY",
  "D.MMM.YY",
  "D MMM YY",

  "D/MMMM/YYYY",
  "D-MMMM-YYYY",
  "D.MMMM.YYYY",
  "D MMMM YYYY",

  "D/MMMM/YY",
  "D-MMMM-YY",
  "D.MMMM.YY",
  "D MMMM YY",

  "YYYY/MM/DD",
  "YYYY-MM-DD",
  "YYYY.MM.DD",
  "YYYY MM DD",

  "YYYY/MMM/DD",
  "YYYY-MMM-DD",
  "YYYY.MMM.DD",
  "YYYY MMM DD",

  "YYYY/MMMM/DD",
  "YYYY-MMMM-DD",
  "YYYY.MMMM.DD",
  "YYYY MMMM DD",
];

function convertDateStringFormat(dateStr) {
  dateStr = dateStr.replace(/\s/g, '');
  monthTHList.forEach(month => {
    if (dateStr.search(month.name) !== -1) {
      dateStr = dateStr.replace(month.name, month.code)
    }
  })
  var dateFormatIsValid = null;
  dateFormatList.forEach((dateFormat) => {
    if (dateFormatIsValid === null) {
      if (moment(dateStr, dateFormat, true).isValid()) {
        dateFormatIsValid = dateFormat;
      }
    }
  });

  var date = ''
  if (dateFormatIsValid !== null) {
    date = moment(dateStr, dateFormatIsValid);
  } else if (Date.parse(dateStr)) {
    date = moment(Date.parse(dateStr))
  }

  var formatDate = date !== '' ?
    date.format('YYYY') > moment().add(500, 'years').format('YYYY') ?
      date.subtract(543, 'years').format('YYYY-MM-DDTHH:mm:ssZ')
      : date.format('YYYY-MM-DDTHH:mm:ssZ')
    : ''
  return {
    dateMoment: formatDate,
    dateFormat: dateFormatIsValid
  }
};

// function convertDateStringFormat(dateStr) {
//   var date = ''
//   if (moment(dateStr, "DD/MM/YYYY", true).isValid()) {
//     date = moment(dateStr, "DD/MM/YYYY")
//   } else if (moment(dateStr, "DD/M/YYYY", true).isValid()) {
//     date = moment(dateStr, "DD/M/YYYY")
//   } else if (moment(dateStr, "D/MM/YYYY", true).isValid()) {
//     date = moment(dateStr, "D/MM/YYYY")
//   } else if (moment(dateStr, "D/M/YYYY", true).isValid()) {
//     date = moment(dateStr, "D/M/YYYY")

//   } else if (moment(dateStr, "DDMMYYYY", true).isValid()) {
//     date = moment(dateStr, "DDMMYYYY")
//   } else if (Date.parse(dateStr)) {
//     date = moment(Date.parse(dateStr))
//   } else {
//     date = ''
//   }
//   var formatDate = date !== '' ?
//     date.format('YYYY') > moment().add(500, 'years').format('YYYY') ?
//       date.subtract(543, 'years').format('YYYY-MM-DDTHH:mm:ssZ')
//       : date.format('YYYY-MM-DDTHH:mm:ssZ')
//     : ''
//   return formatDate
// };

var convertStringToDecimal = (value, numberStyleId) => {
  console.log("numberStyleId", numberStyleId)
  if (value === null || value === '') {
    return ''
  } else {
    value = value.replace(/ /g, '')
    if (numberStyleId == 2) {  // For Vietnam
      value = value.replace(/\./g, '').replace(/,/g, '.')
    } else { // For Generate
      value = value.replace(/,/g, '')
    }
    value = parseFloat(value) ? parseFloat(value) : 0
    return value
  }
}
// ***** 29/Apr/2021 Chanakan C. Add End ***** //

var streamToBase64 = (stream) => {
  const concat = require('concat-stream')
  const { Base64Encode } = require('base64-stream')

  return new Promise((resolve, reject) => {
    const base64 = new Base64Encode()

    const cbConcat = (base64) => {
      resolve(base64)
    }

    stream
      .pipe(base64)
      .pipe(concat(cbConcat))
      .on('error', (error) => {
        reject(error)
      })
  })
}

function ConvertKeysToLowerCase(obj) {
  var output = {};
  for (i in obj) {
    output[i.toLowerCase()] = obj[i];
  }
  return output;
};

// ***** 29/Apr/2021 Chanakan C. Mod Start ***** //
module.exports = {
  uploadAttachFileToAzureStorageBlob: async (attachFile) => {
    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureStorage.connectionString);
      const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(attachFile.file_name);
      const blobType = attachFile.file_name.split(".")[1]
      const blobOptions = {
        blobHTTPHeaders: { blobContentType: `application/${blobType}` },
      };

      // const full_file_path = attachFile.full_path.replace(/\\/g, '/')  // for mac os
      const full_file_path = attachFile.full_path
      var uploadBlobResponse = await blockBlobClient.uploadFile(full_file_path, blobOptions)
      console.log("Blob was uploaded successfully. Request id: ", uploadBlobResponse.requestId);

      // Delete original file in localpath
      fs.unlink(full_file_path, (err) => {
        if (err) {
          console.error(err)
          return
        }
      });

      return true
    } catch (error) {
      console.log('Upload attach file to azure storage blob fail')
      console.log(error)
      return false
    }
  },
  getOCRFileList: async (req) => {

    // For test only START //
    // testOriginalResultToResponseResult()
    // For test only END //

    var result = false
    var is_delete = (req.query.is_delete !== undefined ? ['true', true].includes(req.query.is_delete) ? ' o.[is_delete] LIKE \'%\' ' : ' o.[is_delete] = \'N\' ' : ' o.[is_delete] = \'N\' ')
    var file_id = (req.params.file_id !== undefined ? ' AND o.[file_id] = \'' + req.params.file_id + '\'' : ' AND o.[file_id] LIKE \'%\'')
    var uploadedBy = (req.query.uploadedBy !== undefined && req.query.uploadedBy === 'personal' ? ' AND o.[create_by] = \'' + req.cur_user + '\'' : ' AND o.[create_by] LIKE \'%\'')
    var uploadedDateRange = (req.query.uploadedDateRange !== undefined ? ' AND o.[ocr_date] >= \'' + req.query.uploadedDateRange[0] + ' 00:00:00\'' + ' AND o.[ocr_date] <= \'' + req.query.uploadedDateRange[1] + ' 23:59:59\'' : ' AND o.[ocr_date] LIKE \'%\'')
    var documentType = (req.query.documentType !== undefined ? ' AND m.[document_code] = \'' + req.query.documentType + '\'' : ' AND m.[document_code] LIKE \'%\'')
    var vendor = (req.query.vendor !== undefined ? ' AND m.[vendor_code] = \'' + req.query.vendor + '\'' : ' AND m.[vendor_code] LIKE \'%\'')
    var additionalInfo = (req.query.additionalInfo !== undefined ? ' AND m.[masterdata_id] = \'' + req.query.additionalInfo + '\'' : ' AND m.[masterdata_id] LIKE \'%\'')
    var sort = (req.query.sort !== undefined && req.query.sort.toLowerCase() === 'desc' ? 'desc' : 'asc')
    var queryString = `SELECT TOP (1000) 
                        o.file_id, 
                        o.file_name, 
                        o.file_size, 
                        o.masterdata_id, 
                        o.original_name, 
                        o.file_path, 
                        o.full_path, 
                        o.original_result, 
                        o.modify_result, 
                        CASE WHEN o.invoice_no IS NOT NULL THEN o.invoice_no ELSE \'-\' END \'invoice_no\', 
                        o.allpay_no, 
                        o.allpay_result_message, 
                        o.remark, 
                        o.ocr_status, 
                        o.is_delete, 
                        o.create_by, 
                        o.create_date, 
                        o.update_by, 
                        o.update_date, 
                        CASE WHEN o.ocr_date IS NOT NULL THEN FORMAT(o.ocr_date,\'dd/MM/yyyy\') ELSE \'-\' END \'ocr_date\', 
                        m.document_code, 
                        m.additional_info, 
                        m.model_id,
                        m.day_auto_duedate,
                        d.name as [document_name], 
                        v.code as [vendor_code], 
                        v.name as [vendor_name], 
                        v.email as [vendor_email], 
                        c.code as [company_code], 
                        c.name as [company_name], 
                        u.name as [create_name] 
                      FROM TRN_OcrFiles o 
                      LEFT JOIN TRN_MasterDatas m on o.masterdata_id = m.masterdata_id 
                      LEFT JOIN MST_Documents d on m.document_code = d.code 
                      LEFT JOIN MST_Vendors v on m.vendor_code = v.code 
                      LEFT JOIN MST_Companies c on JSON_VALUE(o.modify_result,\'$.Company\') = c.code 
                      LEFT JOIN (select distinct email, name from TRN_Users) u on u.email = o.create_by 
                      WHERE ${is_delete} ${file_id} ${uploadedBy} ${uploadedDateRange} ${documentType} ${vendor} ${additionalInfo} 
                      AND ISJSON(o.modify_result) > 0 order by o.file_id ${sort}`
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .query(queryString)
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  getOCRFilesTotalPageExtracted: async (req) => {
    var result = false
    var is_delete = (req.query.is_delete !== undefined ? ['true', true].includes(req.query.is_delete) ? ' o.[is_delete] LIKE \'%\' ' : ' o.[is_delete] = \'N\' ' : ' o.[is_delete] = \'N\' ')
    var uploadedBy = (req.query.uploadedBy !== undefined && req.query.uploadedBy === 'personal' ? ' AND o.[create_by] = \'' + req.cur_user + '\'' : ' AND o.[create_by] LIKE \'%\'')
    var uploadedDateRange = (req.query.uploadedDateRange !== undefined ? ' AND o.[ocr_date] >= \'' + req.query.uploadedDateRange[0] + ' 00:00:00\'' + ' AND o.[ocr_date] <= \'' + req.query.uploadedDateRange[1] + ' 23:59:59\'' : ' AND o.[ocr_date] LIKE \'%\'')
    var documentType = (req.query.documentType !== undefined ? ' AND m.[document_code] = \'' + req.query.documentType + '\'' : ' AND m.[document_code] LIKE \'%\'')
    var vendor = (req.query.vendor !== undefined ? ' AND m.[vendor_code] = \'' + req.query.vendor + '\'' : ' AND m.[vendor_code] LIKE \'%\'')
    var additionalInfo = (req.query.additionalInfo !== undefined ? ' AND m.[masterdata_id] = \'' + req.query.additionalInfo + '\'' : ' AND m.[masterdata_id] LIKE \'%\'')
    var queryString = `SELECT 
                        SUM(ISNULL(o.total_pages_extracted, 0)) as "total_page_extracted" 
                        FROM TRN_OcrFiles o 
                        LEFT JOIN TRN_MasterDatas m on o.masterdata_id = m.masterdata_id 
                        WHERE ${is_delete} ${uploadedBy} ${uploadedDateRange} ${documentType} ${vendor} ${additionalInfo} `
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .query(queryString)
    } catch (error) {
      return error
    }
    return result
  },

  // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
  // ***** 29/Apr/2021 Chanakan C. Add Start ***** //
  getOCRFileContent: async (file_id, is_delete = 'N') => {

    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('file_id', sql.Int, file_id)
        .input('is_delete', sql.Char, is_delete)
        .query('select o.file_id, o.file_name, o.file_size, o.masterdata_id, o.original_name, o.file_path, o.full_path, o.original_result, o.modify_result, CASE WHEN o.invoice_no IS NOT NULL THEN o.invoice_no ELSE \'-\' END \'invoice_no\', o.allpay_no, o.allpay_result_message, o.remark, o.ocr_status, o.is_delete, o.create_by, o.create_date, o.update_by, o.update_date, CASE WHEN o.ocr_date IS NOT NULL THEN FORMAT(o.ocr_date,\'dd/MM/yyyy\') ELSE \'-\' END \'ocr_date\', m.document_code, m.additional_info, m.model_id, d.name as [document_name], v.code as [vendor_code], v.name as [vendor_name], v.email as [vendor_email], c.code as [company_code], c.name as [company_name] from TRN_OcrFiles o left join TRN_MasterDatas m on o.masterdata_id = m.masterdata_id left join MST_Documents d on m.document_code = d.code left join MST_Vendors v on m.vendor_code = v.code left join MST_Companies c on JSON_VALUE(o.modify_result,\'$.Company\') = c.code WHERE file_id = @file_id AND o.is_delete = @is_delete')

      const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureStorage.connectionString);
      const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(result.recordset[0].file_name);

      result = await blockBlobClient.download();

    } catch (error) {
      return error
    }
    return result
  },
  // ***** 29/Apr/2021 Chanakan C. Add End ***** //
  getOCRFileByStatus: async (ocr_status, limit = 0, is_delete = 'N') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
      var query = (limit > 0 ? 'select top ' + limit + ' o.file_id, o.file_name, o.masterdata_id, o.original_name, o.file_path, o.full_path, o.original_result, o.modify_result, o.allpay_no, o.allpay_result_message, o.remark, o.ocr_status, o.is_delete, o.create_by, o.create_date, o.update_by, o.update_date, m.document_code, m.vendor_code, m.additional_info, m.model_id, d.name as [document_name], v.code as [vendor_code], v.name as [vendor_name], v.email as [vendor_email], c.code as [company_code], c.name as [company_name] from TRN_OcrFiles o left join TRN_MasterDatas m on o.masterdata_id = m.masterdata_id left join MST_Documents d on m.document_code = d.code left join MST_Vendors v on m.vendor_code = v.code left join MST_Companies c on JSON_VALUE(o.modify_result,\'$.Company\') = c.code where o.ocr_status = @ocr_status and o.is_delete = @is_delete ' : 'select o.file_id, o.file_name, o.masterdata_id, o.original_name, o.file_path, o.full_path, o.original_result, o.modify_result, o.allpay_no, o.allpay_result_message, o.remark, o.ocr_status, o.is_delete, o.create_by, o.create_date, o.update_by, o.update_date, m.document_code, m.vendor_code, m.additional_info, m.model_id, d.name as [document_name], v.code as [vendor_code], v.name as [vendor_name], v.email as [vendor_email], c.code as [company_code], c.name as [company_name] from TRN_OcrFiles o left join TRN_MasterDatas m on o.masterdata_id = m.masterdata_id left join MST_Documents d on m.document_code = d.code left join MST_Vendors v on m.vendor_code = v.code left join MST_Companies c on JSON_VALUE(o.modify_result,\'$.item.companycode\') = c.code where o.ocr_status = @ocr_status and o.is_delete = @is_delete ')
      // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
      result = await pool.request()
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('is_delete', sql.Char, is_delete)
        .query(query)
    } catch (error) {
      return error
    }
    return result
  },

  upsertOCRFileandStatus: async (data, file_id = null) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        // ***** 29/Apr/2021 Chanakan C. Add Start ***** //
        if (data.modify_result !== undefined && data.modify_result !== null) {
          // ***** 29/Apr/2021 Chanakan C. Add End ***** //
          result = await pool.request()
            .input('file_id', sql.Int, file_id)
            .input('modify_result', sql.NVarChar, data.modify_result)
            .input('ocr_status', sql.NVarChar, data.ocr_status)
            .input('update_by', sql.NVarChar, data.update_by)
            // ***** 29/Apr/2021 Chanakan C. Mod Start ***** //
            .query('update TRN_OcrFiles set modify_result = @modify_result, ocr_status = @ocr_status, update_by = @update_by, update_date = getdate() where file_id = @file_id')
          // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
        } else {
          result = await pool.request()
            .input('file_id', sql.Int, file_id)
            .input('original_result', sql.NVarChar, data.original_result)
            .input('ocr_status', sql.NVarChar, data.ocr_status)
            // ***** 29/Apr/2021 Chanakan C. Mod Start ***** //
            .query('update TRN_OcrFiles set original_result = @original_result, ocr_status = @ocr_status, ocr_date = getdate() where file_id = @file_id')
          // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
        }
      } else {
        result = await pool.request()
          .input('file_name', sql.NVarChar, data.file_name)
          .input('file_size', sql.NVarChar, data.file_size)
          .input('masterdata_id', sql.Int, data.masterdata_id)
          .input('original_name', sql.NVarChar, data.original_name)
          .input('file_path', sql.NVarChar, data.file_path)
          .input('full_path', sql.NVarChar, data.full_path)
          .input('specific_page', sql.NVarChar, data.specific_page)
          .input('ocr_status', sql.NVarChar, 'U')
          .input('create_by', sql.NVarChar, data.create_by)
          .input('total_pages_extracted', sql.NVarChar, data.total_pages_extracted)
          // ***** 29/Apr/2021 Chanakan C. Mod Start ***** //
          .query('insert into TRN_OcrFiles ([file_name], [file_size], [masterdata_id], [original_name], [file_path], [full_path], [specific_page], [ocr_status], [create_by], [total_pages_extracted], [create_date], [update_by], [update_date]) VALUES (@file_name, @file_size, @masterdata_id, @original_name, @file_path, @full_path, @specific_page, @ocr_status, @create_by, @total_pages_extracted, getdate(), @create_by, getdate()); SELECT SCOPE_IDENTITY() AS file_id;')
        // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
      }
    } catch (error) {
      return error
    }
    return result
  },
  getOCRFileAndMasterDataByStatus: async (ocr_status, limit = 0, is_delete = 'N') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var query = `select 
            o.file_id, 
            o.file_name, 
            o.masterdata_id, 
            o.original_name, 
            o.file_path, 
            o.full_path, 
            o.specific_page, 
            o.original_result, 
            o.modify_result, 
            o.allpay_no, 
            o.allpay_result_message, 
            o.remark, o.ocr_status, 
            o.is_delete, o.create_by, 
            o.create_date, o.update_by, 
            o.update_date, 
            m.document_code, 
            m.vendor_code, 
            m.additional_info, 
            m.number_style_id,
            m.model_id, d.name as [document_name], 
            v.name as [vendor_name], 
            v.email as [vendor_email], 
            c.code as [company_code], 
            c.name as [company_name] 
          from TRN_OcrFiles o 
          left join TRN_MasterDatas m 
          on o.masterdata_id = m.masterdata_id 
          left join MST_Documents d 
          on m.document_code = d.code 
          left join MST_Vendors v 
          on m.vendor_code = v.code 
          left join MST_Companies c 
          on JSON_VALUE(o.modify_result,\'$.Company\') = c.code 
          where o.ocr_status = @ocr_status 
          and o.is_delete = @is_delete `
      if (limit > 0) {
        query = `select top (${limit}) 
          o.file_id, o.file_name, 
          o.masterdata_id, 
          o.original_name, 
          o.file_path, 
          o.full_path, 
          o.specific_page, 
          o.original_result, 
          o.modify_result, 
          o.allpay_no, 
          o.allpay_result_message, 
          o.remark, 
          o.ocr_status, 
          o.is_delete, 
          o.create_by, 
          o.create_date, 
          o.update_by, 
          o.update_date, 
          m.document_code, 
          m.vendor_code, 
          m.additional_info, 
          m.number_style_id,
          m.model_id, 
          d.name as [document_name], 
          v.name as [vendor_name], 
          v.email as [vendor_email], 
          c.code as [company_code], 
          c.name as [company_name] 
      from TRN_OcrFiles o 
      left join TRN_MasterDatas m 
      on o.masterdata_id = m.masterdata_id 
      left join MST_Documents d 
      on m.document_code = d.code 
      left join MST_Vendors v 
      on m.vendor_code = v.code 
      left join MST_Companies c 
      on JSON_VALUE(o.modify_result,\'$.Company\') = c.code 
      where o.ocr_status = @ocr_status 
      and o.is_delete = @is_delete `
      }
      result = await pool.request()
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('is_delete', sql.Char, is_delete)
        .query(query)
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 29/Apr/2021 Chanakan C. Add Start ***** //

  getOCRFileAndMasterDataByFileId: async (file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var query = `select top (1) 
                    o.file_id, 
                    o.file_name, 
                    o.masterdata_id, 
                    o.original_name, 
                    o.file_path, 
                    o.full_path, 
                    o.specific_page, 
                    o.original_result, 
                    o.modify_result, 
                    o.allpay_no, 
                    o.allpay_result_message, 
                    o.remark, o.ocr_status, 
                    o.is_delete, o.create_by, 
                    o.create_date, o.update_by, 
                    o.update_date, 
                    m.document_code, 
                    m.vendor_code, 
                    m.additional_info, 
                    m.number_style_id,
                    m.model_id, 
                    d.name as [document_name], 
                    v.name as [vendor_name], 
                    v.email as [vendor_email], 
                    c.code as [company_code], 
                    c.name as [company_name] 
                    from TRN_OcrFiles o 
                    left join TRN_MasterDatas m 
                    on o.masterdata_id = m.masterdata_id 
                    left join MST_Documents d 
                    on m.document_code = d.code 
                    left join MST_Vendors v 
                    on m.vendor_code = v.code 
                    left join MST_Companies c 
                    on JSON_VALUE(o.modify_result,\'$.Company\') = c.code 
                    where o.file_id = @file_id `      
      result = await pool.request()
        .input('file_id', sql.NVarChar, file_id)
        .query(query)
    } catch (error) {
      return error
    }
    return result
  },

  getOCRByFileId: async (file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var query = 'SELECT * FROM TRN_OcrFiles WHERE file_id = @file_id '
      result = await pool.request()
        .input('file_id', sql.NVarChar, file_id)
        .query(query)
    } catch (error) {
      return error
    }
    return result
  },
  updateOCRModifyResultByFileId: async (ocrFile, respOcr, fields) => {
    var result = false
    const numberStyleId = ocrFile.number_style_id
    respOcr['vendor'] = ocrFile.vendor_code
    respOcr['create date'] = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    respOcr['creator'] = ocrFile.create_by
    respOcr['document type'] = ocrFile.document_code

    respOcr = ConvertKeysToLowerCase(respOcr);
    for (const itemKey in respOcr) {
      console.log('respOcr -', itemKey, ':', respOcr[itemKey])
    }
    console.log("---------- ---------- ---------- ---------- ----------")

    const jsonStr = JsonFind(respOcr);

    let stringModifyResult = '{'
    try {
      fields.recordset.forEach(item => {
        let fieldValue = ''
        let tempFieldValue = item.default_value
        if (jsonStr.checkKey(item.display_name.toLowerCase()) && item.is_ocr) {
          try {
            tempFieldValue = respOcr[item.display_name.toLowerCase()].toString()
          } catch (error) {
            tempFieldValue = ''
            console.log('respOcr[item.display_name.toLowerCase()].toString() error : ', error)
          }
        }

        if (item.is_variable && item.default_value != '' && item.default_value != null && item.default_value != undefined) {
          try {
            tempFieldValue = respOcr[item.default_value.toLowerCase()].toString()
          } catch (error) {
            tempFieldValue = ''
            console.log('tempFieldValue = respOcr[item.default_value.toLowerCase()].toString() error : ', error)
          }
        }

        if (tempFieldValue === null || tempFieldValue === undefined) {
          fieldValue = ''
        } else if (item.field_type === 'DT') {
          let dateStr = tempFieldValue
          let formatDate = convertDateStringFormat(dateStr)
          fieldValue = formatDate.dateMoment
        } else if (item.field_type === 'D') {
          let value = convertStringToDecimal(tempFieldValue, numberStyleId)
          fieldValue = isNaN(value) ? 0 : value
        } else {
          fieldValue = tempFieldValue;
        }

        stringModifyResult = stringModifyResult + '"' + item.display_name + '":"' + fieldValue + '",'
        console.log('modifyResult -', item.display_name, ' :', fieldValue)
      });

      stringModifyResult = stringModifyResult.substring(0, stringModifyResult.length - 1)
      stringModifyResult = stringModifyResult + '}'
    } catch (error) {
      stringModifyResult = '{}'
      console.log(error)
    }

    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('file_id', sql.Int, ocrFile.file_id)
        .input('invoice_no', sql.NVarChar, respOcr['Document No.'])
        .input('modify_result', sql.NVarChar, stringModifyResult)
        .input('update_by', sql.NVarChar, ocrFile.create_by)
        .query('UPDATE TRN_OcrFiles SET modify_result = @modify_result, invoice_no = @invoice_no, update_by = @update_by, update_date = GETDATE(), ocr_date = GETDATE() WHERE file_id = @file_id')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },

  updateOCRModifyResultByFileIdPreviousVersion: async (ocrFile, respOcr, fields, vatRate, whtRate) => {
    await debugLogsModel.createDebugLogs('INPUT_OCR_FILE', JSON.stringify(ocrFile))
    await debugLogsModel.createDebugLogs('INPUT_RESP_OCR', JSON.stringify(respOcr))
    await debugLogsModel.createDebugLogs('INPUT_FIELDS', JSON.stringify(fields))
    var result = false
    respOcr['vendor'] = ocrFile.vendor_code
    respOcr['create date'] = moment().format('YYYY-MM-DDTHH:mm:ssZ')
    respOcr['creator'] = ocrFile.create_by
    respOcr['document type'] = ocrFile.document_code

    respOcr = ConvertKeysToLowerCase(respOcr);

    if (respOcr.hasOwnProperty('amount')) {
      respOcr['amount (exclude vat.)'] = 0
      if (Array.isArray(respOcr['amount'])) {
        let i = 0
        respOcr['amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'Amount 1' && e.is_ocr === true)) {
              respOcr['amount (exclude vat.)'] = respOcr['amount (exclude vat.)'] + amount
            }
          } else if (i == 2) {
            respOcr['amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'Amount 2' && e.is_ocr === true)) {
              respOcr['amount (exclude vat.)'] = respOcr['amount (exclude vat.)'] + amount
            }
          } else if (i == 3) {
            respOcr['amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'Amount 3' && e.is_ocr === true)) {
              respOcr['amount (exclude vat.)'] = respOcr['amount (exclude vat.)'] + amount
            }
          } else if (i == 4) {
            respOcr['amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'Amount 4' && e.is_ocr === true)) {
              respOcr['amount (exclude vat.)'] = respOcr['amount (exclude vat.)'] + amount
            }
          } else {
            respOcr['amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'Amount 5' && e.is_ocr === true)) {
              respOcr['amount (exclude vat.)'] = respOcr['amount (exclude vat.)'] + amount
            }
          }
        })
      } else {
        respOcr['amount (exclude vat.)'] = convertStringToDecimal(respOcr['amount'])
      }
    } else if (respOcr.hasOwnProperty('amount (exclude vat.)')) {
      respOcr['amount (exclude vat.)'] = convertStringToDecimal(respOcr['amount (exclude vat.)'])
    } else {
      respOcr['amount (exclude vat.)'] = ''
    }

    if (respOcr.hasOwnProperty('vat base amount')) {
      respOcr['vat base total amount'] = 0
      if (Array.isArray(respOcr['vat base amount'])) {
        let i = 0
        respOcr['vat base amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['vat base amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'VAT Base Amount 1' && e.is_ocr === true)) {
              respOcr['vat base total amount'] = respOcr['vat base total amount'] + amount
            }
          } else if (i == 2) {
            respOcr['vat base amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'VAT Base Amount 2' && e.is_ocr === true)) {
              respOcr['vat base total amount'] = respOcr['vat base total amount'] + amount
            }
          } else if (i == 3) {
            respOcr['vat base amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'VAT Base Amount 3' && e.is_ocr === true)) {
              respOcr['vat base total amount'] = respOcr['vat base total amount'] + amount
            }
          } else if (i == 4) {
            respOcr['vat base amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'VAT Base Amount 4' && e.is_ocr === true)) {
              respOcr['vat base total amount'] = respOcr['vat base total amount'] + amount
            }
          } else {
            respOcr['vat base amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'VAT Base Amount 5' && e.is_ocr === true)) {
              respOcr['vat base total amount'] = respOcr['vat base total amount'] + amount
            }
          }
        })
      } else {
        respOcr['vat base total amount'] = convertStringToDecimal(respOcr['vat base amount'])
      }
    } else {
      if (respOcr.hasOwnProperty('vat base total amount')) {
        respOcr['vat base total amount'] = convertStringToDecimal(respOcr['vat base total amount'])
      } else {
        respOcr['vat base total amount'] = respOcr.hasOwnProperty('amount (exclude vat.)') ?
          respOcr['amount (exclude vat.)']
          : ''
      }
    }

    if (respOcr.hasOwnProperty('wht base amount')) {
      respOcr['wht base total amount'] = 0
      if (Array.isArray(respOcr['wht base amount'])) {
        let i = 0
        respOcr['wht base amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['wht base amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT Base Amount 1' && e.is_ocr === true)) {
              respOcr['wht base total amount'] = respOcr['wht base total amount'] + amount
            }
          } else if (i == 2) {
            respOcr['wht base amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT Base Amount 2' && e.is_ocr === true)) {
              respOcr['wht base total amount'] = respOcr['wht base total amount'] + amount
            }
          } else if (i == 3) {
            respOcr['wht base amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT Base Amount 3' && e.is_ocr === true)) {
              respOcr['wht base total amount'] = respOcr['wht base total amount'] + amount
            }
          } else if (i == 4) {
            respOcr['wht base amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT Base Amount 4' && e.is_ocr === true)) {
              respOcr['wht base total amount'] = respOcr['wht base total amount'] + amount
            }
          } else {
            respOcr['wht base amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT Base Amount 5' && e.is_ocr === true)) {
              respOcr['wht base total amount'] = respOcr['wht base total amount'] + amount
            }
          }
        })
      } else {
        respOcr['wht base total amount'] = convertStringToDecimal(respOcr['wht base amount'])
      }
    } else {
      if (respOcr.hasOwnProperty('wht base total amount')) {
        respOcr['wht base total amount'] = convertStringToDecimal(respOcr['wht base total amount'])
      } else {
        respOcr['wht base total amount'] = respOcr.hasOwnProperty('amount (exclude vat.)') ?
          respOcr['amount (exclude vat.)']
          : ''
      }
    }

    if (respOcr.hasOwnProperty('wht 2 base amount')) {
      respOcr['wht 2 base total amount'] = 0
      if (Array.isArray(respOcr['wht 2 base amount'])) {
        let i = 0
        respOcr['wht 2 base amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['wht 2 base amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 2 Base Amount 1' && e.is_ocr === true)) {
              respOcr['wht 2 base total amount'] = respOcr['wht 2 base total amount'] + amount
            }
          } else if (i == 2) {
            respOcr['wht 2 base amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 2 Base Amount 2' && e.is_ocr === true)) {
              respOcr['wht 2 base total amount'] = respOcr['wht 2 base total amount'] + amount
            }
          } else if (i == 3) {
            respOcr['wht 2 base amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 2 Base Amount 3' && e.is_ocr === true)) {
              respOcr['wht 2 base total amount'] = respOcr['wht 2 base total amount'] + amount
            }
          } else if (i == 4) {
            respOcr['wht 2 base amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 2 Base Amount 4' && e.is_ocr === true)) {
              respOcr['wht 2 base total amount'] = respOcr['wht 2 base total amount'] + amount
            }
          } else {
            respOcr['wht 2 base amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 2 Base Amount 5' && e.is_ocr === true)) {
              respOcr['wht 2 base total amount'] = respOcr['wht 2 base total amount'] + amount
            }
          }
        })
      } else {
        respOcr['wht 2 base total amount'] = convertStringToDecimal(respOcr['wht 2 base amount'])
      }
    } else {
      if (respOcr.hasOwnProperty('wht 2 base total amount')) {
        respOcr['wht 2 base total amount'] = convertStringToDecimal(respOcr['wht 2 base total amount'])
      } else {
        respOcr['wht 2 base total amount'] = respOcr.hasOwnProperty('amount (exclude vat.)') ?
          respOcr['amount (exclude vat.)']
          : ''
      }
    }

    if (respOcr.hasOwnProperty('wht 3 base amount')) {
      respOcr['wht 3 base total amount'] = 0
      if (Array.isArray(respOcr['wht 3 base amount'])) {
        let i = 0
        respOcr['wht 3 base amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['wht 3 base amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 3 Base Amount 1' && e.is_ocr === true)) {
              respOcr['wht 3 base total amount'] = respOcr['wht 3 base total amount'] + amount
            }
          } else if (i == 2) {
            respOcr['wht 3 base amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 3 Base Amount 2' && e.is_ocr === true)) {
              respOcr['wht 3 base total amount'] = respOcr['wht 3 base total amount'] + amount
            }
          } else if (i == 3) {
            respOcr['wht 3 base amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 3 Base Amount 3' && e.is_ocr === true)) {
              respOcr['wht 3 base total amount'] = respOcr['wht 3 base total amount'] + amount
            }
          } else if (i == 4) {
            respOcr['wht 3 base amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 3 Base Amount 4' && e.is_ocr === true)) {
              respOcr['wht 3 base total amount'] = respOcr['wht 3 base total amount'] + amount
            }
          } else {
            respOcr['wht 3 base amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 3 Base Amount 5' && e.is_ocr === true)) {
              respOcr['wht 3 base total amount'] = respOcr['wht 3 base total amount'] + amount
            }
          }
        })
      } else {
        respOcr['wht 3 base total amount'] = convertStringToDecimal(respOcr['wht 3 base amount'])
      }
    } else {
      if (respOcr.hasOwnProperty('wht 3 base total amount')) {
        respOcr['wht 3 base total amount'] = convertStringToDecimal(respOcr['wht 3 base total amount'])
      } else {
        respOcr['wht 3 base total amount'] = respOcr.hasOwnProperty('amount (exclude vat.)') ?
          respOcr['amount (exclude vat.)']
          : ''
      }
    }

    if (respOcr.hasOwnProperty('wht 4 base amount')) {
      respOcr['wht 4 base total amount'] = 0
      if (Array.isArray(respOcr['wht 4 base amount'])) {
        let i = 0
        respOcr['wht 4 base amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['wht 4 base amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 4 Base Amount 1' && e.is_ocr === true)) {
              respOcr['wht 4 base total amount'] = respOcr['wht 4 base total amount'] + amount
            }
          } else if (i == 2) {
            respOcr['wht 4 base amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 4 Base Amount 2' && e.is_ocr === true)) {
              respOcr['wht 4 base total amount'] = respOcr['wht 4 base total amount'] + amount
            }
          } else if (i == 3) {
            respOcr['wht 4 base amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 4 Base Amount 3' && e.is_ocr === true)) {
              respOcr['wht 4 base total amount'] = respOcr['wht 4 base total amount'] + amount
            }
          } else if (i == 4) {
            respOcr['wht 4 base amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 4 Base Amount 4' && e.is_ocr === true)) {
              respOcr['wht 4 base total amount'] = respOcr['wht 4 base total amount'] + amount
            }
          } else {
            respOcr['wht 4 base amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 4 Base Amount 5' && e.is_ocr === true)) {
              respOcr['wht 4 base total amount'] = respOcr['wht 4 base total amount'] + amount
            }
          }
        })
      } else {
        respOcr['wht 4 base total amount'] = convertStringToDecimal(respOcr['wht 4 base amount'])
      }
    } else {
      if (respOcr.hasOwnProperty('wht 4 base total amount')) {
        respOcr['wht 4 base total amount'] = convertStringToDecimal(respOcr['wht 4 base total amount'])
      } else {
        respOcr['wht 4 base total amount'] = respOcr.hasOwnProperty('amount (exclude vat.)') ?
          respOcr['amount (exclude vat.)']
          : ''
      }
    }

    if (respOcr.hasOwnProperty('wht 5 base amount')) {
      respOcr['wht 5 base total amount'] = 0
      if (Array.isArray(respOcr['wht 5 base amount'])) {
        let i = 0
        respOcr['wht 5 base amount'].forEach(e => {
          let amount = convertStringToDecimal(e)
          i++
          if (i == 1) {
            respOcr['wht 5 base amount 1'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 5 Base Amount 1' && e.is_ocr === true)) {
              respOcr['wht 5 base total amount'] = respOcr['wht 5 base total amount'] + amount
            }
          } else if (i == 2) {
            respOcr['wht 5 base amount 2'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 5 Base Amount 2' && e.is_ocr === true)) {
              respOcr['wht 5 base total amount'] = respOcr['wht 5 base total amount'] + amount
            }
          } else if (i == 3) {
            respOcr['wht 5 base amount 3'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 5 Base Amount 3' && e.is_ocr === true)) {
              respOcr['wht 5 base total amount'] = respOcr['wht 5 base total amount'] + amount
            }
          } else if (i == 4) {
            respOcr['wht 5 base amount 4'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 5 Base Amount 4' && e.is_ocr === true)) {
              respOcr['wht 5 base total amount'] = respOcr['wht 5 base total amount'] + amount
            }
          } else {
            respOcr['wht 5 base amount 5'] = e
            if (fields.recordset.find(e => e.display_name === 'WHT 5 Base Amount 5' && e.is_ocr === true)) {
              respOcr['wht 5 base total amount'] = respOcr['wht 5 base total amount'] + amount
            }
          }
        })
      } else {
        respOcr['wht 5 base total amount'] = convertStringToDecimal(respOcr['wht 5 base amount'])
      }
    } else {
      if (respOcr.hasOwnProperty('wht 5 base total amount')) {
        respOcr['wht 5 base total amount'] = convertStringToDecimal(respOcr['wht 5 base total amount'])
      } else {
        respOcr['wht 5 base total amount'] = respOcr.hasOwnProperty('amount (exclude vat.)') ?
          respOcr['amount (exclude vat.)']
          : ''
      }
    }

    var amountExcludeVat = respOcr['amount (exclude vat.)'];
    var vatBaseTotalAmount = 0;
    var whtBaseTotalAmount = 0;
    var wht2BaseTotalAmount = 0;
    var wht3BaseTotalAmount = 0;
    var wht4BaseTotalAmount = 0;
    var wht5BaseTotalAmount = 0;

    if (respOcr.hasOwnProperty('vat base total amount')) {
      vatBaseTotalAmount = respOcr['vat base total amount'];
    }
    if (respOcr.hasOwnProperty('wht base total amount')) {
      whtBaseTotalAmount = respOcr['wht base total amount'];
    }
    if (respOcr.hasOwnProperty('wht 2 base total amount')) {
      wht2BaseTotalAmount = respOcr['wht 2 base total amount'];
    }
    if (respOcr.hasOwnProperty('wht 3 base total amount')) {
      wht3BaseTotalAmount = respOcr['wht 3 base total amount'];
    }
    if (respOcr.hasOwnProperty('wht 4 base total amount')) {
      wht4BaseTotalAmount = respOcr['wht 4 base total amount'];
    }
    if (respOcr.hasOwnProperty('wht 5 base total amount')) {
      wht5BaseTotalAmount = respOcr['wht 5 base total amount'];
    }

    var vatAmount = vatBaseTotalAmount * (vatRate.recordsets[0][0].rate === null ? 0 : vatRate.recordsets[0][0].rate / 100)
    var whtAmount = whtBaseTotalAmount * (whtRate.recordsets[0][0].rate === null ? 0 : whtRate.recordsets[0][0].rate / 100)
    var wht2Amount = wht2BaseTotalAmount * (whtRate.recordsets[0][1].rate === null ? 0 : whtRate.recordsets[0][1].rate / 100)
    var wht3Amount = wht3BaseTotalAmount * (whtRate.recordsets[0][2].rate === null ? 0 : whtRate.recordsets[0][2].rate / 100)
    var wht4Amount = wht4BaseTotalAmount * (whtRate.recordsets[0][3].rate === null ? 0 : whtRate.recordsets[0][3].rate / 100)
    var wht5Amount = wht5BaseTotalAmount * (whtRate.recordsets[0][4].rate === null ? 0 : whtRate.recordsets[0][4].rate / 100)
    var alternativePayeeAmount = amountExcludeVat + vatAmount - (whtAmount + wht2Amount + wht3Amount + wht4Amount + wht5Amount)

    await debugLogsModel.createDebugLogs('DATA_VAT_RATE_LIST', JSON.stringify(vatRate.recordsets[0]))
    await debugLogsModel.createDebugLogs('DATA_WHT_RATE_LIST', JSON.stringify(whtRate.recordsets[0]))
    var messageLogs = JSON.stringify({
      vatAmount: vatAmount,
      whtAmount: whtAmount,
      alternativePayeeAmount: alternativePayeeAmount
    })
    await debugLogsModel.createDebugLogs('CAL_ALTERNATIVE_PAYEE_AMOUNT', messageLogs)
    respOcr['alternative payee amount'] = alternativePayeeAmount

    for (const idx in respOcr) {
      console.log('respOcr -', idx, ':', respOcr[idx])
    }

    const jsonStr = JsonFind(respOcr);

    try {
      var pool = await sql.connect(config.sqlConn)
      var jsonQry = '{'

      fields.recordset.forEach(e => {
        var fieldValue = ''
        if ((jsonStr.checkKey(e.display_name.toLowerCase()) && (e.is_ocr === true || e.is_display !== true))
          || e.display_name === 'Amount (Exclude Vat.)' || e.display_name === 'VAT Base Total Amount'
          || e.display_name === 'WHT Base Total Amount' || e.display_name === 'WHT 2 Base Total Amount'
          || e.display_name === 'WHT 3 Base Total Amount' || e.display_name === 'WHT 4 Base Total Amount'
          || e.display_name === 'WHT 5 Base Total Amount' || e.display_name === 'Alternative Payee Amount') {
          var defaultValue = e.default_value
          if (e.is_variable && e.default_value != '' && e.default_value != null && e.default_value != undefined) {
            defaultValue = respOcr[e.default_value.toLowerCase()].toString()
          }

          if (defaultValue === null) {
            fieldValue = ''
          } else if (e.field_type === 'DT') {
            // Get date string from json
            var dateStr = defaultValue
            var formatDate = convertDateStringFormat(dateStr)
            fieldValue = formatDate.dateMoment
          } else if (e.field_type === 'D' && (e.display_name !== 'Amount (Exclude Vat.)' &&
            e.display_name !== 'VAT Base Total Amount' &&
            e.display_name !== 'WHT Base Total Amount' &&
            e.display_name !== 'WHT 2 Base Total Amount' &&
            e.display_name !== 'WHT 3 Base Total Amount' &&
            e.display_name !== 'WHT 4 Base Total Amount' &&
            e.display_name !== 'WHT 5 Base Total Amount' &&
            e.display_name !== 'Alternative Payee Amount')) {
            fieldValue = convertStringToDecimal(defaultValue)
          } else if (e.field_type === 'D') {
            let value = convertStringToDecimal(defaultValue)
            fieldValue = isNaN(value) ? '' : value
          } else {
            fieldValue = defaultValue === undefined || defaultValue === null ? '' : defaultValue
          }
        } else {
          var defaultValue = e.default_value
          if (e.is_variable && e.default_value != '' && e.default_value != null && e.default_value != undefined) {
            defaultValue = respOcr[e.default_value.toLowerCase()].toString()
          }
          if (defaultValue === null) {
            fieldValue = ''
          } else if (e.field_type === 'DT') {
            // Get date string from default value
            var dateStr = defaultValue
            var formatDate = convertDateStringFormat(dateStr)
            fieldValue = formatDate.dateMoment
          } else if (e.field_type === 'D') {
            let value = convertStringToDecimal(defaultValue)
            fieldValue = isNaN(value) ? '' : value
          } else {
            fieldValue = defaultValue === undefined || defaultValue === null ? '' : defaultValue
          }
        }
        jsonQry = jsonQry + '"' + e.display_name + '":"' + fieldValue + '",'
        console.log('jsonQry -', e.display_name, ':', fieldValue)
      });
      jsonQry = jsonQry.substring(0, jsonQry.length - 1)
      jsonQry = jsonQry + '}'

      result = await pool.request()
        .input('file_id', sql.Int, ocrFile.file_id)
        .input('invoice_no', sql.NVarChar, respOcr['Document No.'])
        .input('jsonQry', sql.NVarChar, jsonQry)
        .input('update_by', sql.NVarChar, ocrFile.create_by)
        .query('UPDATE TRN_OcrFiles SET modify_result = @jsonQry, invoice_no = @invoice_no, update_by = @update_by, update_date = GETDATE(), ocr_date = GETDATE() WHERE file_id = @file_id')
    } catch (error) {
      console.log(error)
      return error
    }
    return result
  },
  updateFieldsByFileId: async (file_id, fields) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      var jsonQry = '{'
      fields.forEach(e => {
        jsonQry = jsonQry + '"' + e.display_name + '":"' + e.ocr_result + '",'
      });
      jsonQry = jsonQry.substring(0, jsonQry.length - 1)
      jsonQry = jsonQry + '}'
      result = await pool.request()
        .input('file_id', sql.Int, file_id)
        .input('jsonQry', sql.NVarChar, jsonQry)
        .query('UPDATE TRN_OcrFiles SET modify_result = @jsonQry WHERE file_id = @file_id')
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 29/Apr/2021 Chanakan C. Add End ***** //
  deleteOCRFileByFileId: async (file_id, is_delete, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('file_id', sql.Int, file_id)
        .input('is_delete', sql.Char, is_delete)
        .input('update_by', sql.NVarChar, update_by)
        // ***** 29/Apr/2021 Chanakan C. Mod Start ***** //
        .query('update TRN_OcrFiles set is_delete = @is_delete, update_by = @update_by, update_date = getdate() where file_id = @file_id')
      // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 29/Apr/2021 Chanakan C. Add Start ***** //
  deleteMultipleOCRFilesByFileId: async (req, file_id) => {
    try {

      var query = ''
      file_id.forEach(e => {
        query = query + 'update TRN_OcrFiles set is_delete = \'' + 'Y' + '\', update_by = \'' + req.cur_user.trim() + '\', update_date = getdate() where [file_id] = ' + e + ';'
      })

      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .query(query)
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 29/Apr/2021 Chanakan C. Add End ***** //
  updateOCRFileStatus: async (file_id, ocr_status, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('file_id', sql.Int, file_id)
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('update_by', sql.NVarChar, update_by)
        // ***** 29/Apr/2021 Chanakan C. Mod Start ***** //  
        .query('update TRN_OcrFiles set ocr_status = @ocr_status, update_by = @update_by, update_date = getdate() where file_id = @file_id')
      // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  getRunningNoByCurrentDate: async () => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        // ***** 29/Apr/2021 Chanakan C. Mod Start ***** //
        .query('select right(concat(\'0000\', count(file_id) + 1), 3) as [running] from TRN_OcrFiles where convert(date, create_date) = convert(date, getdate())')
      // ***** 29/Apr/2021 Chanakan C. Mod End ***** //
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 07/May/2021 Apiwat Emem Add Start ***** //
  getOCRResultByFileId: async (file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('file_id', sql.Int, file_id)
        .query('SELECT file_id, original_name, ocr_status, s.name as [status_name], m.display_name, CASE WHEN o.ocr_result IS NULL THEN \'\' ELSE o.ocr_result END \'ocr_result\', i.default_value, m.field_type, m.field_length, m.is_requirefield, i.is_display, m.is_showonextractscreen, i.is_ocr, i.is_variable, m.field_data, m.field_name FROM MST_MasterFields m LEFT JOIN ( SELECT file_id, original_name, ocr_status, [key] AS display_name, [value] AS ocr_result FROM TRN_OcrFiles CROSS APPLY OPENJSON(modify_result) WHERE file_id = @file_id ) o ON o.display_name = m.display_name COLLATE Latin1_General_BIN2 LEFT JOIN TRN_MasterDataItems i ON i.field_id = m.field_id AND i.masterdata_id = ( SELECT masterdata_id FROM TRN_OcrFiles WHERE file_id = @file_id ) LEFT JOIN MST_FileStatus s on s.code = ocr_status WHERE (i.is_display = \'1\' OR m.is_showonextractscreen = \'Y\') AND m.is_active = \'Y\' ORDER BY m.[order]')
    } catch (error) {
      return error
    }
    return result
  },
  insertAttachFile: async (file_name, file_size, file_id, original_name, file_path, full_path, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_name', sql.NVarChar, file_name)
          .input('file_size', sql.NVarChar, file_size)
          .input('file_id', sql.Int, file_id)
          .input('original_name', sql.NVarChar, original_name)
          .input('file_path', sql.NVarChar, file_path)
          .input('full_path', sql.NVarChar, full_path)
          .input('create_by', sql.NVarChar, create_by)
          .query('insert into TRN_AttachFiles ([file_name], [file_size], [file_id], [original_name], [file_path], [full_path], [create_by], [create_date]) VALUES (@file_name, @file_size, @file_id, @original_name, @file_path, @full_path, @create_by, getdate())')
      }
    } catch (error) {
      return error
    }
    return result
  },
  insertReceiptFile: async (file_name, file_size, file_id, original_name, file_path, full_path, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_name', sql.NVarChar, file_name)
          .input('file_size', sql.NVarChar, file_size)
          .input('file_id', sql.Int, file_id)
          .input('original_name', sql.NVarChar, original_name)
          .input('file_path', sql.NVarChar, file_path)
          .input('full_path', sql.NVarChar, full_path)
          .input('create_by', sql.NVarChar, create_by)
          .query('insert into TRN_ReceiptFiles ([file_name], [file_size], [file_id], [original_name], [file_path], [full_path], [create_by], [create_date]) VALUES (@file_name, @file_size, @file_id, @original_name, @file_path, @full_path, @create_by, getdate())')
      }
    } catch (error) {
      return error
    }
    return result
  },
  insertSupportingDocFile: async (file_name, file_size, file_id, original_name, file_path, full_path, create_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_name', sql.NVarChar, file_name)
          .input('file_size', sql.NVarChar, file_size)
          .input('file_id', sql.Int, file_id)
          .input('original_name', sql.NVarChar, original_name)
          .input('file_path', sql.NVarChar, file_path)
          .input('full_path', sql.NVarChar, full_path)
          .input('create_by', sql.NVarChar, create_by)
          .query('insert into TRN_SupportingDocFiles ([file_name], [file_size], [file_id], [original_name], [file_path], [full_path], [create_by], [create_date]) VALUES (@file_name, @file_size, @file_id, @original_name, @file_path, @full_path, @create_by, getdate())')
      }
    } catch (error) {
      return error
    }
    return result
  },
  getAttachFileByFileId: async (file_id, is_delete = 'N', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_id', sql.Int, file_id)
          .input('is_delete', sql.Char, is_delete)
          .query('select cast(attachfile_id as nvarchar) as [uid], original_name as [name], \'done\' as [status], \'\' as [url] from TRN_AttachFiles where file_id = @file_id and is_delete = @is_delete order by attachfile_id ' + sort)
      } else {
        result = await pool.request()
          .input('is_delete', sql.Char, is_delete)
          .query('select cast(attachfile_id as nvarchar) as [uid], original_name as [name], \'done\' as [status], \'\' as [url] from TRN_AttachFiles where is_delete = @is_delete order by attachfile_id ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getReceiptFileByFileId: async (file_id, is_delete = 'N', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_id', sql.Int, file_id)
          .input('is_delete', sql.Char, is_delete)
          .query('select cast(attachfile_id as nvarchar) as [uid], original_name as [name], \'done\' as [status], \'\' as [url] from TRN_ReceiptFiles where file_id = @file_id and is_delete = @is_delete order by attachfile_id ' + sort)
      } else {
        result = await pool.request()
          .input('is_delete', sql.Char, is_delete)
          .query('select cast(attachfile_id as nvarchar) as [uid], original_name as [name], \'done\' as [status], \'\' as [url] from TRN_ReceiptFiles where is_delete = @is_delete order by attachfile_id ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getSupportingDocFileByFileId: async (file_id, is_delete = 'N', sort = 'asc') => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_id', sql.Int, file_id)
          .input('is_delete', sql.Char, is_delete)
          .query('select cast(attachfile_id as nvarchar) as [uid], original_name as [name], \'done\' as [status], \'\' as [url] from TRN_SupportingDocFiles where file_id = @file_id and is_delete = @is_delete order by attachfile_id ' + sort)
      } else {
        result = await pool.request()
          .input('is_delete', sql.Char, is_delete)
          .query('select cast(attachfile_id as nvarchar) as [uid], original_name as [name], \'done\' as [status], \'\' as [url] from TRN_SupportingDocFiles where is_delete = @is_delete order by attachfile_id ' + sort)
      }
    } catch (error) {
      return error
    }
    return result
  },
  getOCRFileExportExcelByFileId: async (file_id) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('file_id', sql.Int, file_id)
          .query('SELECT m.display_name as [Allpay_Field], CASE WHEN m.display_name = \'Form Type\' THEN formtype.[name] WHEN m.display_name = \'Company\' THEN company.code + \' \' + company.[name] WHEN m.display_name = \'Vendor\' THEN vendor.code + \' \' + vendor.[name] WHEN m.display_name = \'Status\' THEN [status].[name] WHEN m.display_name = \'Payment Type\' THEN paymenttype.[name] WHEN m.display_name = \'GR Approval For\' THEN grapprovalfor.[name] WHEN m.display_name = \'Currency\' THEN currency.code + \' \' + currency.[name] WHEN m.display_name = \'Alternative Payee Vendor\' THEN payeevendor.code + \' \' + payeevendor.[name] WHEN m.display_name = \'Beneficiary\' THEN beneficiary.[beneficiaryname] WHEN m.display_name = \'Document Type\' THEN document.[name] WHEN m.display_name = \'VAT Rate\' THEN CAST(tax.rate AS NVARCHAR) WHEN m.display_name = \'WHT Rate\' THEN CAST(wht.rate AS NVARCHAR) WHEN m.display_name = \'Expense Code\' THEN expense.code + \' \' + expense.[name] WHEN m.display_name = \'Cost Center\' THEN costcenter.code + \' \' + costcenter.[name] WHEN m.display_name = \'Order no.(IO)\' THEN internalorder.[name] WHEN m.display_name = \'Service Team\' THEN serviceteam.[name] WHEN m.display_name = \'All bank charge outside Company Country For\' THEN outside.[name] WHEN m.display_name = \'All bank charge inside Company Country For\' THEN inside.[name] WHEN m.display_name = \'Paid For\' THEN paidfor.code + \' \' + paidfor.[name] WHEN m.display_name = \'Pre-Advice\' THEN preadvice.code + \' \' + preadvice.[name] WHEN m.display_name = \'Remitted Currency\' THEN remitted.code + \' \' + remitted.[name] WHEN m.display_name = \'Remitted To Currency\' THEN remittedto.code + \' \' + remittedto.[name] WHEN m.display_name = \'Create Date\' OR m.display_name = \'Document Date\' OR m.display_name = \'Due Date\' THEN CASE WHEN ISNULL(o.ocr_result,\'\') = \'\' THEN \'\' ELSE FORMAT(CAST(o.ocr_result AS DATE),\'dd/MM/yyyy\') END ELSE o.ocr_result END AS [Value] FROM MST_MasterFields m LEFT JOIN ( SELECT [key] AS display_name, [value] AS ocr_result FROM TRN_OcrFiles CROSS APPLY OPENJSON(modify_result) WHERE file_id = @file_id ) o ON o.display_name = m.display_name COLLATE Latin1_General_BIN2 LEFT JOIN TRN_MasterDataItems i ON i.field_id = m.field_id AND i.masterdata_id = (SELECT masterdata_id FROM TRN_OcrFiles WHERE file_id = @file_id ) LEFT JOIN MST_FormTypes formtype ON formtype.code = o.ocr_result AND m.display_name = \'Form Type\' LEFT JOIN MST_Companies company ON company.code = o.ocr_result AND m.display_name = \'Company\' LEFT JOIN MST_Vendors vendor ON vendor.code = o.ocr_result AND m.display_name = \'Vendor\' LEFT JOIN MST_Status [status] ON [status].code = o.ocr_result AND m.display_name = \'Status\' LEFT JOIN MST_PaymentTypes_bk paymenttype ON paymenttype.code = o.ocr_result AND m.display_name = \'Payment Type\' LEFT JOIN MST_GrApprovalFors_Bk grapprovalfor ON grapprovalfor.code = o.ocr_result AND m.display_name = \'GR Approval For\' LEFT JOIN MST_Currencies currency ON currency.code = o.ocr_result AND m.display_name = \'Currency\' LEFT JOIN MST_Vendors payeevendor ON payeevendor.code = o.ocr_result AND m.display_name = \'Alternative Payee Vendor\' LEFT JOIN MST_Beneficiaries beneficiary ON beneficiary.code = o.ocr_result AND m.display_name = \'Beneficiary\' LEFT JOIN MST_Documents document ON document.code = o.ocr_result AND m.display_name = \'Document Type\' LEFT JOIN MST_TaxRates tax ON tax.code = o.ocr_result AND m.display_name = \'VAT Rate\' LEFT JOIN MST_WhtRates wht ON wht.code = o.ocr_result AND m.display_name = \'WHT Rate\' LEFT JOIN MST_Expenses expense ON expense.code = o.ocr_result AND m.display_name = \'Expense Code\' LEFT JOIN MST_CostCenters costcenter ON costcenter.code = o.ocr_result AND m.display_name = \'Cost Center\' LEFT JOIN MST_InternalOrders internalorder ON internalorder.code = o.ocr_result AND m.display_name = \'Order no.(IO)\' LEFT JOIN MST_ServiceTeams serviceteam ON serviceteam.code = o.ocr_result AND m.display_name = \'Service Team\' LEFT JOIN MST_BankCharges outside ON outside.code = o.ocr_result AND m.display_name = \'All bank charge outside Company Country For\' LEFT JOIN MST_BankCharges inside ON inside.code = o.ocr_result AND m.display_name = \'All bank charge inside Company Country For\' LEFT JOIN MST_PaidFors paidfor ON paidfor.code = o.ocr_result AND m.display_name = \'Paid For\' LEFT JOIN MST_PreAdvices preadvice ON preadvice.code = o.ocr_result AND m.display_name = \'Pre-Advice\' LEFT JOIN MST_RemittedCurrencies remitted ON remitted.code = o.ocr_result AND m.display_name = \'Remitted Currency\' LEFT JOIN MST_RemittedCurrencies remittedto ON remittedto.code = o.ocr_result AND m.display_name = \'Remitted To Currency\' WHERE (i.is_display = \'1\' OR m.is_showonextractscreen = \'Y\') AND m.is_active = \'Y\' ORDER BY m.[order] ASC')
      }
    } catch (error) {
      console.log("getOCRFileExportExcelByFileId error", error)
      return error
    }
    return result
  },
  updateAttachFile: async (file_id, attachfile_id, is_delete, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('attachfile_id', sql.Int, attachfile_id)
          .input('file_id', sql.Int, file_id)
          .input('is_delete', sql.Char, is_delete)
          .input('update_by', sql.NVarChar, update_by)
          .query('update TRN_AttachFiles set is_delete = @is_delete, update_by = @update_by, update_date = getdate() where attachfile_id = @attachfile_id and file_id = @file_id ')
      }
    } catch (error) {
      return error
    }
    return result
  },
  updateReceiptFile: async (file_id, attachfile_id, is_delete, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('attachfile_id', sql.Int, attachfile_id)
          .input('file_id', sql.Int, file_id)
          .input('is_delete', sql.Char, is_delete)
          .input('update_by', sql.NVarChar, update_by)
          .query('update TRN_ReceiptFiles set is_delete = @is_delete, update_by = @update_by, update_date = getdate() where attachfile_id = @attachfile_id and file_id = @file_id ')
      }
    } catch (error) {
      return error
    }
    return result
  },
  updateSupportingDocFile: async (file_id, attachfile_id, is_delete, update_by) => {
    var result = false
    try {
      var pool = await sql.connect(config.sqlConn)
      if (file_id !== null) {
        result = await pool.request()
          .input('attachfile_id', sql.Int, attachfile_id)
          .input('file_id', sql.Int, file_id)
          .input('is_delete', sql.Char, is_delete)
          .input('update_by', sql.NVarChar, update_by)
          .query('update TRN_SupportingDocFiles set is_delete = @is_delete, update_by = @update_by, update_date = getdate() where attachfile_id = @attachfile_id and file_id = @file_id ')
      }
    } catch (error) {
      return error
    }
    return result
  },
  // ***** 07/May/2021 Apiwat Emem Add End ***** //
  // ***** 24/June/2021 Apiwat Emem Add Start ***** //
  updateOCRFilePublishToAllpay: async (arrFile_Id, ocr_status, allpay_refno, allpay_request, allpay_by) => {
    try {

      var query = ''
      arrFile_Id.forEach(e => {
        query = query + 'update TRN_OcrFiles set ocr_status = @ocr_status, allpay_refno = @allpay_refno, allpay_request = @allpay_request, allpay_by = @allpay_by, allpay_date = getdate() where [file_id] = ' + e + '; '
      })

      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('allpay_refno', sql.NVarChar, allpay_refno)
        .input('allpay_request', sql.NVarChar, allpay_request)
        .input('allpay_by', sql.NVarChar, allpay_by)
        .query(query)

    } catch (error) {
      return error
    }
    return result
  },
  updateOCRFileAllpay: async (arrFile_Id, ocr_status, allpay_no, allpay_result_message, allpay_refno, allpay_request, allpay_by) => {
    try {

      var query = ''
      arrFile_Id.forEach(e => {
        query = query + 'update TRN_OcrFiles set ocr_status = @ocr_status, allpay_no = @allpay_no, allpay_result_message = @allpay_result_message, allpay_refno = @allpay_refno, allpay_request = @allpay_request, allpay_by = @allpay_by, allpay_date = getdate() where [file_id] = ' + e + '; '
      })

      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('allpay_no', sql.NVarChar, allpay_no)
        .input('allpay_result_message', sql.NVarChar, allpay_result_message)
        .input('allpay_refno', sql.NVarChar, allpay_refno)
        .input('allpay_request', sql.NVarChar, allpay_request)
        .input('allpay_by', sql.NVarChar, allpay_by)
        .query(query)

    } catch (error) {
      return error
    }
    return result
  },
  updateAllPayOCRFileByAllPayRefNo: async (allpay_refno, ocr_status, allpay_no, allpay_result_message) => {
    try {

      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('allpay_refno', sql.NVarChar, allpay_refno)
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('allpay_no', sql.NVarChar, allpay_no)
        .input('allpay_result_message', sql.NVarChar, allpay_result_message)
        .query('update TRN_OcrFiles set ocr_status = @ocr_status, allpay_no = @allpay_no, allpay_result_message = @allpay_result_message, allpay_date = getdate() where allpay_refno = @allpay_refno;')
    } catch (error) {
      return error
    }
    return result
  },
  updateAllPayRefNoAllPayRequestOCRFile: async (arrFile_Id, allpay_refno, allpay_request, allpay_by) => {
    try {

      var query = ''
      arrFile_Id.forEach(e => {
        query = query + 'update TRN_OcrFiles set allpay_refno = @allpay_refno, allpay_request = @allpay_request, allpay_by = @allpay_by, allpay_date = getdate() where [file_id] = ' + e + '; '
      })

      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('allpay_refno', sql.NVarChar, allpay_refno)
        .input('allpay_request', sql.NVarChar, allpay_request)
        .input('allpay_by', sql.NVarChar, allpay_by)
        .query(query)

    } catch (error) {
      return error
    }
    return result
  },
  updateOCRStatusOCRFile: async (arrFile_Id, ocr_status, update_by) => {
    try {

      var query = ''
      arrFile_Id.forEach(e => {
        query = query + 'update TRN_OcrFiles set ocr_status = @ocr_status, update_by = @update_by, update_date = getdate() where [file_id] = ' + e + '; '
      })

      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('ocr_status', sql.NVarChar, ocr_status)
        .input('update_by', sql.NVarChar, update_by)
        .query(query)

    } catch (error) {
      return error
    }
    return result
  },
  getOCRFileAndAttachFileContent: async (fileIdList, is_delete = 'N') => {
    try {
      var fileList = [];
      var pool = await sql.connect(config.sqlConn)
      fileIdList.forEach(async function (fileId) {
        result = await pool.request()
          .input('file_id', sql.Int, fileId)
          .input('is_delete', sql.Char, is_delete)
          .query('select file_id, file_name, original_name from TRN_OcrFiles where file_id = @file_id and is_delete = @is_delete union select file_id, file_name, original_name from TRN_AttachFiles where file_id = @file_id and is_delete = @is_delete')

        result.recordset.forEach(async function (item) {
          const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureStorage.connectionString);
          const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
          const blockBlobClient = containerClient.getBlockBlobClient(item.file_name);
          var blobDownloadResponse = await blockBlobClient.download();
          var fileStream = blobDownloadResponse.readableStreamBody;
          var obj = {};
          obj['file_id'] = fileId;
          obj['file_name'] = item.file_name;
          obj['original_name'] = item.original_name;
          obj['base64'] = await streamToBase64(fileStream);
          fileList.push(obj);
        });
      });
    } catch (error) {
      return error
    }
    return fileList
  },
  getOCRFileAndAttachFile: async (fileIdList, is_delete = 'N') => {

    try {
      var fileIdStr = '';
      var pool = await sql.connect(config.sqlConn)
      fileIdList.forEach(file_id => {
        fileIdStr = fileIdStr + file_id + ",";
      });

      fileIdStr = '(' + fileIdStr.substring(0, fileIdStr.length - 1) + ')';

      result = await pool.request()
        .input('is_delete', sql.Char, is_delete)
        .query('select * from (select file_id, 0 as attachfile_id, file_name, original_name from TRN_OcrFiles where file_id in ' + fileIdStr + ' and is_delete = @is_delete union select file_id, attachfile_id, file_name, original_name from TRN_AttachFiles where file_id in ' + fileIdStr + ' and is_delete = @is_delete) a order by file_id, attachfile_id ')

    } catch (error) {
      return error
    }
    return result
  },
  getReceiptFileByFileList: async (fileIdList, is_delete = 'N') => {

    try {
      var fileIdStr = '';
      var pool = await sql.connect(config.sqlConn)
      fileIdList.forEach(file_id => {
        fileIdStr = fileIdStr + file_id + ",";
      });

      fileIdStr = '(' + fileIdStr.substring(0, fileIdStr.length - 1) + ')';

      result = await pool.request()
        .input('is_delete', sql.Char, is_delete)
        .query('select file_id, attachfile_id, file_name, original_name from TRN_ReceiptFiles where file_id in ' + fileIdStr + ' and is_delete = @is_delete')

    } catch (error) {
      return error
    }
    return result
  },
  getSupportingDocFileByFileList: async (fileIdList, is_delete = 'N') => {

    try {
      var fileIdStr = '';
      var pool = await sql.connect(config.sqlConn)
      fileIdList.forEach(file_id => {
        fileIdStr = fileIdStr + file_id + ",";
      });

      fileIdStr = '(' + fileIdStr.substring(0, fileIdStr.length - 1) + ')';

      result = await pool.request()
        .input('is_delete', sql.Char, is_delete)
        .query('select file_id, attachfile_id, file_name, original_name from TRN_SupportingDocFiles where file_id in ' + fileIdStr + ' and is_delete = @is_delete')

    } catch (error) {
      return error
    }
    return result
  },

  downloadAttachFileFromAzureStorageBlobByFileName: async (file_name) => {
    try {
      const blobServiceClient = BlobServiceClient.fromConnectionString(config.azureStorage.connectionString);
      const containerClient = blobServiceClient.getContainerClient(config.azureStorage.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(file_name);

      var result = await blockBlobClient.download();

    } catch (error) {
      return error
    }
    return result
  },
  updateModifyResultOCRFile: async (file_id, modify_result) => {
    try {


      var pool = await sql.connect(config.sqlConn)
      result = await pool.request()
        .input('file_id', sql.Int, file_id)
        .input('modify_result', sql.NVarChar, modify_result)
        .query('update TRN_OcrFiles set modify_result = @modify_result where file_id = @file_id;')

    } catch (error) {
      return error
    }
    return result
  },
  // ***** 24/June/2021 Apiwat Emem Add End ***** //
  validateDateFormatOcr: (dateStringList) => {
    var resultList = []
    try {
      dateStringList.forEach((dateString) => {
        var result = Object.assign({ dateString: dateString }, convertDateStringFormat(dateString))
        resultList.push(result)
      })

    } catch (error) {
      console.error(error)
      return error
    }
    return resultList
  },
}
