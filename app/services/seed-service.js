
let db   = require('../model/model-settings.js');


module.exports = {

    seedingMessages: seedingMessages,
    seedingLogs: seedingLogs

};



let advertise = [

    {
        message: "1 advertising message"
    },
    {
        message: "2 advertising message"
    },
    {
        message: "3 advertising message"
    },
    {
        message: "4 advertising message",
    }

];





// function generateNMessages(numberOfMessages) {
//     let arrOfMessages = [];
//
//     for(let i = 1; i < numberOfMessages+1; i++){
//         arrOfMessages.push({
//             message: i + " advertising message"
//         })
//     }
//
//     return arrOfMessages
// }
//
// let advertise = generateNMessages(50);




//
// let logs = [
//     {
//         userID: "1",
//         MessageID: "5a5e2cef064d5e11706e1f8a",
//         browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
//         IP: "::1",
//         country: "country",
//         date: "2018-01-18T15:29:11.915Z"
//
//     },
//     {
//         userID: "3",
//         MessageID: "5a5e2cef064d5e11706e1f8c",
//         browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
//         IP: "::1",
//         country: "country",
//         date: "2018-01-18T15:29:18.975Z"
//
//     },
//     {
//         userID: "3",
//         MessageID: "5a5e2cef064d5e11706e1f8d",
//         browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
//         IP: "::1",
//         country: "country",
//         date: "2018-01-18T15:29:26.619Z"
//
//     }
// ];

function generateLogsForMessage(numberOfLogs, MessageID) {

    let arrOfLogs = [];

    for(let i = 0; i < numberOfLogs; i++){
        arrOfLogs.push(
        {
            userID: "2",
            MessageID: MessageID,
            browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
            IP: "::1",
            country: "country",
            date: "2018-01-18T15:29:26.619Z"

        })
    }

    return arrOfLogs
}


function seedingLogs() {

    let numberOfLogs = 1000;
    db.log.remove({})
        .then( () => {
          return  db.advertisingMessage.find({})
        })
        .then( resp =>{


            let logs = [];


            for(let i = 0; i < resp.length; i++){

             let logsForMessage = generateLogsForMessage(numberOfLogs, resp[i]._id);

                logs = [...logs,...logsForMessage]
            }


            for (let i = 0; i < logs.length; i++) {

                let newAdvertising = new db.log(logs[i]);

                newAdvertising.save(function (err) {
                    if (err) return console.error(err);
                });
            }


        });


}


// let logs = generateNLogs(1000);

//
// function seedingLogs() {
//
//     // db.log.remove({}).then(
//     //     ()=>{
//     //         for(let i=0; i < logs.length; i++){
//     //             let newAdvertising = new db.log(logs[i]);
//     //
//     //             newAdvertising.save(function (err) {
//     //                 if (err) return console.error(err);
//     //             });
//     //         }
//     //
//     //     }
//     // );
//
// }




function seedingMessages() {

    db.advertisingMessage.remove({}).then(
        ()=>{
            for(let i=0; i < advertise.length; i++){
                let newAdvertising = new db.advertisingMessage(advertise[i]);

                newAdvertising.save(function (err) {
                    if (err) return console.error(err);
                });
            }

        }
    );


}

