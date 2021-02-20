const xlsxFile = require('read-excel-file/node');
const emailValidator = require('deep-email-validator');

class mycontroller {    
    healthCheck(req, res, next) {
        res.send("HealthCheck - Its Up");
    }

    insertData(pool, data) {
        try {
            return pool.query('INSERT INTO talent_acquisition.candidate_summary (name, email_id, phone_number, candidates_data, created_by) VALUES ($1, $2, $3, $4, $5)', [data.name, data.email_id, data.phone_number, data.candidates_data, data.created_by]);
        } catch (err) {
            throw err;
        }
    }

    getRecords(pool, name, email_id, phone_number) {
        try {
            return pool.query('SELECT * FROM talent_acquisition.candidate_summary where name=$1 or email_id=$2 or phone_number=$3', [name, email_id, phone_number]);
        } catch (err) {
            throw err;
        }
    }

    uploadData(res)  {
        try {
            return xlsxFile('./mydata/candidate-upload-template.xlsx');
        } catch (err) {
            throw err;
        }        
    }

    getRowsList(rows) {
        let dataObj = [];
        if(rows && rows.length > 0) {
            for(let i in rows){
                if(i > 0){
                    dataObj.push(this.createRowobj(rows[i]));
                }                    
            }
        }
        return dataObj;
    }

    createRowobj(row) {
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
                    rowObj["phone_number"] = row[j];
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

    isEmailValid(email) {
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

    validateDatatype(data) {
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

}

module.exports = new mycontroller;