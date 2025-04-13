const { JsonDatabase } = require("wio.db");

const config = new JsonDatabase({databasePath:"./config.json"});
const dbconfig = new JsonDatabase({ databasePath: './DatabaseJson/dbconfig.json' })


module.exports.config = config;
module.exports.dbconfig = dbconfig