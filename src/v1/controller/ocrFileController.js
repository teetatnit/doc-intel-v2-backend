/*
Revisor:            Chanakan C.
Revision date:      5/May/2021
Revision Reason:    Modify parameter
*/
var logger = require('../../../util/logger4js')
var fileModel = require('../model/ocrFileModel');
var ocrModel = require('../model/ocrModel');
var azureAI = require('../model/azureAIModel');
var masterDataModel = require('../model/masterDataModel');
var taxRateModel = require('../model/taxRateModel');
var whtRateModel = require('../model/whtRateModel');
var beneficiaryModel = require('../model/beneficiaryModel');
var bankChargeModel = require('../model/bankChargeModel');
var runningNoModel = require('../model/runningNoModel');
var trainModelModel = require('../model/trainModelModel');

var config = require('../../../config/sitConfig');
const moment = require('moment');
const pdf = require('pdf-parse');

var sendToRabbitMQ = (fileIdList, fieldsList, allpay_by) => {
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = today.getMonth() < 9 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1); // getMonth() is zero-based
  var dd = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
  var prefix = "".concat(yyyy).concat(mm).concat(dd)

  var allpay_refno = '';

  runningNoModel.getRunningNo(prefix).then((runningNo) => {
    if (runningNo !== null && runningNo.rowsAffected.length > 0) {
      allpay_refno = runningNo.recordset[0].RefNo
    }
    if (allpay_refno === '') {
      fileModel.updateOCRStatusOCRFile(fileIdList, 'AF', allpay_by);
    } else {
      var allpay_request = '';
      var allpay_request_complete = '';
      var fields = fieldsList[0];
      masterDataModel.getMasterFieldByFieldData('H', 'Y', 'Y', 'asc').then((headerData) => {
        masterDataModel.getMasterFieldByFieldData('I', 'Y', 'Y', 'asc').then((itemData) => {
          taxRateModel.getTaxRate().then((vatData) => {
            whtRateModel.getWhtRate().then((whtData) => {
              beneficiaryModel.getBeneficiary().then((beneficiaryData) => {
                bankChargeModel.getBankCharge().then((bankChargeData) => {
                  getAttachFileList(fileIdList).then(attachFileList => {
                    getReceiptFileList(fileIdList).then(receiptFileList => {
                      getSupportingDocFileList(fileIdList).then(supportingDocFileList => {
                        if (headerData !== null && headerData.rowsAffected.length > 0 && itemData !== null && itemData.rowsAffected.length > 0) {
                          var headerList = headerData.recordset;
                          var itemList = itemData.recordset;
                          var vatList = vatData.recordset;
                          var whtList = whtData.recordset;
                          var beneficiaryList = beneficiaryData.recordset;
                          var bankChargeList = bankChargeData.recordset;

                          var createDate = moment().add(7, 'hours').format('YYYY-MM-DDTHH:mm:ss.SSS');
                          //var createDate = moment().format('YYYY-MM-DDTHH:mm:ss.SSS');
                          //var createDate = '2021-09-20T00:00:00+07:00';
                          var actionDateCC = moment().add(7, 'hours').format('YYYY-MM-DDTHH:mm:ss') + '+07:00';
                          var actionDateReviewer = moment().add(7, 'hours').add(1, 'minute').format('YYYY-MM-DDTHH:mm:ss') + '+07:00';
                          var creatorUserName = allpay_by === 'ebiz_tse2' ? 'yuttasna' : allpay_by;

                          var jsonQry = '{';
                          var jsonCompleteQry = '{';

                          // IsAlternativePayee
                          var alternativePayeeList = []
                          var isAlternativePayee = 'false'
                          fieldsList.forEach(field => {
                            var indexAlternativePayeeAmount = field.findIndex(item => item.field_name === 'AlternativePayeeAmount');
                            var indexAlternativePayeeVendorCode = field.findIndex(item => item.field_name === 'AlternativePayeeVendorCode');
                            var valueAlternativePayeeAmount = indexAlternativePayeeAmount === -1 ? '' : field[indexAlternativePayeeAmount].ocr_result;
                            var valueAlternativePayeeVendorCode = indexAlternativePayeeVendorCode === -1 ? '' : fields[indexAlternativePayeeVendorCode].ocr_result;

                            var indexAlternativePayeeList = alternativePayeeList.findIndex(item => item["VendorCode"] === valueAlternativePayeeVendorCode)
                            if (indexAlternativePayeeList != -1) {
                              var tempAmount = alternativePayeeList[indexAlternativePayeeList]["Amount"]
                              alternativePayeeList[indexAlternativePayeeList]["Amount"] = tempAmount + cvtStringToDecimal(valueAlternativePayeeAmount)
                            } else {
                              alternativePayeeList.push({
                                "Amount": cvtStringToDecimal(valueAlternativePayeeAmount),
                                "VendorCode": valueAlternativePayeeVendorCode
                              })
                            }
                            if (isAlternativePayee === 'false') {
                              isAlternativePayee = ['', undefined, 'undefined', null].includes(valueAlternativePayeeAmount) && ['', undefined, 'undefined', null].includes(valueAlternativePayeeVendorCode) ? 'false' : 'true';
                            }
                          })

                          // var indexAlternativePayeeAmount = fields.findIndex(item => item.field_name === 'AlternativePayeeAmount');
                          // var indexAlternativePayeeVendorCode = fields.findIndex(item => item.field_name === 'AlternativePayeeVendorCode');
                          // var valueAlternativePayeeAmount = indexAlternativePayeeAmount === -1 ? '' : fields[indexAlternativePayeeAmount].ocr_result;
                          // var valueAlternativePayeeVendorCode = indexAlternativePayeeVendorCode === -1 ? '' : fields[indexAlternativePayeeVendorCode].ocr_result;
                          // var isAlternativePayee = (valueAlternativePayeeAmount === '' || valueAlternativePayeeAmount === undefined || valueAlternativePayeeAmount === null || valueAlternativePayeeAmount === 'undefined') && (valueAlternativePayeeVendorCode === '' || valueAlternativePayeeVendorCode === undefined || valueAlternativePayeeVendorCode === null || valueAlternativePayeeVendorCode === 'undefined') ? 'false' : 'true';

                          // IsForeignPayment
                          var indexIsForeignPayment = fields.findIndex(item => item.field_name === 'IsForeignPayment');
                          var isForeignPayment = indexIsForeignPayment !== -1 ? fields[indexIsForeignPayment].ocr_result === '' || fields[indexIsForeignPayment].ocr_result === 'undefined' || fields[indexIsForeignPayment].ocr_result === undefined || fields[indexIsForeignPayment].ocr_result === null ? 'false' : fields[indexIsForeignPayment].ocr_result : 'false';

                          // Status
                          var indexApprover = fields.findIndex(item => item.field_name === 'Approvers');
                          var status = indexApprover !== -1 ? fields[indexApprover].ocr_result === 'undefined' || fields[indexApprover].ocr_result === undefined || fields[indexApprover].ocr_result === '' || fields[indexApprover].ocr_result === null ? '0' : '1' : '0'; // 0 = Draft, 1 = Wait for Approver Approve

                          // Beneficiary
                          var indexBeneficiary = fields.findIndex(item => item.field_name === 'Ben');
                          var beneficiary = '';
                          if (indexBeneficiary !== -1 && !(fields[indexBeneficiary].ocr_result === 'undefined' || fields[indexBeneficiary].ocr_result === undefined || fields[indexBeneficiary].ocr_result === '' || fields[indexBeneficiary].ocr_result === null)) {
                            var indexBen = beneficiaryList.findIndex(i => i.code === fields[indexBeneficiary].ocr_result);
                            if (indexBen !== -1) {
                              var BeneficiaryCode = beneficiaryList[indexBen]['beneficiarycode'] === '' || beneficiaryList[indexBen]['beneficiarycode'] === undefined || beneficiaryList[indexBen]['beneficiarycode'] === 'undefined' || beneficiaryList[indexBen]['beneficiarycode'] == null ? '' : beneficiaryList[indexBen]['beneficiarycode'];
                              var BeneficiaryName = beneficiaryList[indexBen]['beneficiaryname'] === '' || beneficiaryList[indexBen]['beneficiaryname'] === undefined || beneficiaryList[indexBen]['beneficiaryname'] === 'undefined' || beneficiaryList[indexBen]['beneficiaryname'] == null ? '' : beneficiaryList[indexBen]['beneficiaryname'];
                              var CountryCode = beneficiaryList[indexBen]['beneficiarycountrycode'] === '' || beneficiaryList[indexBen]['beneficiarycountrycode'] === undefined || beneficiaryList[indexBen]['beneficiarycountrycode'] === 'undefined' || beneficiaryList[indexBen]['beneficiarycountrycode'] == null ? '' : beneficiaryList[indexBen]['beneficiarycountrycode'];
                              var AccountNo = beneficiaryList[indexBen]['accountno'] === '' || beneficiaryList[indexBen]['accountno'] === undefined || beneficiaryList[indexBen]['accountno'] === 'undefined' || beneficiaryList[indexBen]['accountno'] == null ? '' : beneficiaryList[indexBen]['accountno'];
                              var BSBNO = beneficiaryList[indexBen]['bsbno'] === '' || beneficiaryList[indexBen]['bsbno'] === undefined || beneficiaryList[indexBen]['bsbno'] === 'undefined' || beneficiaryList[indexBen]['bsbno'] == null ? '' : beneficiaryList[indexBen]['bsbno'];
                              var BeneficiaryBankName = beneficiaryList[indexBen]['beneficiarybankname'] === '' || beneficiaryList[indexBen]['beneficiarybankname'] === undefined || beneficiaryList[indexBen]['beneficiarybankname'] === 'undefined' || beneficiaryList[indexBen]['beneficiarybankname'] == null ? '' : beneficiaryList[indexBen]['beneficiarybankname'];
                              var BeneficiaryBankSwiftCode = beneficiaryList[indexBen]['beneficiarybankswiftcode'] === '' || beneficiaryList[indexBen]['beneficiarybankswiftcode'] === undefined || beneficiaryList[indexBen]['beneficiarybankswiftcode'] === 'undefined' || beneficiaryList[indexBen]['beneficiarybankswiftcode'] == null ? '' : beneficiaryList[indexBen]['beneficiarybankswiftcode'];
                              var INTERMEDIATEBANKNAME = beneficiaryList[indexBen]['intermediatebankname'] === '' || beneficiaryList[indexBen]['intermediatebankname'] === undefined || beneficiaryList[indexBen]['intermediatebankname'] === 'undefined' || beneficiaryList[indexBen]['intermediatebankname'] == null ? '' : beneficiaryList[indexBen]['intermediatebankname'];
                              var INTERMEDIATEBANKSWIFTCODE = beneficiaryList[indexBen]['intermediatebankswiftcode'] === '' || beneficiaryList[indexBen]['intermediatebankswiftcode'] === undefined || beneficiaryList[indexBen]['intermediatebankswiftcode'] === 'undefined' || beneficiaryList[indexBen]['intermediatebankswiftcode'] == null ? '' : beneficiaryList[indexBen]['intermediatebankswiftcode'];
                              var BeneficiaryAddress = beneficiaryList[indexBen]['beneficiaryaddress'] === '' || beneficiaryList[indexBen]['beneficiaryaddress'] === undefined || beneficiaryList[indexBen]['beneficiaryaddress'] === 'undefined' || beneficiaryList[indexBen]['beneficiaryaddress'] == null ? '' : beneficiaryList[indexBen]['beneficiaryaddress'];
                              var ABANO = beneficiaryList[indexBen]['abano'] === '' || beneficiaryList[indexBen]['abano'] === undefined || beneficiaryList[indexBen]['abano'] === 'undefined' || beneficiaryList[indexBen]['abano'] == null ? '' : beneficiaryList[indexBen]['abano'];
                              var IBANNo = beneficiaryList[indexBen]['ibanno'] === '' || beneficiaryList[indexBen]['ibanno'] === undefined || beneficiaryList[indexBen]['ibanno'] === 'undefined' || beneficiaryList[indexBen]['ibanno'] == null ? '' : beneficiaryList[indexBen]['ibanno'];
                              var IFSCCODE = beneficiaryList[indexBen]['ifsccode'] === '' || beneficiaryList[indexBen]['ifsccode'] === undefined || beneficiaryList[indexBen]['ifsccode'] === 'undefined' || beneficiaryList[indexBen]['ifsccode'] == null ? '' : beneficiaryList[indexBen]['ifsccode'];
                              var BeneficiaryBankAddress = beneficiaryList[indexBen]['beneficiarybankaddress'] === '' || beneficiaryList[indexBen]['beneficiarybankaddress'] === undefined || beneficiaryList[indexBen]['beneficiarybankaddress'] === 'undefined' || beneficiaryList[indexBen]['beneficiarybankaddress'] == null ? '' : beneficiaryList[indexBen]['beneficiarybankaddress'];
                              var BankCountryCode = beneficiaryList[indexBen]['beneficiarybankcountrycode'] === '' || beneficiaryList[indexBen]['beneficiarybankcountrycode'] === undefined || beneficiaryList[indexBen]['beneficiarybankcountrycode'] === 'undefined' || beneficiaryList[indexBen]['beneficiarybankcountrycode'] == null ? '' : beneficiaryList[indexBen]['beneficiarybankcountrycode'];
                              var INTERMEDIATEBANKADDRESS = beneficiaryList[indexBen]['intermediatebankaddress'] === '' || beneficiaryList[indexBen]['intermediatebankaddress'] === undefined || beneficiaryList[indexBen]['intermediatebankaddress'] === 'undefined' || beneficiaryList[indexBen]['intermediatebankaddress'] == null ? '' : beneficiaryList[indexBen]['intermediatebankaddress'];
                              var INTERMEDIATEBANKCOUNTRYCode = beneficiaryList[indexBen]['intermediatesbankcountrycode'] === '' || beneficiaryList[indexBen]['intermediatesbankcountrycode'] === undefined || beneficiaryList[indexBen]['intermediatesbankcountrycode'] === 'undefined' || beneficiaryList[indexBen]['intermediatesbankcountrycode'] == null ? '' : beneficiaryList[indexBen]['intermediatesbankcountrycode'];

                              beneficiary = beneficiary + '{';
                              beneficiary = beneficiary + '"BeneficiaryCode": "' + BeneficiaryCode + '", '
                              beneficiary = beneficiary + '"BeneficiaryName": "' + BeneficiaryName + '", ';
                              beneficiary = beneficiary + '"CountryCode":"' + CountryCode + '", ';
                              beneficiary = beneficiary + '"AccountNo":"' + AccountNo + '", ';
                              beneficiary = beneficiary + '"BSBNO":"' + BSBNO + '", ';
                              beneficiary = beneficiary + '"BeneficiaryBankName":"' + BeneficiaryBankName + '", ';
                              beneficiary = beneficiary + '"BeneficiaryBankSwiftCode":"' + BeneficiaryBankSwiftCode + '", ';
                              beneficiary = beneficiary + '"INTERMEDIATEBANKNAME":"' + INTERMEDIATEBANKNAME + '", ';
                              beneficiary = beneficiary + '"INTERMEDIATEBANKSWIFTCODE":"' + INTERMEDIATEBANKSWIFTCODE + '", ';
                              beneficiary = beneficiary + '"BeneficiaryAddress":"' + BeneficiaryAddress + '", ';
                              beneficiary = beneficiary + '"ABANO":"' + ABANO + '", ';
                              beneficiary = beneficiary + '"IBANNo":"' + IBANNo + '", ';
                              beneficiary = beneficiary + '"IFSCCODE":"' + IFSCCODE + '", ';
                              beneficiary = beneficiary + '"BeneficiaryBankAddress":"' + BeneficiaryBankAddress + '", ';
                              beneficiary = beneficiary + '"BankCountryCode":"' + BankCountryCode + '", ';
                              beneficiary = beneficiary + '"INTERMEDIATEBANKADDRESS":"' + INTERMEDIATEBANKADDRESS + '", ';
                              beneficiary = beneficiary + '"INTERMEDIATEBANKCOUNTRYCode":"' + INTERMEDIATEBANKCOUNTRYCode + '" ';
                              beneficiary = beneficiary + '}';
                            }
                          }

                          var isPurchaseOrder = 'false';

                          // Payment Request Items
                          var paymentRequestItems = '';
                          var paymentRequestItemsComplete = '';

                          var othersInformation = '';

                          fieldsList.forEach(field => {
                            var jsonItemQry = '{';
                            var jsonItemCompleteQry = '{';

                            var indexOtherExplanation = field.findIndex(item => item.field_name === 'OtherExplanation');
                            var indexOtherAmount = field.findIndex(item => item.field_name === 'OtherAmount');
                            var valueOtherExplanation = indexOtherExplanation === -1 ? '' : field[indexOtherExplanation].ocr_result;
                            var valueOtherAmount = indexOtherAmount === -1 ? '' : field[indexOtherAmount].ocr_result;
                            if (!((valueOtherExplanation === '' || valueOtherExplanation === undefined || valueOtherExplanation === 'undefined' || valueOtherExplanation === null) && (valueOtherAmount === '' || valueOtherAmount === undefined || valueOtherAmount === 'undefined' || valueOtherAmount === null))) {
                              othersInformation += '{"Explanation": "' + valueOtherExplanation + '" ,"Amount":' + cvtStringToDecimal(valueOtherAmount) + '}' + ','
                            }
                            itemList.forEach(item => {
                              var itemValue = '';
                              var itemCompleteValue = '';
                              // if (item.field_name === 'Po') {
                              //   var indexPO = field.findIndex(i => i.field_name === 'PO');
                              //   if (indexPO === -1) {
                              //     itemValue = '[]';
                              //   } else {
                              //     if (field[indexPO].ocr_result === 'undefined' || field[indexPO].ocr_result === '' || field[indexPO].ocr_result === undefined || field[indexPO].ocr_result === null) {
                              //       itemValue = '[]';
                              //     } else {
                              //       var splitPO = field[indexPO].ocr_result.split(",");
                              //       for (var i = 0; i < splitPO.length; i++) {
                              //         itemValue = '"' + splitPO[i] + '"' + ',';
                              //       }
                              //       itemValue = itemValue.substring(0, itemValue.length - 1);
                              //       itemValue = '[' + itemValue + ']';
                              //       isPurchaseOrder = 'true';
                              //     }
                              //   }
                              // }
                              if (item.field_name === 'Po') {
                                var indexPO = field.findIndex(i => i.field_name === 'PO');
                                var indexPO2 = field.findIndex(i => i.field_name === 'PO2');
                                var indexPO3 = field.findIndex(i => i.field_name === 'PO3');
                                var indexPO4 = field.findIndex(i => i.field_name === 'PO4');
                                var indexPO5 = field.findIndex(i => i.field_name === 'PO5');
                                var ocrResultPONotEmptyList = []
                                if (field[indexPO] && !['', undefined, 'undefined', null, 'null'].includes(field[indexPO].ocr_result)) {
                                  ocrResultPONotEmptyList.push(field[indexPO].ocr_result)
                                }
                                if (field[indexPO2] && !['', undefined, 'undefined', null, 'null'].includes(field[indexPO2].ocr_result)) {
                                  ocrResultPONotEmptyList.push(field[indexPO2].ocr_result)
                                }
                                if (field[indexPO3] && !['', undefined, 'undefined', null, 'null'].includes(field[indexPO3].ocr_result)) {
                                  ocrResultPONotEmptyList.push(field[indexPO3].ocr_result)
                                }
                                if (field[indexPO4] && !['', undefined, 'undefined', null, 'null'].includes(field[indexPO4].ocr_result)) {
                                  ocrResultPONotEmptyList.push(field[indexPO4].ocr_result)
                                }
                                if (field[indexPO5] && !['', undefined, 'undefined', null, 'null'].includes(field[indexPO5].ocr_result)) {
                                  ocrResultPONotEmptyList.push(field[indexPO5].ocr_result)
                                }
                                if (ocrResultPONotEmptyList.length === 0) {
                                  itemValue = '[]';
                                } else {
                                  for (var i = 0; i < ocrResultPONotEmptyList.length; i++) {
                                    itemValue += '"' + ocrResultPONotEmptyList[i] + '"' + ',';
                                  }
                                  itemValue = itemValue.substring(0, itemValue.length - 1);
                                  itemValue = '[' + itemValue + ']';
                                  isPurchaseOrder = 'true';
                                }
                              } else if (item.field_name === 'VatData') {
                                var indexVatRate = field.findIndex(i => i.field_name === 'VatRate');
                                var indexVatBaseAmount = field.findIndex(i => i.field_name === 'VatBaseAmount');
                                if (field[indexVatRate].ocr_result === '0') {
                                  itemValue = 'null';
                                } else {
                                  var indexVat = vatList.findIndex(i => i.code === field[indexVatRate].ocr_result)
                                  itemValue = '{"Rate": ' + vatList[indexVat]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexVatBaseAmount].ocr_result) + ', "VatAmount": 0 }';
                                }
                              } else if (item.field_name === 'WHTDataList') {
                                var indexWhtRate = field.findIndex(i => i.field_name === 'WHTRate');
                                var indexWhtBaseAmount = field.findIndex(i => i.field_name === 'WHTBaseAmount');
                                if (field[indexWhtRate] === undefined || field[indexWhtRate].ocr_result === '0') {
                                  itemValue = '[]';
                                } else {
                                  var indexWht2Rate = field.findIndex(i => i.field_name === 'WHT2Rate');
                                  var indexWht2BaseAmount = field.findIndex(i => i.field_name === 'WHT2BaseAmount');
                                  var indexWht = whtList.findIndex(i => i.code === field[indexWhtRate].ocr_result)
                                  if (field[indexWht2Rate] === undefined || field[indexWht2Rate].ocr_result === '0') {
                                    itemValue = '[{"Rate": ' + whtList[indexWht]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWhtBaseAmount].ocr_result) + ', "VatAmount": 0 }]';
                                  } else {
                                    var indexWht3Rate = field.findIndex(i => i.field_name === 'WHT3Rate');
                                    var indexWht3BaseAmount = field.findIndex(i => i.field_name === 'WHT3BaseAmount');
                                    var indexWht2 = whtList.findIndex(i => i.code === field[indexWht2Rate].ocr_result)
                                    if (field[indexWht3Rate] === undefined || field[indexWht3Rate].ocr_result === '0') {
                                      itemValue = '['
                                        + '{"Rate": ' + whtList[indexWht]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWhtBaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                        + '{"Rate": ' + whtList[indexWht2]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht2BaseAmount].ocr_result) + ', "VatAmount": 0 }'
                                        + ']';
                                    } else {
                                      var indexWht4Rate = field.findIndex(i => i.field_name === 'WHT4Rate');
                                      var indexWht4BaseAmount = field.findIndex(i => i.field_name === 'WHT4BaseAmount');
                                      var indexWht3 = whtList.findIndex(i => i.code === field[indexWht3Rate].ocr_result)
                                      if (field[indexWht4Rate] === undefined || field[indexWht4Rate].ocr_result === '0') {
                                        itemValue = '['
                                          + '{"Rate": ' + whtList[indexWht]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWhtBaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                          + '{"Rate": ' + whtList[indexWht2]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht2BaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                          + '{"Rate": ' + whtList[indexWht3]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht3BaseAmount].ocr_result) + ', "VatAmount": 0 }'
                                          + ']';
                                      } else {
                                        var indexWht5Rate = field.findIndex(i => i.field_name === 'WHT5Rate');
                                        var indexWht5BaseAmount = field.findIndex(i => i.field_name === 'WHT5BaseAmount');
                                        var indexWht4 = whtList.findIndex(i => i.code === field[indexWht4Rate].ocr_result)
                                        if (field[indexWht5Rate] === undefined || field[indexWht5Rate].ocr_result === '0') {
                                          itemValue = '['
                                            + '{"Rate": ' + whtList[indexWht]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWhtBaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht2]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht2BaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht3]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht3BaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht4]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht4BaseAmount].ocr_result) + ', "VatAmount": 0 }'
                                            + ']';
                                        } else {
                                          var indexWht5 = whtList.findIndex(i => i.code === field[indexWht5Rate].ocr_result)
                                          itemValue = '['
                                            + '{"Rate": ' + whtList[indexWht]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWhtBaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht2]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht2BaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht3]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht3BaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht4]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht4BaseAmount].ocr_result) + ', "VatAmount": 0 },'
                                            + '{"Rate": ' + whtList[indexWht5]['rate'].toString() + ', "BaseAmount": ' + cvtStringToDecimal(field[indexWht5BaseAmount].ocr_result) + ', "VatAmount": 0 }'
                                            + ']';
                                        }
                                      }

                                    }
                                  }
                                }
                              } else if (item.field_name === 'PaymentRequestSubItemList') {
                                var indexExpenseCode = field.findIndex(i => i.field_name === 'ExpenseCode');
                                var indexCostCenterCode = field.findIndex(i => i.field_name === 'CostCenterCode');
                                var indexInternalOrderNumber = field.findIndex(i => i.field_name === 'InternalOrderNumber');
                                var indexAssignment = field.findIndex(i => i.field_name === 'Assignment');
                                var indexExplanation = field.findIndex(i => i.field_name === 'Explanation');
                                var indexAmount = field.findIndex(i => i.field_name === 'Amount');
                                if (indexExpenseCode === -1 && indexCostCenterCode === -1 && indexInternalOrderNumber === -1 && indexAssignment === -1 && indexExplanation === -1) {
                                  itemValue = '[]';
                                } else {
                                  var valueExpenseCode = indexExpenseCode === -1 ? '' : field[indexExpenseCode].ocr_result;
                                  var valueCostCenterCode = indexCostCenterCode === -1 ? '' : field[indexCostCenterCode].ocr_result;
                                  var valueInternalOrderNumber = indexInternalOrderNumber === -1 ? '' : field[indexInternalOrderNumber].ocr_result;
                                  var valueAssignment = indexAssignment === -1 ? '' : field[indexAssignment].ocr_result;
                                  var valueExplanation = indexExplanation === -1 ? '' : field[indexExplanation].ocr_result;
                                  //var valueAmount = indexAmount === -1 ? '' : field[indexAmount].ocr_result;
                                  itemValue = '[{"ExpenseCode": "' + valueExpenseCode + '","CostCenterCode": "' + valueCostCenterCode + '","InternalOrderNumber": "' + valueInternalOrderNumber + '","Assignment": "' + valueAssignment + '","Amount": 0,"Explanation": "' + valueExplanation + '"}]';
                                }
                              } else if (item.field_name === 'FileRelationDataList') {
                                if (attachFileList.length > 0) {
                                  attachFileList.forEach(f => {
                                    if (f.file_id === field[0].file_id) {
                                      itemValue = itemValue + '{"FileName": "' + f.original_name + '","FileByteData" : "' + '"}' + ',';
                                      itemCompleteValue = itemCompleteValue + '{"FileName": "' + f.original_name + '","FileByteData" : "' + f.file_base64 + '"}' + ',';
                                    }
                                  });
                                }
                                itemValue = itemValue.substring(0, itemValue.length - 1);
                                itemValue = '[' + itemValue + ']';
                                itemCompleteValue = itemCompleteValue.substring(0, itemCompleteValue.length - 1);
                                itemCompleteValue = '[' + itemCompleteValue + ']';
                              } else {
                                var index = field.findIndex(i => i.field_name === item.field_name);
                                itemValue = index === -1 ? '' : field[index].ocr_result;
                              }
                              itemValue = itemValue === 'undefined' || itemValue === undefined || itemValue === '' ? item.field_type === 'O' ? 'null' : item.field_type === 'D' ? '0' : item.field_type === 'B' ? 'false' : item.field_type === 'O' ? 'null' : item.field_type === 'L' ? item.field_length === 1 ? 'null' : '[]' : item.field_type === 'S' && item.is_requirefield === 'N' && item.field_name !== 'Reference1' ? 'null' : '' : itemValue;
                              itemValue = item.field_type === 'D' ? cvtStringToDecimal(itemValue) : item.field_type === 'DT' ? itemValue.replace('.000Z', '+07:00').replace('+00:00', '+07:00').replace('07:00:00', '00:00:00') : itemValue;

                              itemCompleteValue = item.field_name === 'FileRelationDataList' ? itemCompleteValue : itemValue;

                              var itemQuote = item.field_type === 'B' || item.field_type === 'D' || item.field_type === 'O' || item.field_type === 'L' || (item.field_type === 'S' && item.is_requirefield === 'N' && itemValue === 'null') ? '' : '"';
                              jsonItemQry = jsonItemQry + '"' + item.field_name + '": ' + itemQuote + itemValue + itemQuote + ',';
                              jsonItemCompleteQry = jsonItemCompleteQry + '"' + item.field_name + '": ' + itemQuote + itemCompleteValue + itemQuote + ',';
                            });
                            jsonItemQry = jsonItemQry.substring(0, jsonItemQry.length - 1);
                            jsonItemQry = jsonItemQry + '}';
                            jsonItemCompleteQry = jsonItemCompleteQry.substring(0, jsonItemCompleteQry.length - 1);
                            jsonItemCompleteQry = jsonItemCompleteQry + '}';

                            paymentRequestItems = paymentRequestItems + jsonItemQry + ',';
                            paymentRequestItemsComplete = paymentRequestItemsComplete + jsonItemCompleteQry + ',';
                          });
                          paymentRequestItems = '[' + paymentRequestItems.substring(0, paymentRequestItems.length - 1) + ']';
                          paymentRequestItemsComplete = '[' + paymentRequestItemsComplete.substring(0, paymentRequestItemsComplete.length - 1) + ']';

                          othersInformation = othersInformation === '' ? othersInformation : '[' + othersInformation.substring(0, othersInformation.length - 1) + ']';

                          // Allpay Request
                          headerList.forEach(e => {
                            var fieldValue = '';
                            var fieldCompleteValue = '';
                            if (e.field_name === 'CreatorUserName') {
                              fieldValue = creatorUserName;
                            } else if (e.field_name === 'CreateDate') {
                              fieldValue = createDate;
                            } else if (e.field_name === 'RefNo') {
                              fieldValue = allpay_refno;
                            } else if (e.field_name === 'UserLogin') {
                              fieldValue = config.RabbitMQ.AllPayCreatorUser.username;
                            } else if (e.field_name === 'PasswordLogin') {
                              fieldValue = config.RabbitMQ.AllPayCreatorUser.password;
                            } else if (e.field_name === 'Status') {
                              fieldValue = status;
                            } else if (e.field_name === 'IsPurchaseOrder') {
                              fieldValue = isPurchaseOrder;
                            } else if (e.field_name === 'OthersInformation') {
                              fieldValue = othersInformation;
                            } else if (e.field_name === 'IsAlternativePayee') {
                              fieldValue = isAlternativePayee;
                            } else if (e.field_name === 'AlternativePayeeList' && isAlternativePayee === 'true') {
                              fieldValue = JSON.stringify(alternativePayeeList)
                              // fieldValue = '[{"Amount":' + cvtStringToDecimal(valueAlternativePayeeAmount) + ',"VendorCode": "' + valueAlternativePayeeVendorCode + '"}]';
                            } else if (e.field_name === 'RemittedCurrencyCode' ||
                              e.field_name === 'RemittedToCurrencyCode' ||
                              e.field_name === 'PaidForCode' ||
                              e.field_name === 'PreAdviceCode' ||
                              e.field_name === 'PurposeDetail' ||
                              e.field_name === 'ForwardContractNo' ||
                              e.field_name === 'BankChargeOutside' ||
                              e.field_name === 'BankChargeInside' ||
                              e.field_name === 'SpecialMessage' ||
                              e.field_name === 'IntenalMessage'
                            ) {
                              if (isForeignPayment) {
                                var index = fields.findIndex(item => item.field_name === e.field_name);
                                if (e.field_name === 'BankChargeOutside' || e.field_name === 'BankChargeInside') {
                                  var bankCharge = index === -1 ? '' : fields[index].ocr_result;
                                  if (bankCharge === undefined || bankCharge === 'undefined' || bankCharge === '' || bankCharge === null) {
                                    fieldValue = 'null';
                                  } else {
                                    var indexBankCharge = bankChargeList.findIndex(i => i.code === bankCharge);
                                    if (indexBankCharge === -1) {
                                      fieldValue = 'null';
                                    } else {
                                      fieldValue = bankChargeList[indexBankCharge]['name'];
                                    }
                                  }
                                } else {
                                  fieldValue = index === -1 ? 'null' : fields[index].ocr_result;
                                }

                              } else {
                                fieldValue = 'null';
                              }
                            } else if (e.field_name === 'PaymentRequestItems') {
                              fieldValue = paymentRequestItems;
                            } else if (e.field_name === 'ExchangeRate') {
                              var index = fields.findIndex(item => item.field_name === e.field_name);
                              fieldValue = index === -1 ? '' : fields[index].ocr_result;
                              if (fieldValue === '' || fieldValue === undefined || fieldValue === null || fieldValue === 'undefined') {
                                var index = fields.findIndex(item => item.field_name === 'CurrencyCode');
                                fieldValue = index === -1 ? '' : fields[index].ocr_result === 'THB' ? '1' : '0';
                              }
                            } else if (e.field_name === 'Approvers') {
                              var indexReviewer = fields.findIndex(item => item.field_name === 'Initiator-ReviewerUserName'); // type = 3
                              var indexCC = fields.findIndex(item => item.field_name === 'Initiator-CCUserName'); // type = 2

                              if (indexReviewer !== -1) {
                                if (typeof (fields[indexReviewer].ocr_result) === 'string' && !(fields[indexReviewer].ocr_result === '' && fields[indexReviewer].ocr_result === undefined || fields[indexReviewer].ocr_result === 'undefined')) {
                                  var splitReviewer = fields[indexReviewer].ocr_result.split(",");
                                  for (var i = 0; i < splitReviewer.length; i++) {
                                    fieldValue = fieldValue + '{"UserName": "' + splitReviewer[i] + '", "Ordinal": ' + (i + 1) + ',"Type": 3,"ActionDate": "' + actionDateReviewer + '"}' + ','
                                  }
                                }
                              }

                              if (indexCC !== -1) {
                                if (typeof (fields[indexCC].ocr_result) === 'string' && !(fields[indexCC].ocr_result === '' || fields[indexCC].ocr_result === undefined || fields[indexCC].ocr_result === 'undefined')) {
                                  var splitCC = fields[indexCC].ocr_result.split(",");
                                  for (var i = 0; i < splitCC.length; i++) {
                                    fieldValue = fieldValue + '{"UserName": "' + splitCC[i] + '", "Ordinal": ' + (i + 1) + ',"Type": 2,"ActionDate": "' + actionDateCC + '"}' + ','
                                  }
                                }
                              }

                              if (indexApprover !== -1) {
                                if (!(fields[indexApprover].ocr_result === '' || fields[indexApprover].ocr_result === undefined || fields[indexApprover].ocr_result === 'undefined')) {
                                  fieldValue = fieldValue + '{"UserName": "' + fields[indexApprover].ocr_result + '", "Ordinal": 1,"Type": 1,"ActionDate": null}' + ','
                                }
                              }

                              fieldValue = '[' + fieldValue.substring(0, fieldValue.length - 1) + ']'

                            } else if (e.field_name === 'Ben') {
                              fieldValue = beneficiary;
                            } else if (e.field_name === 'FileRelationDataList') {
                              if (supportingDocFileList.length > 0) {
                                supportingDocFileList.forEach(f => {
                                  fieldValue = fieldValue + '{"FileName": "' + f.original_name + '","FileByteData" : "' + '"}' + ',';
                                  fieldCompleteValue = fieldCompleteValue + '{"FileName": "' + f.original_name + '","FileByteData" : "' + f.file_base64 + '"}' + ',';
                                });
                              }
                              fieldValue = fieldValue.substring(0, fieldValue.length - 1);
                              fieldValue = '[' + fieldValue + ']';
                              fieldCompleteValue = fieldCompleteValue.substring(0, fieldCompleteValue.length - 1);
                              fieldCompleteValue = '[' + fieldCompleteValue + ']';
                            } else if (e.field_name === 'FileReceiptList') {
                              if (receiptFileList.length > 0) {
                                receiptFileList.forEach(f => {
                                  fieldValue = fieldValue + '{"FileName": "' + f.original_name + '","FileByteData" : "' + '"}' + ',';
                                  fieldCompleteValue = fieldCompleteValue + '{"FileName": "' + f.original_name + '","FileByteData" : "' + f.file_base64 + '"}' + ',';
                                });
                              }
                              fieldValue = fieldValue.substring(0, fieldValue.length - 1);
                              fieldValue = '[' + fieldValue + ']';
                              fieldCompleteValue = fieldCompleteValue.substring(0, fieldCompleteValue.length - 1);
                              fieldCompleteValue = '[' + fieldCompleteValue + ']';
                            } else {
                              var index = fields.findIndex(item => item.field_name === e.field_name);
                              fieldValue = index === -1 ? '' : fields[index].ocr_result;
                              fieldValue = e.field_type === 'D' ? cvtStringToDecimal(fieldValue) : e.field_type === 'DT' ? fieldValue.replace('.000Z', '+07:00').replace('+00:00', '+07:00').replace('07:00:00', '00:00:00') : fieldValue;
                            }

                            fieldValue = fieldValue === 'undefined' || fieldValue === undefined || fieldValue === '' ? e.field_type === 'O' ? 'null' : e.field_type === 'D' ? '0' : e.field_type === 'B' ? 'false' : e.field_type === 'L' ? e.field_length === 1 ? 'null' : '[]' : e.field_type === 'S' && e.is_requirefield === 'N' ? 'null' : '' : e.field_name === 'LocationCode' && fieldValue === '00' ? '' : fieldValue;

                            if (e.field_name === 'PaymentRequestItems') {
                              fieldCompleteValue = paymentRequestItemsComplete
                            } else if (!['FileRelationDataList', 'FileReceiptList'].includes(e.field_name)) {
                              fieldCompleteValue = fieldValue
                            }
                            var quote = e.field_type === 'B' || e.field_type === 'D' || e.field_type === 'O' || e.field_type === 'L' || (e.field_type === 'S' && e.is_requirefield === 'N' && fieldValue === 'null') ? '' : '"';

                            //console.log(e.masterfield_order + ' "' + e.field_name + '":' + quote + fieldValue + quote);

                            jsonQry = jsonQry + '"' + e.field_name + '":' + quote + fieldValue + quote + ',';
                            jsonCompleteQry = jsonCompleteQry + '"' + e.field_name + '": ' + quote + fieldCompleteValue + quote + ',';
                          });
                          jsonQry = jsonQry.substring(0, jsonQry.length - 1);
                          jsonQry = jsonQry + '}';

                          jsonCompleteQry = jsonCompleteQry.substring(0, jsonCompleteQry.length - 1);
                          jsonCompleteQry = jsonCompleteQry + '}';

                          allpay_request = jsonQry;
                          allpay_request_complete = jsonCompleteQry;
                        }

                        fileModel.updateAllPayRefNoAllPayRequestOCRFile(fileIdList, allpay_refno, allpay_request.replace("'", "''"), allpay_by).then((response) => {
                          if (typeof response.rowsAffected !== 'undefined' && response.rowsAffected.length > 0) {
                            /*
                            var count = 0;
                            fieldsList.forEach((fields) => {
                              var jsonQry = '{';
                              var file_id = fields[0].file_id;
                              fields.forEach(e => {
                                var fieldValue = ''
                                if (e.field_name === 'CreatorUserName') {
                                  fieldValue = creatorUserName;
                                } else if (e.field_name === 'CreateDate') {
                                  fieldValue = createDate;
                                } else {
                                  fieldValue = e.ocr_result;
                                }
        
                                jsonQry = jsonQry + '"' + e.display_name + '":"' + fieldValue + '",'
                              });
                              jsonQry = jsonQry.substring(0, jsonQry.length - 1);
                              jsonQry = jsonQry + '}';
        
                              fileModel.updateModifyResultOCRFile(file_id, jsonQry).then((fileResponse) => {
                                count = count + 1;
        
                                if(count === fileIdList.length){
                                  var obj = {};
                                  obj.value = allpay_refno;
                                  obj.message = allpay_request_complete;
                                  requestDataList.push(obj);
                                }
                              });
                            });
                            */
                            var obj = {};
                            obj.value = allpay_refno;
                            obj.message = allpay_request_complete;
                            console.log("allpay_refno:", allpay_refno);
                            console.log("allpay_request:", allpay_request);
                            // console.log("allpay_request_complete:", allpay_request_complete);
                            requestDataList.push(obj);
                          }
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    }
  });
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {

  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) { resolve(value); });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try { step(generator.next(value)); }
      catch (e) { reject(e); }
    }
    function rejected(value) {
      try { step(generator["throw"](value)); }
      catch (e) { reject(e); }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = (this && this.__generator) || function (thisArg, body) {
  var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");
    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];
      switch (op[0]) {
        case 0: case 1: t = op; break;
        case 4: _.label++; return { value: op[1], done: false };
        case 5: _.label++; y = op[1]; op = [0]; continue;
        case 7: op = _.ops.pop(); _.trys.pop(); continue;
        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
          if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
          if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
          if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
          if (t[2]) _.ops.pop();
          _.trys.pop(); continue;
      }
      op = body.call(thisArg, _);
    } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
    if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
};

var __asyncValues = (this && this.__asyncValues) || function (o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
};

var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : { "default": mod };
};

// ##########   ##########   ##########
// ########## DISABLE ALLPAY ##########
// ##########   ##########   ##########

// Object.defineProperty(exports, "__esModule", { value: true });
// var readline_1 = __importDefault(require("readline"));
// var messageType_1 = require("../../../dist/messageType");
// var bus_1 = __importDefault(require("../../../dist/bus"));
// messageType_1.MessageType.setDefaultNamespace(config.RabbitMQ.defaultNamespace);
// var bus = bus_1.default();
// var requestDataList = [];

// var client = bus.requestClient({
//   exchange: config.RabbitMQ.exchangeName,
//   requestType: new messageType_1.MessageType(config.RabbitMQ.requestMessageType),
//   responseType: new messageType_1.MessageType(config.RabbitMQ.responseMessageType),
// });

// var submitOrder = setInterval(function () {
//   return __awaiter(void 0, void 0, void 0, function () {
//     var response, e_1;
//     return __generator(this, function (_a) {
//       switch (_a.label) {
//         case 0:
//           _a.trys.push([0, 2, , 3]);
//           if (requestDataList.length === 0) {
//             return [3 /*break*/, 3];
//           } else {
//             var obj = requestDataList.shift();
//             return [4 /*yield*/, client.getResponse(JSON.parse(obj.message))];
//           }

//         case 1:
//           response = _a.sent();
//           var responseMessage = response.message;
//           var ocr_status = 'AS';
//           var allpay_no = null;
//           var allpay_refno = responseMessage.refNo;
//           if (responseMessage.isSuccess === undefined || responseMessage.isSuccess === false) {
//             ocr_status = 'AF';
//           } else {
//             ocr_status = 'AS';
//             allpay_no = responseMessage.requestNo;
//           }
//           logger.info("All Pay Resopnse : " + JSON.stringify(responseMessage));
//           fileModel.updateAllPayOCRFileByAllPayRefNo(allpay_refno, ocr_status, allpay_no, JSON.stringify(responseMessage)).then((updateResopnse) => {
//             if (updateResopnse !== null && updateResopnse.rowsAffected.length > 0) {
//               console.log('Update allpay_refno: ' + allpay_refno + ',  ocr_status: ' + ocr_status + ', allpay_no: ' + allpay_no + ', allpay_result_message: ' + JSON.stringify(responseMessage) + ' success.');
//             } else {
//               console.log('Update allpay_refno: ' + allpay_refno + ',  ocr_status: ' + ocr_status + ', allpay_no: ' + allpay_no + ', allpay_result_message: ' + JSON.stringify(responseMessage) + ' fail.');
//             }
//           });
//           return [3 /*break*/, 3];

//         case 2:
//           e_1 = _a.sent();
//           // console.error("failed to submit order", e_1.message);
//           logger.error("failed to submit order", e_1.message);
//           return [3 /*break*/, 3];

//         case 3: return [2 /*return*/];
//       }
//     });
//   });
// }, 1000);

// process.on("SIGINT", function () {
//   return __awaiter(void 0, void 0, void 0, function () {
//     return __generator(this, function (_a) {
//       clearInterval(submitOrder);
//       return [2 /*return*/];
//     });
//   });
// });

// var rl = readline_1.default.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// var start = function () {
//   return __awaiter(void 0, void 0, void 0, function () {
//     var rl_1, rl_1_1, line, e_2_1;
//     var e_2, _a;
//     return __generator(this, function (_b) {
//       switch (_b.label) {
//         case 0:
//           _b.trys.push([0, 5, 6, 11]);
//           rl_1 = __asyncValues(rl);
//           _b.label = 1;
//         case 1: return [4 /*yield*/, rl_1.next()];
//         case 2:
//           if (!(rl_1_1 = _b.sent(), !rl_1_1.done)) return [3 /*break*/, 4];
//           line = rl_1_1.value;
//           if (line === "restart")
//             bus.restart().then(function () { return console.log("restarted the bus"); });
//           if (line === "quit")
//             return [3 /*break*/, 4];
//           _b.label = 3;
//         case 3: return [3 /*break*/, 1];
//         case 4: return [3 /*break*/, 11];
//         case 5:
//           e_2_1 = _b.sent();
//           e_2 = { error: e_2_1 };
//           return [3 /*break*/, 11];
//         case 6:
//           _b.trys.push([6, , 9, 10]);
//           if (!(rl_1_1 && !rl_1_1.done && (_a = rl_1.return))) return [3 /*break*/, 8];
//           return [4 /*yield*/, _a.call(rl_1)];
//         case 7:
//           _b.sent();
//           _b.label = 8;
//         case 8: return [3 /*break*/, 10];
//         case 9:
//           if (e_2) throw e_2.error;
//           return [7 /*endfinally*/];
//         case 10: return [7 /*endfinally*/];
//         case 11: return [2 /*return*/];
//       }
//     });
//   });
// };

// start().then(function () {
//   return __awaiter(void 0, void 0, void 0, function () {
//     return __generator(this, function (_a) {
//       switch (_a.label) {
//         case 0: return [4 /*yield*/, bus.stop()];
//         case 1:
//           _a.sent();
//           process.exit(0);
//           return [2 /*return*/];
//       }
//     });
//   });
// });

// ##########   ##########   ##########
// ########## DISABLE ALLPAY ##########
// ##########   ##########   ##########

var checkStatusFromOcrResult = (result) => {
  // ***** 5/May/2021 Chanakan C. Mod Start ***** //
  var status = 'WR'
  // ***** 5/May/2021 Chanakan C. Mod End ***** //
  if (result.hasOwnProperty('type')) {
    if (result['type'] === 'invalid-json') {
      status = 'F'
    }
  } else if (result.hasOwnProperty('Error')) {
    status = 'F'
  }
  return status
}

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

var streamToBuffer = (stream) => {
  return new Promise((resolve, reject) => {
    const _buffer = [];
    stream.on("data", (chunk) => _buffer.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buffer)));
    stream.on("error", (err) => reject(err));
  });
}


var getTotalPagesExtracted = async (file) => {
  const fs = require('fs');
  if (file.specific_page.length > 0) {
    return file.specific_page.length;
  } else {
    return new Promise(async (resolve, reject) => {
      const full_file_path = file.full_path.replace(/\\/g, '/')  // for mac os
      // const full_file_path = file.full_path
      let dataBuffer = fs.readFileSync(full_file_path);
      await pdf(dataBuffer).then((data) => {
        resolve(data.numpages)
      })
        .catch((error) => {
          reject(error)
        })
    })
  }
}

var getAttachFileList = async (fileIdList) => {
  var file = await fileModel.getOCRFileAndAttachFile(fileIdList);
  var fileList = [];
  if (file !== null && file.rowsAffected.length > 0) {
    await Promise.all(file.recordset.map(async (f) => {
      var blobDownloadResponse = await fileModel.downloadAttachFileFromAzureStorageBlobByFileName(f.file_name);
      var fileStream = blobDownloadResponse.readableStreamBody
      var obj = {};
      obj['file_id'] = f.file_id;
      obj['attachfile_id'] = f.attachfile_id;
      obj['file_name'] = f.file_name;
      obj['original_name'] = f.original_name;
      obj['file_base64'] = await streamToBase64(fileStream);
      fileList.push(obj);
    }));
    return fileList;
  }
  else {
    return fileList;
  }
}

var getReceiptFileList = async (fileIdList) => {
  var file = await fileModel.getReceiptFileByFileList(fileIdList);
  var fileList = [];
  if (file !== null && file.rowsAffected.length > 0) {
    await Promise.all(file.recordset.map(async (f) => {
      var blobDownloadResponse = await fileModel.downloadAttachFileFromAzureStorageBlobByFileName(f.file_name);
      var fileStream = blobDownloadResponse.readableStreamBody
      var obj = {};
      obj['file_id'] = f.file_id;
      obj['attachfile_id'] = f.attachfile_id;
      obj['file_name'] = f.file_name;
      obj['original_name'] = f.original_name;
      obj['file_base64'] = await streamToBase64(fileStream);
      fileList.push(obj);
    }));
    return fileList;
  }
  else {
    return fileList;
  }
}

var getSupportingDocFileList = async (fileIdList) => {
  var file = await fileModel.getSupportingDocFileByFileList(fileIdList);
  var fileList = [];
  if (file !== null && file.rowsAffected.length > 0) {
    await Promise.all(file.recordset.map(async (f) => {
      var blobDownloadResponse = await fileModel.downloadAttachFileFromAzureStorageBlobByFileName(f.file_name);
      var fileStream = blobDownloadResponse.readableStreamBody
      var obj = {};
      obj['file_id'] = f.file_id;
      obj['attachfile_id'] = f.attachfile_id;
      obj['file_name'] = f.file_name;
      obj['original_name'] = f.original_name;
      obj['file_base64'] = await streamToBase64(fileStream);
      fileList.push(obj);
    }));
    return fileList;
  }
  else {
    return fileList;
  }
}

var cvtStringToDecimal = (value) => {
  if (typeof (value) === 'number') {
    value = value.toFixed(4)
  }
  value = value.replace(/ /g, '')
  if (value.match(/.*\.\d*\,\d*/g)) { // For pattern *.*,*
    value = value.replace(/\./g, '').replace(/,/g, '.')
  } else { // For other patterns
    value = value.replace(/,/g, '')
  }
  value = parseFloat(value) ? parseFloat(value) : 0
  return value
}

var checkValue = (str) => {
  let num = parseFloat(str);
  if (isNaN(num)) {
    return str;
  } else {
    let newStr = str.replace(/[.,]/g, function(match) {
        return match === '.' ? ',' : '.';
    });
    return newStr
  }
}

var mappingOcrAndMaster =  async (ocrResult, file_id) => {

    let data = false
    const response = await fileModel.getOCRResultByFileId(file_id)
    if (response && response.recordsets && response.recordsets[0]?.length > 0) {
      var ocrMasterData = response.recordsets[0]
      data = {}
      await ocrMasterData.map((item) => {
        if (item.is_ocr === true) {
          data[item.display_name] = ocrResult[item.display_name] ? `${ocrResult[item.display_name]}` : ""
        } else if (item.is_variable === true) {
          data[item.display_name] = ocrResult[item.display_name] ? `${ocrResult[item.default_value]}` : ""
        }
      });
    }

  return data
}

var extractStringObject = async (input) => {
    input = input.trim();

    if (input.startsWith("```json") && input.endsWith("```")) {
        input = input.substring(6, input.length - 3).trim();
    }

    const regex = /{[^{}]*}/;
    const match = regex.exec(input);

    if (match) {
        const objectString = match[0];
        try {
            const parsedObj = JSON.parse(objectString);
            if (typeof parsedObj === 'object' && parsedObj !== null && !Array.isArray(parsedObj)) {
                return parsedObj;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }

    return null;
}

module.exports = {
  getOCRFiles: async (req, res, next) => {
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      // ***** 5/May/2021 Chanakan C. Mod Start ***** //
      var result = await fileModel.getOCRFileList(req)
      // ***** 5/May/2021 Chanakan C. Mod End ***** //
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0];
        //console.log(data)
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  getOCRFilesTotalPageExtracted: async (req, res, next) => {
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await fileModel.getOCRFilesTotalPageExtracted(req)
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0];
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  upsertOCRFileAndStatus: async (req, res, next) => {
    // ***** 5/May/2021 Chanakan C. Mod Start ***** //
    var file_id = (typeof req.params.fileId !== 'undefined' ? req.params.file_id : null)
    // ***** 5/May/2021 Chanakan C. Mod End ***** //
    var errMsg = null
    var result = {
      status: true
    }
    var resp = null
    var statusCode = 200
    try {
      var data = req.body
      if (file_id !== null) {
        data.update_by = req.cur_user.trim()
        resp = await fileModel.upsertOCRFileandStatus(data, file_id)
        if (typeof resp.rowsAffected !== 'undefined' && resp.rowsAffected.length > 0) {
          result.status = true
          result.message = 'success'
        } else {
          result.status = false
          result.message = 'some file fail'
        }
      } else {
        for (const idx in data) {
          data[idx].create_by = req.cur_user.trim()
          var today = new Date();
          var yyyy = today.getFullYear();
          var mm = today.getMonth() < 9 ? "0" + (today.getMonth() + 1) : (today.getMonth() + 1); // getMonth() is zero-based
          var dd = today.getDate() < 10 ? "0" + today.getDate() : today.getDate();
          var yyyymmdd = "".concat(yyyy).concat(mm).concat(dd)
          var running = await fileModel.getRunningNoByCurrentDate()
          data[idx].total_pages_extracted = await getTotalPagesExtracted(data[idx])
          if (running.recordsets[0].length > 0) {
            data[idx].file_no = yyyymmdd.concat(running.recordset[0].running)
            resp = await fileModel.upsertOCRFileandStatus(data[idx])
            if (typeof resp.rowsAffected !== 'undefined' && resp.rowsAffected.length > 0 && result.status === true) {
              result.file_id = resp.recordset[0]?.file_id || null;
              result.status = true
              result.message = 'success'
            } else {
              result.status = false
              result.message = 'some file fail'
            }
          } else {
            result.status = false
            result.message = 'some file fail'
          }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = result
    next()
  },
  extractOCRFilesByAI: async (req, res, next) => {
    const { file_id, docIntel_model, ai_model, ai_prompt } = req.body;

    let ocrFile = null;
    let dataDocument = null
    let ocrResult = false;
    let message = '';

    const [service, model, version] = ai_model?.split(',') || [];

    try {
      const responseOcrFile = await fileModel.getOCRByFileId(file_id);
      if (responseOcrFile && responseOcrFile.recordset && responseOcrFile.recordset.length > 0) {
        ocrFile = responseOcrFile?.recordset[0]

        // Update 'in-progress' status to ocr - start
        var updateDataBeforeOcr = {
          original_result: ocrFile.original_result,
          ocr_status: 'IP'
        }
        await fileModel.upsertOCRFileandStatus(updateDataBeforeOcr, file_id)
        // Update 'in-progress' status to ocr - end

        dataDocument = await ocrModel.extractByAzureAIDocIntel(docIntel_model, ocrFile);
        if (dataDocument && dataDocument !== '') {
          // const message1 = "I need help mapping the data at the top. Enter it with the data variable in the object below. In some cases, the variable names may not be related. I'd like your help to consider it. Analyze variables that are related to each other."
          // const message2 = 'As a result, Example string object results :  {"Form Type":"invoice","VAT Rate":"576.771"} Important: Answer only string objects. without any other text, and reply immediately'
          // message = `${dataDocument} ${message1} ${ai_prompt} ${message2}`
          message = `${dataDocument} ${ai_prompt} Important: Answer only string objects. without any other text, and reply immediately`

          // call api ai service to get ocr_result
          if (service === 'azure_ai') {
            var responseOcrResult = await azureAI.callAzureAI(model, version, message);
          }
          // mapping ocr_result and master_data
          if (responseOcrResult) {
            var objectOcrResult = await extractStringObject(responseOcrResult);
            console.log('objectOcrResult', objectOcrResult);
            if (typeof objectOcrResult === 'object') {
              ocrResult = await mappingOcrAndMaster(objectOcrResult, file_id);
            }
          }
        } else {
          console.log('dataDocument is null');
        }
      }

      var updateDataAfterOcr = {
        original_result: JSON.stringify(ocrResult),
        ocr_status: ocrResult ? 'WR' : 'F'
      }

      // update original_result and status to ocr record
      await fileModel.upsertOCRFileandStatus(updateDataAfterOcr, file_id)

      if (ocrResult && ocrResult !== null) { // update modify_result
        // get ocr result from file_id
        await fileModel.getOCRResultByFileId(file_id).then(async (fields) => {
          await fileModel.updateOCRModifyResultByFileId(ocrFile, ocrResult, fields)
        })
      } else {
        throw new Error('ocrResult is null');
      }

    } catch (error) {
      console.log(error);
      errMsg = {
        data: {
          "1-dataDocument": dataDocument,
          "2-message": message,
          "3-responseOcrResult": responseOcrResult,
          "4-objectOcrResult": objectOcrResult,
          "5-ocrResult": ocrResult,
        },
        message: 'something wrong',
        status: 400
      }
      logger.error(error)
      next(errMsg)
    }

    const result = {
      data: {
        "1-dataDocument": dataDocument,
        "2-message": message,
        "3-responseOcrResult": responseOcrResult,
        "4-objectOcrResult": objectOcrResult,
        "5-ocrResult": ocrResult,
      },
      message: 'success',
      status: true
    }

    res.data = result
    next()
  },
  // ***** 5/May/2021 Chanakan C. Add Start ***** //
  extractOCRFiles: async (req, res, next) => {
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var chkWstatus = true;
      do {
        // get waiting for ocr
        var wOCRData = await fileModel.getOCRFileAndMasterDataByStatus('U', 1, 'N')
        if (wOCRData !== false && Array.isArray(wOCRData.recordset) && wOCRData.recordset.length > 0) {
          var ocrFile = wOCRData.recordset[0]
          // console.log('queryOCRData =', ocrFile)
          var updateDataBeforeOcr = {
            original_result: ocrFile.original_result,
            ocr_status: 'IP'
          }

          // console.log('updateDataBeforeOcr =', updateDataBeforeOcr)
          // Update 'in-progress' status to ocr
          await fileModel.upsertOCRFileandStatus(updateDataBeforeOcr, ocrFile.file_id)

          var ocrResponse = undefined
          var ocrStatus = ''
          var trainModelDefault = await trainModelModel.getTrainModelDefaultByMasterDataId(ocrFile.masterdata_id)
          if (trainModelDefault !== false && Array.isArray(trainModelDefault.recordset) && trainModelDefault.recordset.length > 0) {
            ocrFile.model_id = trainModelDefault.recordset[0].model_id
            ocrResponse = await ocrModel.formrecognizer(ocrFile)
            if (ocrResponse !== false) {
              ocrStatus = checkStatusFromOcrResult(ocrResponse)
            } else {
              ocrStatus = 'F'
            }
          } else {
            ocrStatus = 'F'
            ocrResponse = { "Error": "Not found Model ID" }
          }

          logger.info("OCR Response : " + JSON.stringify(ocrResponse))
          var updateDataAfterOcr = {
            original_result: JSON.stringify(ocrResponse),
            ocr_status: ocrStatus
          }

          // update original_result and status to ocr record
          await fileModel.upsertOCRFileandStatus(updateDataAfterOcr, ocrFile.file_id)

          if (ocrStatus !== 'F') { // update modify_result
            // get ocr result from file_id
            await fileModel.getOCRResultByFileId(ocrFile.file_id).then(async (fields) => {
              await fileModel.updateOCRModifyResultByFileId(ocrFile, ocrResponse, fields)
            })
          }
        }

        // get waiting for ocr
        chkWstatus = await fileModel.getOCRFileAndMasterDataByStatus('U', 1, 'N')
      } while (chkWstatus !== false && Array.isArray(chkWstatus.recordset) && chkWstatus.recordset.length > 0)
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      logger.error(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  modifyResultOCRFiles: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var resultOCR = await fileModel.getOCRByFileId(file_id)
    var ocrResponse = JSON.parse(resultOCR.recordset[0].original_result)
    var wOCRData = await fileModel.getOCRFileAndMasterDataByFileId(file_id)
    var ocrFile = wOCRData.recordset[0]

    if (ocrFile) {
      await fileModel.getOCRResultByFileId(ocrFile.file_id).then(async (fields) => {
        await fileModel.updateOCRModifyResultByFileId(ocrFile, ocrResponse, fields)
      })
      res.data = { status: 'success', message: 'Update Status success' }
      next()
    } else {
      next()
    }
  },
  updateFieldsByFileId: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var fields = (typeof req.body !== 'undefined' ? req.body : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var fileUpdate = await fileModel.updateFieldsByFileId(file_id, fields)
      if (typeof fileUpdate.rowsAffected !== 'undefined' && fileUpdate.rowsAffected.length > 0) {
        data = { status: 'success', message: 'Update Status success' }
      } else {
        data = { status: 'fail', message: 'Update Status fail' }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 5/May/2021 Chanakan C. Add End ***** //
  getOCRFileContent: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var errMsg = null
    try {
      // ***** 5/May/2021 Chanakan C. Mod Start ***** //
      var blobDownloadResponse = await fileModel.getOCRFileContent(file_id, 'N')
      var fileStream = blobDownloadResponse.readableStreamBody
      res.setHeader('Content-Type', blobDownloadResponse.contentType)
      fileStream.pipe(res)
      // ***** 5/May/2021 Chanakan C. Mod End ***** //
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
  },
  deleteOCRFileByFileId: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'success', message: 'Delete success' }
      var statusCode = 200
      if (file_id !== null) {
        // update is_delete
        var fileDel = await fileModel.deleteOCRFileByFileId(file_id, reqBody.is_delete, reqBody.update_by)
        if (typeof fileDel.rowsAffected !== 'undefined' && fileDel.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Delete success' }
        } else {
          data = { status: 'fail', message: 'Delete fail' }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 5/May/2021 Chanakan C. Add Start ***** //
  deleteMultipleOCRFilesByFileId: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.body.selectedRowKeys !== 'undefined' ? req.body.selectedRowKeys : null)
      var data = { status: 'success', message: 'Delete success' }
      var statusCode = 200
      if (file_id !== null) {
        // update is_delete
        var fileDel = await fileModel.deleteMultipleOCRFilesByFileId(req, file_id)
        if (typeof fileDel.rowsAffected !== 'undefined' && fileDel.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Delete success' }
        } else {
          data = { status: 'fail', message: 'Delete fail' }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 5/May/2021 Chanakan C. Add End ***** //
  updateOCRFileStatus: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'success', message: 'Update Status success' }
      var statusCode = 200
      if (file_id !== null) {
        // update is_delete
        // ***** 5/May/2021 Chanakan C. Mod Start ***** //
        var fileDel = await fileModel.updateOCRFileStatus(file_id, reqBody.ocr_status, reqBody.update_by)
        // ***** 5/May/2021 Chanakan C. Mod End ***** //
        if (typeof fileDel.rowsAffected !== 'undefined' && fileDel.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Update Status success' }
        } else {
          data = { status: 'fail', message: 'Update Status fail' }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 13/05/2021 Apiwat Emem Add Start ***** //
  getOCRResultByFileId: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var errMsg = null
    var data = []
    var statusCode = 200
    try {
      var result = await fileModel.getOCRResultByFileId(file_id)
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 13/05/2021 Apiwat Emem Add End ***** //
  // ***** 19/05/2021 Apiwat Emem Add Start ***** //
  insertAttachFile: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      if (file_id !== null) {
        var attachFileUpload = await fileModel.uploadAttachFileToAzureStorageBlob(reqBody)
        if (!attachFileUpload) {
          data = { status: 'fail', message: 'Upload azure storage blob Fail' }
        } else {
          var attachFileCreate = await fileModel.insertAttachFile(reqBody.file_name, reqBody.file_size, reqBody.file_id, reqBody.original_name, reqBody.file_path, reqBody.full_path, reqBody.create_by)
          if (attachFileCreate !== null && attachFileCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Upload Success' }
          } else {
            data = { status: 'fail', message: 'Upload Fail' }
          }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  insertReceiptFile: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      if (file_id !== null) {
        var receiptFileUpload = await fileModel.uploadAttachFileToAzureStorageBlob(reqBody)
        if (!receiptFileUpload) {
          data = { status: 'fail', message: 'Upload azure storage blob Fail' }
        } else {
          var receiptFileCreate = await fileModel.insertReceiptFile(reqBody.file_name, reqBody.file_size, reqBody.file_id, reqBody.original_name, reqBody.file_path, reqBody.full_path, reqBody.create_by)
          if (receiptFileCreate !== null && receiptFileCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Upload Success' }
          } else {
            data = { status: 'fail', message: 'Upload Fail' }
          }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  insertSupportingDocFile: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Upload Fail' }
      var statusCode = 200
      if (file_id !== null) {
        var supportingDocFileUpload = await fileModel.uploadAttachFileToAzureStorageBlob(reqBody)
        if (!supportingDocFileUpload) {
          data = { status: 'fail', message: 'Upload azure storage blob Fail' }
        } else {
          var supportingDocFileCreate = await fileModel.insertSupportingDocFile(reqBody.file_name, reqBody.file_size, reqBody.file_id, reqBody.original_name, reqBody.file_path, reqBody.full_path, reqBody.create_by)
          if (supportingDocFileCreate !== null && supportingDocFileCreate.rowsAffected.length > 0) {
            data = { status: 'success', message: 'Upload Success' }
          } else {
            data = { status: 'fail', message: 'Upload Fail' }
          }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  getAttachFileByFileId: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var errMsg = null
    try {
      var result = await fileModel.getAttachFileByFileId(file_id, 'N', 'asc')
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  getReceiptFileByFileId: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var errMsg = null
    try {
      var result = await fileModel.getReceiptFileByFileId(file_id, 'N', 'asc')
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  getSupportingDocFileByFileId: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var errMsg = null
    try {
      var result = await fileModel.getSupportingDocFileByFileId(file_id, 'N', 'asc')
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 19/05/2021 Apiwat Emem Add End ***** //
  // ***** 20/05/2021 Apiwat Emem Add Start ***** //
  getOCRFileExportExcelByFileId: async (req, res, next) => {
    var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
    var errMsg = null
    try {
      var result = await fileModel.getOCRFileExportExcelByFileId(file_id)
      var data = []
      var statusCode = 200
      if (result.recordsets[0].length > 0) {
        data = result.recordsets[0]
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 20/05/2021 Apiwat Emem Add End ***** //
  // ***** 24/05/2021 Apiwat Emem Add Start ***** //
  updateAttachFile: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Fail' }
      var statusCode = 200
      if (file_id !== null && reqBody.attachfile_id !== null) {
        var attachFileUpdate = await fileModel.updateAttachFile(reqBody.file_id, reqBody.attachfile_id, reqBody.is_delete, reqBody.update_by)
        if (attachFileUpdate !== null && attachFileUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Update Success' }
        }
        else {
          data = { status: 'fail', message: 'Update Fail' }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  updateReceiptFile: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Fail' }
      var statusCode = 200
      if (file_id !== null && reqBody.attachfile_id !== null) {
        var attachFileUpdate = await fileModel.updateReceiptFile(reqBody.file_id, reqBody.attachfile_id, reqBody.is_delete, reqBody.update_by)
        if (attachFileUpdate !== null && attachFileUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Update Success' }
        }
        else {
          data = { status: 'fail', message: 'Update Fail' }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  updateSupportingDocFile: async (req, res, next) => {
    var errMsg = null
    try {
      var file_id = (typeof req.params.file_id !== 'undefined' ? req.params.file_id : null)
      var reqBody = req.body
      var data = { status: 'fail', message: 'Update Fail' }
      var statusCode = 200
      if (file_id !== null && reqBody.attachfile_id !== null) {
        var attachFileUpdate = await fileModel.updateSupportingDocFile(reqBody.file_id, reqBody.attachfile_id, reqBody.is_delete, reqBody.update_by)
        if (attachFileUpdate !== null && attachFileUpdate.rowsAffected.length > 0) {
          data = { status: 'success', message: 'Update Success' }
        }
        else {
          data = { status: 'fail', message: 'Update Fail' }
        }
      }
    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
    res.statusCode = statusCode
    res.data = data
    next()
  },
  // ***** 24/05/2021 Apiwat Emem Add End ***** //
  // ***** 24/06/2021 Apiwat Emem Add Start ***** //
  sendToAllpay: async (req, res, next) => {
    var errMsg = null
    try {
      var reqBody = req.body
      var fileIdList = reqBody.fileIdList
      var fieldsList = reqBody.fieldsList
      var data = { status: 'fail', message: 'Send to Allpay Fail' }
      var statusCode = 200

      var ocr_status = 'SA';
      var fileUpdate = await fileModel.updateOCRStatusOCRFile(fileIdList, ocr_status, reqBody.allpay_by);
      if (fileUpdate !== null && fileUpdate.rowsAffected.length > 0) {
        data = { status: 'success', message: 'Send to Allpay Success' };
        sendToRabbitMQ(fileIdList, fieldsList, reqBody.allpay_by);
      }
      else {
        data = { status: 'fail', message: 'Send to Allpay Fail' };
      }
      res.statusCode = statusCode
      res.data = data
      next()

    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      logger.error(error);
      next(errMsg)
    }
  },
  // ***** 24/05/2021 Apiwat Emem Add End ***** //
  validateDateFormatOcr: async (req, res, next) => {
    var errMsg = null
    try {
      var dateStringList = (typeof req.body.date_string_list !== 'undefined' ? req.body.date_string_list : [])
      var data = { status: 'fail', message: 'Validate fail' }
      var statusCode = 200
      var result = await fileModel.validateDateFormatOcr(dateStringList);
      if (result !== null) {
        data = { status: 'success', message: 'Validate Success', result: result };
      }
      else {
        data = { status: 'fail', message: 'Validate fail' };
      }
      res.statusCode = statusCode
      res.data = data
      next()

    } catch (error) {
      errMsg = {
        status: 400,
        message: 'something wrong'
      }
      console.log(error)
      next(errMsg)
    }
  },
}
