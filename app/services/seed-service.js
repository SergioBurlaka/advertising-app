
let db   = require('../model/model-settings.js');


module.exports = {

    seedingMessages: seedingMessages,
    seedingLogs: seedingLogs

};


let showAtPeriod = {
    filterName: 'showAtPeriod',
    settings: {
        startTime: '2018-01-31T12:00:00+02:00',
        endTime: '2018-01-31T17:00:00+02:00'
    }
};

let showNTimesAtPeriod = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 3,
        period: 10
    }
};


let showByCountry =  {
    filterName: 'showByCountry',
    settings: {
        country: 'Ukraine'
    }
};




let noFilter =  {
    filterName: 'noFilter',
    settings: {}
};

// showByCountry, showNTimesAtPeriod  done

let template = [

    {
        message: "1 advertising message filters: [showAtPeriod, showByCountry ]",
        filters: [showAtPeriod, showByCountry ]
    },
    {
        message: "2 advertising message filters: [ showAtPeriod, showNTimesAtPeriod, showByCountry ]",
        filters: [ showAtPeriod, showNTimesAtPeriod, showByCountry ]
    },

    {
        message: "3 advertising message filters: [ showAtPeriod, showNTimesAtPeriod ]",
        filters: [ showAtPeriod, showNTimesAtPeriod ]
    },

    {
        message: "4 advertising message filters: [ showNTimesAtPeriod, showByCountry]",
        filters: [ showNTimesAtPeriod, showByCountry]
    },
    {
        message: "5 advertising message filters: []",
        filters: []
    }

];



function generateNMessages(arrOfTemplate, numberOfMessages) {
    let arrOfMessages = [];

    let count =0;
    for (let i = 0; i < arrOfTemplate.length; i++) {

        for (let j = 1; j <= numberOfMessages; j++) {
            arrOfMessages.push(arrOfTemplate[i]);
            count++;

        }
    }


    return arrOfMessages
}

let advertise = generateNMessages(template, 10);





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
            browser: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" +
            " AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/63.0.3239.132 Safari/537.36",
            IP: "37.57.18.160",
            country: "Ukraine",
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

           console.log(' logs.length '+ logs.length);

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

