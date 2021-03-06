const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superAdminSchema = new Schema({
    user_id:{type:String,required:true},
    pswd:{type:String,required:true},
    name:{type:String},
    contact:{type:String},
    email_id:{type:String},
},{
    timestamps:true
});


const SuperAdmin = mongoose.model('superadmins',superAdminSchema);

module.exports = SuperAdmin;
