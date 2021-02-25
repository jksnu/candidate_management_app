const database = require("../models");
const { Op } = require("sequelize");

class candidateservice {
    static async getRecords(name, email_id, phone_number) {
        try {            
            return await database.candidate_summary.findAll({
                where: {
                    [Op.or]: [
                        { name: name },
                        { email_id: email_id },
                        { phone_number: phone_number }
                    ]
                }
            });
        } catch (err) {
            throw err;
        }
    }

    static async insertData(data) {
        try {            
            return await database.candidate_summary.create({
                name: data.name,
                email_id: data.email_id,
                phone_number: data.phone_number,
                candidates_data: data.candidates_data,
                created_by: data.created_by
            });
        } catch (err) {
            throw err;
        }
    }
}
module.exports = candidateservice