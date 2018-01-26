
const controller = require('./app/controller/controller-index.js');


const express = require('express');
const app = express();

const bodyParser = require('body-parser');

let port = process.env.PORT || 3010;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));



// app.use(express.static(__dirname + '/app'));
// app.set('view engine', 'html');



app.get('/api/messages/users/:userId', controller.index);
app.get('/api/logs', controller.logs);
app.delete('/api/logs',controller.deleteAllLogs);
app.get('/api/messages',controller.getAllMessages);
app.delete('/api/messages/:messageId',controller.deleteMessageByID);

app.delete('/api/logs/messages/:messageId',controller.deleteLogsWithMessageID);
app.get('/api/logs/messages/:messageId',controller.getLogsWithMessageID);

app.get('/api/willShowMessages', controller.willShowMessage);
app.delete('/api/willShowMessages',controller.deleteWillShowMessage);


//    addNoMessageToShow: addNoMessageToShow,
//    getNoMessageToShow: getNoMessageToShow

app.put('/api/addNoMessageToShow',controller.addNoMessageToShow);
app.get('/api/getNoMessageToShow',controller.getNoMessageToShow);



app.put('/api/massages',controller.seedMessages);
app.put('/api/logs',controller.seedLogs);




app.listen(port, function () {
    console.log('advertising-app running')
});


