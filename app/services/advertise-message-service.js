
let db   = require('../model/model-settings.js');
const logService = require('../services/log-service.js');
const warningMessageService = require('../services/message-warning-service.js');

// addNoMessageToShow: addNoMessageToShow,
// getNoMessageToShow: getNoMessageToShow



module.exports = {

    getAllAdvertise: getAllAdvertise,
    getRandomAdvertise: getRandomAdvertise,
    deleteMessageById: deleteMessageById,
    getWillShowMessage: getWillShowMessage,
    deleteWillShowMessage: deleteWillShowMessage

};




function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
}




function generateRandomMessage(arr) {
    let randomMessage = randomInteger(0, arr.length-1);
    return arr[randomMessage]
}


function findMaxDate(arr) {

    let maxItem =  Date.parse(arr[0].date) ;
    let maxIndex = 0;

    for(let i=0; i < arr.length; i++){

        let tempDateValue = Date.parse(arr[i].date);

        if(tempDateValue > maxItem ){
            maxItem = tempDateValue;
            maxIndex = i
        }
    }

    return maxItem
}



function twoTimesPerTenMinutesFilter(logsAboutThisMessage) {

    let  now = new Date();
    let beginOfTenMinutes = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        (Math.floor(now.getMinutes()/10)*10)
    );

    // let maxLogDate = findMaxDate(logsAboutThisMessage);

    let counter = 0;


    for (let i = 0; i < logsAboutThisMessage.length; i++) {

        if(Date.parse(logsAboutThisMessage[i].date) > beginOfTenMinutes ){
            counter++;
        }

        if(counter === 2){
            // addWillShowMessage (newAdvertise._id, new Date(), req.params.userId )
            //     .then(() =>  false);

            // new Date(Date.parse(now)+600000);

            return false

        }

    }





    if(counter === 1 ){


        let futureDate = new Date(Date.parse(new Date())+600000);
        let messageId = logsAboutThisMessage[0].MessageID;
        let userId = logsAboutThisMessage[0].userID;

            addWillShowMessage (messageId, futureDate, userId)
            .then(() =>  false);

    }

    if(counter < 2){
        return true
    }


}



function addWillShowMessage (MessageID, date, userID) {


    let newWillShowMessage = new db.willShowMessages({
        MesId: MessageID,
        date: date,
        useId: userID
    });

    return newWillShowMessage.save(function (err) {
        if (err) return console.error(err);
    });

}


function deleteWillShowMessage() {
    return db.willShowMessages.remove({})

}



function getWillShowMessage() {
    return db.willShowMessages.find({})

}


function subtractArrSecondFromFirst(firstArr, secondArr) {

    let majorArr = firstArr.slice();

    for(let i = 0; i < secondArr.length; i++){
        majorArr = majorArr.filter( item => ''+item._id !==  secondArr[i].MesId );
    }

    return majorArr
}




function getIdArrayOfMessages(arrOfMessages) {
    let idArray = [];

    for(let i=0; i < arrOfMessages.length; i++){
        idArray.push(arrOfMessages[i]._id)
    }
    return idArray
}

function getIdArrayOfAnything(arrOfMessages, field) {
    let idArray = [];

    for(let i=0; i < arrOfMessages.length; i++){
        idArray.push(arrOfMessages[i][field])
    }
    return idArray
}




function getRandomAdvertise(req) {

    return Promise.all([
        db.willShowMessages.find({
            $and: [
                {date: {$gt: new Date()}},
                {useId: req.params.userId}
            ]
        }),
        db.advertisingMessage.find({})

    ]).then(result => {

            let messagesWillShow = result[0];
            let allMessages = result[1];


            if (messagesWillShow.length === 0) {
                console.log(' messagesWillShow.length === 0');

                return Promise.all([
                    db.advertisingMessage.find({}),
                    logService.getLogsWithField({})
                ])
            }



            if (messagesWillShow.length >= allMessages.length) {
                console.log(' messagesWillShow.length >= allMessages.length');
                return Promise.all([
                    warningMessageService.getNoMessageToShow()
                ])
            }



            let messagesToShow =  subtractArrSecondFromFirst(allMessages, messagesWillShow);
            let messagesId = getIdArrayOfMessages(messagesToShow);


            console.log('third way ');
            console.log('messagesId ');
            console.log(messagesId);

            // return Promise.all([
            //     db.advertisingMessage.find({_id: { $all:  messagesId }}),
            //     logService.getLogsWithField({MessageID: { $all:  messagesId } })
            // ])



            return Promise.all([
                db.advertisingMessage.find({}),
                logService.getLogsWithField({MessageID: { $all:  messagesId } })
            ])

        // logService.getLogsWithField({})



        }
    ).then(
            result =>{

                let allMessages = result[0];
                let allLogsForThisUser = result[1];


                if(allMessages[0].message === 'no message to show' ){
                    return allMessages[0]
                }

                console.log('allMessages length '+ allMessages.length);
                console.log('allMessages '+ getIdArrayOfAnything(allMessages, "_id"));

                console.log('allLogsForThisUser length '+ allLogsForThisUser.length);
                console.log('allMessages '+ getIdArrayOfAnything(allLogsForThisUser, "MessageID"));



                let generateMassage = true;
                let newAdvertise;

                while (generateMassage){

                    newAdvertise = generateRandomMessage(allMessages);


                         let logsAboutThisMessage = allLogsForThisUser.filter(
                             log => log.MessageID === newAdvertise._id+''
                         );



                         if(logsAboutThisMessage.length === 0){
                             return newAdvertise
                         }

                    let stopGenerator = twoTimesPerTenMinutesFilter(logsAboutThisMessage);


                    if(stopGenerator){
                        return newAdvertise
                    }


                }

            }

    )



}






function getAllAdvertise() {
    return db.advertisingMessage.find({})

}



function addMessageToDataBase(newMessage) {


let newAdvertising = new db.advertisingMessage({message: newMessage});

    newAdvertising.save(function (err) {
        if (err) return console.error(err);
    });


}


function deleteMessageById(messageId) {
    return db.advertisingMessage.findByIdAndRemove({_id: messageId})

}

