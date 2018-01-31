
let db   = require('../model/model-settings.js');


module.exports = {
    addLog: addLog,
    deleteAllLogs: deleteAllLogs,
    getAllLogs: getAllLogs,
    getLogsWithField: getLogsWithField,
    deleteAllLogsWithMessageId: deleteAllLogsWithMessageId,
    getLogsWithMessageId: getLogsWithMessageId
};





function addLog(userID,MessageID, browser, IP, country, date) {

    let newLog = new db.log({
        userID: userID,
        MessageID: MessageID,
        browser: browser,
        IP: IP,
        country: country,
        date: date
    });

   return newLog.save(function (err) {
        if (err) return console.error(err);
    });


}



function getAllLogs() {
    return db.log.find({})

}

function getLogsWithField(fieldName, fieldValue) {
    return db.log.find({[fieldName]: fieldValue})

}



function deleteAllLogs() {
    return db.log.remove({})

}


function deleteAllLogsWithMessageId(MessageId) {
    console.log(" delete logs with message id " + MessageId);
    return db.log.remove({
        "MessageID": MessageId

    })


}

function getLogsWithMessageId(MessageId) {
    return db.log.find({
        MessageID: MessageId
    })

}
