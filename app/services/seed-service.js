
let db   = require('../model/model-settings.js');


module.exports = {

    seedingMessages: seedingMessages,
    seedingLogs: seedingLogs

};




let showNTimesAtPeriod = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 2,
        period: 10
    }
};


let oneTimeAtFiveMinutes = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 1,
        period: 5
    }
};


let twoTimeAtSixMinutes = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 2,
        period: 6
    }
};


let threeTimeAtSevenMinutes = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 3,
        period: 7
    }
};

let fourTimeAtEightMinutes = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 4,
        period: 8
    }
};

let fiveTimeAtTenMinutes = {
    filterName: 'showNTimesAtPeriod',
    settings: {
        showTimes: 5,
        period: 10
    }
};





let showByCountry =  {
    filterName: 'showByCountry',
    settings: {
        country: 'Ukraine'
    }
};


let showAtPeriod = {
    filterName: 'showAtPeriod',
    settings: {
        startTime: '2018-02-05T09:15:31.822Z',
        endTime: '2018-02-07T09:15:31.822Z'
    }
};



let noFilter =  {
    filterName: 'noFilter',
    settings: {}
};

// showByCountry, showNTimesAtPeriod  done

let template = [

    {
        message: "1 advertising message filters: " +
        "[oneTimeAtFiveMinutes, showByCountry,showAtPeriod]",
        filters: [oneTimeAtFiveMinutes,showByCountry,showAtPeriod]
    },
    {
        message: "2 advertising message filters: " +
        "[oneTimeAtFiveMinutes, showByCountry,showAtPeriod]",
        filters: [twoTimeAtSixMinutes, showByCountry,showAtPeriod]
    },

    {
        message: "3 advertising message filters: " +
        "[threeTimeAtSevenMinutes, showByCountry,showAtPeriod]",
        filters: [threeTimeAtSevenMinutes, showByCountry,showAtPeriod]
    },

    {
        message: "4 advertising message filters: " +
        "[fourTimeAtEightMinutes, showByCountry,showAtPeriod]",
        filters: [fourTimeAtEightMinutes, showByCountry,showAtPeriod]
    },
    {
        message: "5 advertising message filters: " +
        "[fiveTimeAtTenMinutes, showAtPeriod]",
        filters: [fiveTimeAtTenMinutes,showAtPeriod]
    }

];


//
// let template = [
//
//     {
//         message: "1 advertising message filters: " +
//         "[oneTimeAtFiveMinutes, showByCountry,showAtPeriod]",
//         filters: [showNTimesAtPeriod]
//     },
//     {
//         message: "2 advertising message filters: " +
//         "[oneTimeAtFiveMinutes, showByCountry,showAtPeriod]",
//         filters: [showNTimesAtPeriod]
//     },
//
//     {
//         message: "3 advertising message filters: " +
//         "[threeTimeAtSevenMinutes, showByCountry,showAtPeriod]",
//         filters: [showNTimesAtPeriod]
//     },
//
//     {
//         message: "4 advertising message filters: " +
//         "[fourTimeAtEightMinutes, showByCountry,showAtPeriod]",
//         filters: [showNTimesAtPeriod]
//     },
//     {
//         message: "5 advertising message filters: " +
//         "[fiveTimeAtTenMinutes, showAtPeriod]",
//         filters: [showNTimesAtPeriod]
//     }
//
// ];


let advertise = [

    {
        message: "1 advertising message filters: [showNTimesAtPeriod ]",
        filters: [showNTimesAtPeriod ]
    },
    {
        message: "2 advertising message filters: [  showNTimesAtPeriod]",
        filters: [ showNTimesAtPeriod ]
    },

    {
        message: "3 advertising message filters: [ showNTimesAtPeriod ]",
        filters: [  showNTimesAtPeriod ]
    },

    {
        message: "4 advertising message filters: [ showNTimesAtPeriod]",
        filters: [ showNTimesAtPeriod]
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

    console.log('arrOfMessages.length '+arrOfMessages.length);

    return arrOfMessages
}

// let advertise = generateNMessages(template, 10);





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
