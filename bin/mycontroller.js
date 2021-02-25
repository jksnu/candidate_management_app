const xlsxFile = require('read-excel-file/node');
const emailValidator = require('deep-email-validator');
const candidateService = require("./candidateservice");
const Util = require("./util");
const util = new Util();
   
async function healthCheck(req, res, next) {
    try {
        util.setSuccess(200, 'HealthCheck - Its Up', "");
        return util.send(res);           
    } catch (err) {
        util.setError(500, error);
        return util.send(res);
    }        
}

function uploadData(res)  {
    try {
        return xlsxFile('./mydata/candidate-upload-template.xlsx');
    } catch (err) {
        throw err;
    }        
}

function getRowsList(rows) {
    let dataObj = [];
    if(rows && rows.length > 0) {
        for(let i in rows){
            if(i > 0){
                dataObj.push(createRowobj(rows[i]));
            }                    
        }
    }
    return dataObj;
}

function createRowobj(row) {
    let rowObj = {
        "candidates_data": {
            "ctc": {},
            "company": {},
            "location": {}
        }
    };        
    if(row) {
        let index;
        for(let j in row) {
            index = parseInt(j);
            if(index === 0)
                rowObj["name"] = row[j];
            else if(index === 7)
                rowObj["email_id"] = row[j];
            else if(index === 8)
                rowObj["phone_number"] = row[j].toString();
            else if(index === 5)
                rowObj["candidates_data"]["ctc"]["value"] = row[j];
            else if(index === 6)
                rowObj["candidates_data"]["ctc"]["ctcUnit"] = row[j];
            else if(index === 4)
                rowObj["candidates_data"]["ctc"]["ctcCurrency"] = row[j];
            else if(index === 3)
                rowObj["candidates_data"]["candidateExperience"] = row[j];
            else if(index === 2)
                rowObj["candidates_data"]["company"]["name"] = row[j];
            else if(index === 10)
                rowObj["candidates_data"]["location"]["city"] = row[j];
            else if(index === 9)
                rowObj["candidates_data"]["linkedIn"] = row[j];
        }
        rowObj["created_by"] = "Jitendra";
        rowObj["modified_by"] = "Jitendra";
    }
    return rowObj;
}

function isEmailValid(email) {
    return emailValidator.validate({
        email: email,
        sender: email,
        validateRegex: true,
        validateMx: true,
        validateTypo: false,
        validateDisposable: false,
        validateSMTP: false,
    });
}

function validateDatatype(data) {
    let curList = ["INR", "USD", "EUR"];
    let inrUnits = ["LAKHS","CRORES"];
    let usdUnits = ["THOUSANDS", "MILLIONS"];

    let isValid = true;
    if(data.name == null || data.name == undefined) {
        isValid = false;
    } else if(data.email_id == null || data.email_id == undefined) {
        isValid = false;
    } else if(data.phone_number == null || data.phone_number == undefined) {
        isValid = false;
    } else if(data.created_by == null || data.created_by == undefined) {
        isValid = false;
    } else if(isNaN(data.candidates_data.ctc.value) || isNaN(data.candidates_data.candidateExperience)) {
        isValid = false;
    } else if(!curList.includes(data.candidates_data.ctc.ctcCurrency)) {
        isValid = false;
    } else if((data.candidates_data.ctc.ctcCurrency == 'INR' && !inrUnits.includes(data.candidates_data.ctc.ctcUnit))) {
        isValid = false;
    } else if(((data.candidates_data.ctc.ctcCurrency == 'USD' || data.candidates_data.ctc.ctcCurrency == 'EUR') && !usdUnits.includes(data.candidates_data.ctc.ctcUnit))) {
        isValid = false;
    }
    return isValid;
}

async function addCandidate(req, res, next) {
    try {
        if (req.file == undefined) {
            util.setError(400, "Please upload the required candidate excel file!");
        } 
        var rows = await uploadData();
        var rowList = getRowsList(rows);
        var duplicateData = [];
        var invalidData = [];
        var insertedData = [];
        for(let i=0; i<rowList.length; i++){
            const {valid, reason, validators} = await isEmailValid(rowList[i].email_id);
            if(!valid) {
            invalidData.push(rowList[i]);
            } else {
            let isValid = await validateDatatype(rowList[i]);
            if(!isValid){
                invalidData.push(rowList[i]);
            } else {
                let dbData = await candidateService.getRecords(rowList[i].name, rowList[i].email_id, rowList[i].phone_number);
                if(dbData && dbData.length > 0) {
                duplicateData.push(rowList[i]);
                } else {
                let insertedResult = await candidateService.insertData(rowList[i]);
                insertedData.push(rowList[i]);
                }
            }      
            }
        }
    
        var responseData = {
            "invalidData": invalidData,
            "insertedData": insertedData,
            "duplicateData": duplicateData
        }
        util.setSuccess(200, 'Candidate list is uploaded successfully.', responseData);
        return util.send(res);
    } catch (error) {
        util.setError(500, error);
        return util.send(res);
    }
}

module.exports = { addCandidate, healthCheck };