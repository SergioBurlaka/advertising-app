let db = require('../model/model-settings.js');
const ObjectId = require('mongodb').ObjectID;


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
    let randomMessage = randomInteger(0, arr.length - 1);
    return arr[randomMessage]
}


function addWillShowMessage(MessageID, date, userID) {


    let newWillShowMessage = new db.willShowMessages({
        MesId: MessageID,
        date: date,
        useId: userID
    });

    newWillShowMessage.save();

}


function deleteWillShowMessage() {
    return db.willShowMessages.remove({})

}


function getWillShowMessage() {
    return db.willShowMessages.find({})

}


function initIteratedArr(arrOfAdvertise) {
    let advertiseThatWasIterated = [];
    for (let i = 0; i < arrOfAdvertise.length; i++) {
        advertiseThatWasIterated.push(
            {
                advertiseId: arrOfAdvertise[i]._id,
                count: 0
            }
        )
    }
    return advertiseThatWasIterated
}


function increaseCountForIteratedMessage(countOfIteratedMessages, currentMessage) {
    for (let i = 0; i < countOfIteratedMessages.length; i++) {
        if (countOfIteratedMessages[i].advertiseId + '' === currentMessage._id + '') {
            countOfIteratedMessages[i].count++
        }
    }

}


function wereTheMessagesAllShown(countOfIteratedMessages) {
    for (let i = 0; i < countOfIteratedMessages.length; i++) {
        if (countOfIteratedMessages[i].count <= 0) {
            return false
        }
    }
    return true
}


function filterByCountry(countryOfFilter, countryOfUser) {
    return countryOfFilter === countryOfUser
}


function filterWorkOnPeriodOfTime(startTime, endTime, timeOfUser) {

    let beginOfInterval = new Date(Date.parse(startTime + ''));
    let endOfInterval = new Date(Date.parse(endTime + ''));
    let userTime = new Date(Date.parse(timeOfUser + ''));

    return (beginOfInterval < userTime) && (userTime < endOfInterval);

}


function filterShowNTimesAtPeriod(messagesWillShow, currentMessageId) {
    return messagesWillShow.some(item => item.MesId + '' === currentMessageId + '');

}


const filByCountry = {
    name: 'showByCountry',
    filterMethod: function (currentAdvertise, req, messagesWillShow) {

        let countryOfUser = req.country;
        let countryOfFilter = currentAdvertise.filters.settings.country;

        return !(countryOfFilter === countryOfUser)


    }

};

const filShowNTimesAtPeriod = {
    name: 'showNTimesAtPeriod',
    filterMethod: function (currentAdvertise, req, messagesWillShow) {

        let currentMessageId = currentAdvertise._id;
        let isMessageInWillShowCollection =  messagesWillShow
            .some(item => item.MesId + '' === currentMessageId + '');

        return !isMessageInWillShowCollection

    }

};

const filShowAtPeriod = {
    name: 'showAtPeriod',
    filterMethod: function (currentAdvertise, req, messagesWillShow) {

        let localTime = req.localTime;
        let startTime = currentAdvertise.filters.settings.startTime;
        let endTime = currentAdvertise.filters.settings.endTime;

        let beginOfInterval = new Date(Date.parse(startTime + ''));
        let endOfInterval = new Date(Date.parse(endTime + ''));
        let userTime = new Date(Date.parse(localTime + ''));

        return !((beginOfInterval < userTime) && (userTime < endOfInterval))

    }
};




// console.log(filByCountry.filterByCountry());



function iterateFilters(currentAdvertise, messagesWillShow, allMessages, req) {

    let filters = [filByCountry, filShowNTimesAtPeriod, filShowAtPeriod];

    const executorOfFilter = (strategy, currentAdvertise, req, messagesWillShow, ...args ) =>{
        return strategy( currentAdvertise, req, messagesWillShow, ...args)
    };



    for (let i = 0; i < currentAdvertise.filters.length; i++) {

        let currentFilter = currentAdvertise.filters[i];

        for (let j = 0; j < filters.length; j++) {

            if(currentFilter.filterName === filters[j].name ){


                let isAdvertiseFitToFilter = executorOfFilter(
                    filters[j].filterMethod,
                    currentAdvertise,
                    req,
                    messagesWillShow
                );


                if(!isAdvertiseFitToFilter){
                    return false
                }


            }

        }

    }

    return true

}

//
// function iterateFilters(currentAdvertise, messagesWillShow, allMessages, req) {
//
//
//
//     let countryOfUser = req.country;
//     let localTime = req.localTime;
//
//     for (let i = 0; i < currentAdvertise.filters.length; i++) {
//
//
//
//         switch (currentAdvertise.filters[i].filterName) {
//
//             case 'showByCountry':
//
//                 let countryOfFilter = currentAdvertise.filters[i].settings.country;
//                 let filterByCountryValue = filterByCountry(countryOfFilter, countryOfUser);
//
//                 if (filterByCountryValue) {
//                     break
//                 }
//
//                 return false;
//
//             case 'showAtPeriod':
//
//                 let startTime = currentAdvertise.filters[i].settings.startTime;
//                 let endTime = currentAdvertise.filters[i].settings.endTime;
//
//                 let filterByTimeInterval = filterWorkOnPeriodOfTime(startTime, endTime, localTime);
//
//
//                 if (filterByTimeInterval) {
//                     break
//                 }
//
//                 return false;
//
//             case 'showNTimesAtPeriod':
//
//                 let currentMessageId = currentAdvertise._id;
//
//
//                 // if (messagesWillShow.length >= allMessages.length) {
//                 //     return false;
//                 // }
//
//                 let isMessageInWillShowCollection = filterShowNTimesAtPeriod(messagesWillShow, currentMessageId);
//
//                 if (isMessageInWillShowCollection) {
//                     return false;
//
//                 }
//
//                 break;
//
//             case 'noFilter':
//                 return false;
//
//         }
//     }
//
//     return true
// }
//



function createWillShowMessage(newAdvertise, req) {

    let filtersOfMessage = newAdvertise.filters;
    let isShowNTimesAtPeriod = filtersOfMessage.some(item => item.filterName === 'showNTimesAtPeriod');

    if (isShowNTimesAtPeriod) {

        let filter = filtersOfMessage.filter(item => item.filterName === 'showNTimesAtPeriod');


        let userId = req.params.userId;
        let showTimes = filter[0].settings.showTimes;
        let period = filter[0].settings.period;


        db.log.find({
            MessageID: newAdvertise._id,
            date: {$gte: new Date(new Date() - period * 60 * 1000)}
        }).then(result => {


            if (result.length === showTimes - 1) {

                let futureDate = new Date(Date.parse(new Date()) + period * 60 * 1000);

                addWillShowMessage(newAdvertise, futureDate, userId)
                  //  .then(() => newAdvertise);
            }


        });


    }
}


function getRandomAdvertise(req) {


    return Promise.all([
        db.advertisingMessage
            .find({}),
        db.willShowMessages
            .find({
                $and: [
                    {date: {$gt: new Date()}},
                    {useId: req.params.userId}
                ]
            })

    ]).then(result => {


        let allMessages = result[0];
        let messagesWillShow = result[1];


        let generateMassage = true;
        let countOfIteratedMessages = initIteratedArr(allMessages);


        while (generateMassage) {


            let newAdvertise = generateRandomMessage(allMessages);
            let returnCurrentAdvertise = iterateFilters(newAdvertise, messagesWillShow, allMessages, req);


            if (returnCurrentAdvertise) {

                createWillShowMessage(newAdvertise, req);
                return newAdvertise

            }


            increaseCountForIteratedMessage(countOfIteratedMessages, newAdvertise);
            let wasAllMessagesShown = wereTheMessagesAllShown(countOfIteratedMessages);


            if (wasAllMessagesShown) {
                return db.noMessageWarning
                    .find({"_id": ObjectId("5a6afb9161cb6c1f103e7918")})
                    .then(result => {
                        return result[0]

                    })
            }

        }


    });


}


function getAllAdvertise() {
    return db.advertisingMessage.find({})

}


function deleteMessageById(messageId) {
    return db.advertisingMessage.findByIdAndRemove({_id: messageId})

}

