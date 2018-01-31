
const controller = require('./app/controller/controller-index.js');
const where = require('node-where');
const request = require('request');



const express = require('express');
const app = express();

const bodyParser = require('body-parser');

let port = process.env.PORT || 3010;

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


// app.use (function (req, res, next) {
//     let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     where.is(IP, function (err, result) {
//         req.geoip = result;
//         next();
//     })
// });

// https://usercountry.com/v1.0/json/
// http://usercountry.com/v1.0/json/

const  apiToken = '10e2383b2a0f155c65dc606a76890a75eed88ecb06740bd7';

app.use(function (req, res, next) {
    let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    request('http://usercountry.com/v1.0/json/' + IP + '?token=<'+ apiToken + '>',
        (err, response, body) => {
            const result = JSON.parse(body);

            // req.location = result.country;
            // console.log('result');
            // console.log(result);

            if(result.status === 'success'){
                req.country = result.country.name;
                req.localTime = result.timezone.current_time;


            }
            // var d = new Date();
            //
            // alert( d.toISOString() )

             if(result.status === 'failure'){
                let dateByDefault = new Date();
                 req.country = 'country';
                 req.localTime = dateByDefault.toISOString();
            }

            // console.log('req.country ' + req.country);
            // console.log('req.localTime ' + req.localTime);


            next();
        });
});





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


