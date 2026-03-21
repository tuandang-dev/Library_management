const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Admin = new Schema({
    loginname: String,
    password: String,

});

module.exports = mongoose.model('Admin', Admin);
