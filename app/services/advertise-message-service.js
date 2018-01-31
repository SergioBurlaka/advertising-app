
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


function nTimesPerMinutesFilter(logsAboutThisMessage, showTimes, period) {

    let  now = new Date();
    let beginOfTenMinutes = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        (Math.floor(now.getMinutes()/10)*10)
    );


    let counter = 0;

    for (let i = 0; i < logsAboutThisMessage.length; i++) {

        if(Date.parse(logsAboutThisMessage[i].date) > beginOfTenMinutes ){
            counter++;
        }

        if(counter === showTimes){
            return false
        }

    }

    if (counter === showTimes - 1) {

        let futureDate = new Date(Date.parse(new Date()) + period*60*1000);
        let messageId = logsAboutThisMessage[0].MessageID;
        let userId = logsAboutThisMessage[0].userID;
        addWillShowMessage(messageId, futureDate, userId)
            .then(() => false);
    }

    if(counter < showTimes){
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


function filterByCountry(countryOfFilter,countryOfUser) {
    return countryOfFilter === countryOfUser
}

function nTimesAtPeriodFilter(allLogsForThisUser, newAdvertise, showTimes, period) {


    let logsAboutThisMessage = allLogsForThisUser.filter(
        log => String(log.MessageID) === String(newAdvertise._id)
    );


    if (logsAboutThisMessage.length === 0) {
        return true
    }

    return nTimesPerMinutesFilter(logsAboutThisMessage, showTimes, period);
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


function filterWorkOnPeriodOfTime( startTime, endTime, timeOfUser) {
    let beginOfInterval =  new Date(Date.parse(startTime+''));
    let endOfInterval =  new Date(Date.parse(endTime+''));
    let userTime =  new Date (Date.parse(timeOfUser+''));


    return (beginOfInterval < userTime) && (userTime < endOfInterval);

}




function iterateFilters(currentAdvertise, messagesWillShow, allMessages, allLogsForThisUser, req) {
    // console.log('iterateFilters');
    // console.log(currentAdvertise.message);


    // console.log(currentAdvertise.filters[0].filterName);

    let countryOfUser = req.country;
    let localTime = req.localTime;

    for (let i = 0; i < currentAdvertise.filters.length; i++) {
        // console.log('i ' + i);

        switch (currentAdvertise.filters[i].filterName) {
            case 'noFilter':
                // console.log('noFilter');
                return false;

            case 'showByCountry':
                // console.log('showByCountry ');

                let countryOfFilter = currentAdvertise.filters[i].settings.country;
                let filterByCountryValue = filterByCountry(countryOfFilter,countryOfUser);

                if(filterByCountryValue){
                    // console.log('true');
                    break
                }

                return false;

            case 'showAtPeriod':
                // console.log('showAtPeriod');

                let startTime = currentAdvertise.filters[i].settings.startTime;
                let endTime = currentAdvertise.filters[i].settings.endTime;

                 let filterByTimeInterval = filterWorkOnPeriodOfTime(startTime, endTime, localTime);

                if(filterByTimeInterval){
                    break
                }
                return false;


            case 'showNTimesAtPeriod':

                // console.log('showNTimesAtPeriod ');

                if (messagesWillShow.length >= allMessages.length) {
                    return false;
                }


                let showTimes = currentAdvertise.filters[i].settings.showTimes;
                let period = currentAdvertise.filters[i].settings.period;

                let filterByPeriod = nTimesAtPeriodFilter(allLogsForThisUser, currentAdvertise, showTimes, period);

                // console.log('showTimes ' + showTimes);
                // console.log('period ' + period);


                if(filterByPeriod){
                    break
                }

                return false;

        }
    }

    return true
}





function getRandomAdvertise(req) {


    // console.log( req.geoip.attributes.country );

    // console.log('req.country ' + req.country);
    // console.log('req.localTime ' + req.localTime);

    // let country =  req.geoip.attributes.country ||'country';
    // if(!!req.location){
    //     country = req.location.name;
    // }



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

            let countOfIteratedMessages = initIteratedArr(allMessages);

            let newAdvertise;

            while (generateMassage){


                 newAdvertise = generateRandomMessage(allMessages);

                increaseCountForIteratedMessage(countOfIteratedMessages, newAdvertise);
                let wasAllMessagesShown = wereTheMessagesAllShown(countOfIteratedMessages);





                // let filterByCountryValue = filterByCountry(country);

                // if (messagesWillShow.length >= allMessages.length) {
                //     return warningMessageService.getNoMessageToShow()
                //         .then(result => result[0])
                // }

                //  let filterByPeriod = TwoTimesFilter(allLogsForThisUser, newAdvertise);

                //  let filterByTimeInterval = filterWorkOnPeriodOfTime( startTime, endTime, localTime);





                let returnCurrentAdvertise = iterateFilters(newAdvertise,
                    messagesWillShow, allMessages, allLogsForThisUser,req);

                if (returnCurrentAdvertise) {
                    return newAdvertise
                }

                if(wasAllMessagesShown){
                    return {
                        message: " All messages was shown "
                    }
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

