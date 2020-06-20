const mongoose = require('mongoose');
const Event = require('./Event.model')
const Schema = mongoose.Schema;

const clubHeadSchema = new Schema({
    user_id:{type:String,required:true,trim:true},
    pswd:{type:String,required:true},
    name:{type:String},
    contact:{type:String},
    email_id:{type:String},
    dp_url:{type:String},
    club_head:{type:Boolean},
    club_name:{type:String},
    bio:{type:String}
},{
    timestamps:true
});

clubHeadSchema.virtual('events',{
    ref: 'Event',
    localField: '_id',
    foreignField: 'owner'
})

clubHeadSchema.virtual('clubs',{
    ref: 'Club',
    localField: '_id',
    foreignField: 'head'
})

const ClubHeads = mongoose.model('Users',clubHeadSchema);

module.exports = ClubHeads;
