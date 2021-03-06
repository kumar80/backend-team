const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Users = require('./Users');

const eventSchema = new Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    venue:{type:String},
    date : {type: Date,required : true},
    description:{type: String,required: true},
    poster_url:{type: String,required: true},
    owner:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    participants : [String],
    categories : {type:String,required:true},       // workshop, competiotion, talk-show
    speaker : {type:String},
    event_summary : {
        gallery : [String],                           // will contain url of the uploaded images in simple array
        chief_guest : {type:String},
        award_winners : {type:String},
        summary : {type:String},
        outside_links : [String],
        file_attachment : [String],
        video_links : {type:String}
    },
    showcase_url : [String]
},{
    timestamps: true
})

eventSchema.methods.filterByMonth = function(month) {
    const event = this
    const mon_of_event = this.date.getMonth()+1

    if(month===mon_of_event){
        return true
    }

    return false
}


const Event = mongoose.model('event',eventSchema,'events');

module.exports = Event
