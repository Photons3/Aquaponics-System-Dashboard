const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//SENSOR VALUES SCHEMA
const ValuesSchema = new Schema({
    deviceId:{ type: String, required: true},
    date:{type: Number, required: true},
    temperature: {type: Number, required: true},
    pHLevel: {type: Number, required: true},
    DOLevel: {type: Number, required: true}
});

module.exports = mongoose.model('values', ValuesSchema);