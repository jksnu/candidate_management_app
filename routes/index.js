var express = require('express');
const mycontroller = require('../bin/mycontroller');
const upload = require('../bin/upload');

//Postgress connection
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'admin',
  port: 5432,
});

var router = express.Router();

router.get('/', mycontroller.healthCheck);

/** update data from excelsheet */
router.post('/upload', upload.single("file"), async (req, res, next) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send("Please upload the required candidate excel file!");
    } 
    var rows = await mycontroller.uploadData();
    var rowList = mycontroller.getRowsList(rows);
    var duplicateData = [];
    var invalidData = [];
    var insertedData = [];
    for(let i=0; i<rowList.length; i++){
      const {valid, reason, validators} = await mycontroller.isEmailValid(rowList[i].email_id);
      if(!valid) {
        invalidData.push(rowList[i]);
      } else {
        let isValid = await mycontroller.validateDatatype(rowList[i]);
        if(!isValid){
          invalidData.push(rowList[i]);
        } else {
          let dbData = await mycontroller.getRecords(pool, rowList[i].name, rowList[i].email_id, rowList[i].phone_number);
          if(dbData && dbData.rows.length > 0) {
            duplicateData.push(rowList[i]);
          } else {
            let insertedResult = await mycontroller.insertData(pool, rowList[i]);
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
    //return res.status(200).send("file uploaded");
    return res.status(200).json(responseData);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
  
})

module.exports = router;
