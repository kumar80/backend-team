const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const clubListSchema = new Schema({
    club_name: {type:String,required:true},
    club_head: {type:String,required:true},
    event_list: [
        {
            date : {type:Date,required:true},
            venue : {type:String},
            embed_link : {type:String},
            poster_url : {type:String},
            descr : {type:String},
            name : {type:String},
            participants : []
        }
    ]
},{
    timestamps:true
});

const club_List = mongoose.model('Club_List',userSchema);

module.exports = club_List;
