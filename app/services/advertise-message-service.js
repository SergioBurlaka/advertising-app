
let db   = require('../model/model-settings.js');
const logService = require('../services/log-service.js');
const warningMessageService = require('../services/message-warning-service.js');
let mongoose = require('mongoose');


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
            return false
        }

    }

    if (counter === 1) {
        let futureDate = new Date(Date.parse(new Date()) + 600000);
        let messageId = logsAboutThisMessage[0].MessageID;
        let userId = logsAboutThisMessage[0].userID;
        addWillShowMessage(messageId, futureDate, userId)
            .then(() => false);
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
        majorArr = majorArr.filter( item => String(item._id) !==  String(secondArr[i].MesId) );
    }

    return majorArr
}




function getIdArrayOfMessages(arrOfMessages) {
    let idArray = [];

    for(let i=0; i < arrOfMessages.length; i++){
        idArray.push(mongoose.Types.ObjectId(arrOfMessages[i]._id))
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


function filterByCountry(userCountry) {

    return userCountry === 'Ukraine'
}

function TwoTimesFilter(allLogsForThisUser, newAdvertise) {


    let logsAboutThisMessage = allLogsForThisUser.filter(
        log => String(log.MessageID) === String(newAdvertise._id)
    );


    if (logsAboutThisMessage.length === 0) {
        return true
    }

    return twoTimesPerTenMinutesFilter(logsAboutThisMessage);
}


function initIteratedArr(arrOfAdvertise) {
    let advertiseThatWasIterated = [];
    for(let i=0; i < arrOfAdvertise.length; i++){
        advertiseThatWasIterated.push(
            {
                advertiseId: arrOfAdvertise[i]._id,
                count: 0
            }
        )
    }
    return advertiseThatWasIterated
}

function increaseCountForIteratedMessage(countOfIteratedMessages, currentMesage) {
    for(let i =0; i < countOfIteratedMessages.length; i++){
        if(countOfIteratedMessages[i].advertiseId+'' === currentMesage._id+'' ){
            countOfIteratedMessages[i].count++
        }
    }

}

function wereTheMessagesAllShown(countOfIteratedMessages) {
    for(let i=0; i < countOfIteratedMessages.length; i++){
        if(countOfIteratedMessages[i].count <= 0){
            return false
        }
    }
    return true
}



function getRandomAdvertise(req) {

    // console.log('req.geoip');
    // console.log(req.geoip);

  return Promise.all([
         db.advertisingMessage.find({}),
         db.log.find({}),
         db.willShowMessages.find({
                  $and: [
                      {date: {$gt: new Date()}},
                      {useId: req.params.userId}
                  ]
              })

     ]).then( result =>{
            let allMessages = result[0];
            let allLogsForThisUser = result[1];
            let messagesWillShow = result[2];


            let generateMassage = true;
            let newAdvertise;

            let countOfIteratedMessages = initIteratedArr(allMessages);



            while (generateMassage){



                newAdvertise = generateRandomMessage(allMessages);

                increaseCountForIteratedMessage(countOfIteratedMessages, newAdvertise);

                let wasAllMessagesShown = wereTheMessagesAllShown(countOfIteratedMessages);



                if(wasAllMessagesShown){

                    return {
                        message: " All messages was shown ",
                    }
                }


                let stopGenerator;


                // if( newAdvertise._id+'' === "5a689f4c3d5c952a28fd7e2b" ){
                //     stopGenerator = filterByCountry(req.geoip.attributes.country);
                // }else{
                //     return newAdvertise
                // }

                let filterByCountryValue = filterByCountry(req.geoip.attributes.country);

                if (messagesWillShow.length >= allMessages.length) {
                                return warningMessageService.getNoMessageToShow()
                                    .then(result => result[0])
                            }

                 let filterByPeriod = TwoTimesFilter(allLogsForThisUser, newAdvertise);

                console.log('filterByCountryValue '+filterByCountryValue);
                console.log('filterByPeriod '+filterByPeriod);

                if(filterByCountryValue && filterByPeriod){
                    return newAdvertise
                }


            }



        })




    // return Promise.all([
    //     db.willShowMessages.find({
    //         $and: [
    //             {date: {$gt: new Date()}},
    //             {useId: req.params.userId}
    //         ]
    //     }),
    //     db.advertisingMessage.find({})
    //
    // ]).then(result => {
    //
    //         let messagesWillShow = result[0];
    //         let allMessages = result[1];
    //
    //
    //         if (messagesWillShow.length === 0) {
    //             console.log(' messagesWillShow.length === 0');
    //
    //             return Promise.all([
    //                 db.advertisingMessage.find({}),
    //                 logService.getLogsWithField({})
    //             ])
    //         }
    //
    //
    //
    //         if (messagesWillShow.length >= allMessages.length) {
    //             console.log(' messagesWillShow.length >= allMessages.length');
    //             return Promise.all([
    //                 warningMessageService.getNoMessageToShow()
    //             ])
    //         }
    //
    //
    //         let messagesToShow =  subtractArrSecondFromFirst(allMessages, messagesWillShow);
    //         let messagesId = getIdArrayOfMessages(messagesToShow);
    //
    //
    //         console.log('third way ');
    //         console.log('messagesId ');
    //         console.log(messagesId);
    //
    //     // db.advertisingMessage.find({ _id:{ $in:  messagesId }}),
    //         return Promise.all([
    //             messagesToShow,
    //             db.log.find({MessageID:{ $in:  messagesId } }),
    //         ])
    //     }
    // ).then(
    //         result =>{
    //
    //             let allMessages = result[0];
    //             let allLogsForThisUser = result[1];
    //             // let allMessagesFromObject  = result[2];
    //
    //
    //
    //             if(allMessages[0].message === 'no message to show' ){
    //                 return allMessages[0]
    //             }
    //
    //             // console.log('allMessagesFromObject  '+ allMessagesFromObject);
    //
    //             // console.log('allMessages length '+ allMessages.length);
    //             // console.log('allMessages '+ getIdArrayOfAnything(allMessages, "_id"));
    //             //
    //             // console.log('allLogsForThisUser length '+ allLogsForThisUser.length);
    //             // console.log('allLogsForThisUser '+ getIdArrayOfAnything(allLogsForThisUser, "MessageID"));
    //
    //
    //
    //             let generateMassage = true;
    //             let newAdvertise;
    //
    //             while (generateMassage){
    //
    //                 newAdvertise = generateRandomMessage(allMessages);
    //
    //
    //                 let logsAboutThisMessage = allLogsForThisUser.filter(
    //                     log => String(log.MessageID) === String(newAdvertise._id)
    //                 );
    //
    //
    //                 if(logsAboutThisMessage.length === 0){
    //                     return newAdvertise
    //                 }
    //
    //                 let stopGenerator = twoTimesPerTenMinutesFilter(logsAboutThisMessage);
    //
    //
    //                 if(stopGenerator){
    //                     return newAdvertise
    //                 }
    //
    //
    //             }
    //
    //         }
    //
    // )
    //


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

