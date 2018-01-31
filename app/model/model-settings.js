let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/advertising');

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connect error'));
db.once('open', function () {
    console.log('we are connected')
});

// const filterSchema = mongoose.Schema(
// {
//     filterName: String,
//         settings: Object
// }
// );




let advertisingSchema = mongoose.Schema({
    message: String,
    filters: [ {
        filterName: String,
        settings: Object
    } ]
});





advertisingSchema.method('filter', function (greeting) {
    console.log('hi from filter' + greeting);
});


let advertisingMessage = mongoose.model('advertisingMessage', advertisingSchema);

let Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


let logSchema = mongoose.Schema({
    userID: String,
    MessageID: ObjectId,
    browser: String,
    IP: String,
    country: String,
    date: Date
});


let log = mongoose.model('log', logSchema);


let willShowMessagesSchema = mongoose.Schema({
    MesId:  ObjectId,
    date: Date,
    useId: String

});


let willShowMessages = mongoose.model('willShowMessages', willShowMessagesSchema);


// no messages to show

let noMessageWarningSchema = mongoose.Schema({
    message: String
});


let noMessageWarning = mongoose.model('noMessageWarning', noMessageWarningSchema);




module.exports = {
    advertisingMessage: advertisingMessage,
    willShowMessages: willShowMessages,
    noMessageWarning: noMessageWarning,
    log: log
};




