var Sequelize = require("sequelize");
var configJson = require("../config/dbconfig");

const config = configJson;
const db = {};
let sequelize;
sequelize = new Sequelize(config.database, config.username, config.password, config);
db.candidate_summary = require("./candidate.model")(sequelize, Sequelize);
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
