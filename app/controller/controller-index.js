
const advertiseService = require('../services/advertise-message-service.js');
const logService = require('../services/log-service.js');
const seedService = require('../services/seed-service.js');
const warningMessageService = require('../services/message-warning-service.js');


module.exports = {
    index: index,
    deleteAllLogs: deleteAllLogs,
    getAllMessages: getAllMessages,
    deleteMessageByID: deleteMessageByID,
    logs: logs,
    seedMessages: seedMessages,
    seedLogs: seedLogs,
    deleteLogsWithMessageID: deleteLogsWithMessageID,
    getLogsWithMessageID: getLogsWithMessageID,
    willShowMessage: willShowMessage,
    deleteWillShowMessage: deleteWillShowMessage,
    addNoMessageToShow: addNoMessageToShow,
    getNoMessageToShow: getNoMessageToShow
};



 function index(req, res) {

     let userID = req.params.userId;
     let browser = req.headers['user-agent'];
     let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
     let date = new Date();
     let country = req.geoip.attributes.country ||'country';

     advertiseService.getRandomAdvertise(req)
         .then(resp => {
             res.send(resp.message);
             // console.log(' time for request ' );
             // console.log( new Date() - now);
             // console.log( resp.message);
             logService.addLog(userID,resp._id, browser, IP, country, date)
         })

}


function logs(req,res){

    logService.getAllLogs()
        .then(resp => res.send(resp));

}

function willShowMessage(req,res){

    advertiseService.getWillShowMessage()
        .then(response => res.send(response));

}


function deleteAllLogs(req,res){

    logService.deleteAllLogs()
        .then( () => logService.getAllLogs())
        .then(resp => res.send(resp))

}


function deleteMessageByID(req,res){

    advertiseService.deleteMessageById(req.params.messageId)
        .then(() => res.send('messages was deleted'))

}




function getAllMessages(req,res){

    advertiseService.getAllAdvertise()
         .then(resp => res.send(resp))

}


function seedMessages(req,res) {
    seedService.seedingMessages();
        res.send('Messages was seeded')
}


function seedLogs(req,res) {
    seedService.seedingLogs();
    res.send('logs was seeded')
}


function deleteLogsWithMessageID(req,res) {
    logService.deleteAllLogsWithMessageId(req.params.messageId)
        .then(() => {
            res.send('delete logs for messageID '+ req.params.messageId);
        });

}


function deleteWillShowMessage(req,res) {
    advertiseService.deleteWillShowMessage()
        .then(() => {
            res.send('WillShowMessage was deleted');
        });

}




function getLogsWithMessageID(req,res) {
    logService.getLogsWithMessageId(req.params.messageId)
        .then(resp => res.send(resp))
}



//    addNoMessageToShow: addNoMessageToShow,
//    getNoMessageToShow: getNoMessageToShow


function addNoMessageToShow(req,res) {
    warningMessageService.addNoMessageToShow()
        .then(() => res.send(' warning message was added '))
}


function getNoMessageToShow(req,res) {
    warningMessageService.getNoMessageToShow()
        .then((resp) => res.send(resp))
}


