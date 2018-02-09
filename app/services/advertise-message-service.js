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

    return arrOfAdvertise.map(item => ({
            advertiseId: item._id,
            count: 0
    }));
}


function increaseCountForIteratedMessage(countOfIteratedMessages, currentMessage) {

   let item = countOfIteratedMessages.find(item =>
       currentMessage._id.equals(item.advertiseId))
   item.count++;
}


function wereTheMessagesAllShown(countOfIteratedMessages) {
    return countOfIteratedMessages.every(item => item.count > 0);
}


const filByCountry = {
    name: 'showByCountry',
    filterMethod(currentAdvertise, req, messagesWillShow, filterSettings) {

        let countryOfUser = req.country;
        let countryOfFilter = filterSettings.country;

        return countryOfFilter === countryOfUser
    }
};


const filShowNTimesAtPeriod = {
    name: 'showNTimesAtPeriod',
    filterMethod(currentAdvertise, req, messagesWillShow) {

        let isMessageInWillShowCollection = messagesWillShow
            .some(item => item.MesId.toString() === currentAdvertise._id.toString());

        return !isMessageInWillShowCollection
    }
};


const filShowAtPeriod = {
    name: 'showAtPeriod',
    filterMethod(currentAdvertise, req, messagesWillShow, filterSettings) {

        let beginOfInterval = new Date(filterSettings.startTime);
        let endOfInterval = new Date(filterSettings.endTime);
        let userTime = new Date(req.localTime);

        return beginOfInterval < userTime && userTime < endOfInterval
    }
};


function iterateFilters(currentAdvertise, messagesWillShow, req) {

    let filters = [filByCountry, filShowNTimesAtPeriod, filShowAtPeriod];

    const executorOfFilter = (strategy, currentAdvertise, req, messagesWillShow, ...args) => {
        return strategy(currentAdvertise, req, messagesWillShow, ...args)
    };


    for (let i = 0; i < currentAdvertise.filters.length; i++) {

        let currentFilter = currentAdvertise.filters[i];
        let filterFromCollection = filters.find(item => item.name === currentFilter.filterName);


        if (filterFromCollection) {

            let isAdvertiseFitToFilter = executorOfFilter(
                filterFromCollection.filterMethod,
                currentAdvertise,
                req,
                messagesWillShow,
                currentFilter.settings
            );

            if (!isAdvertiseFitToFilter) {
                return false
            }
        }
    }
    return true
}


function createWillShowMessage(newAdvertise, req) {

    let ONEMINUTE = 60 * 1000;

    let filtersOfMessage = newAdvertise.filters;
    let showNTimesAtPeriodFilter = filtersOfMessage
        .find(item => item.filterName === 'showNTimesAtPeriod');


    if (showNTimesAtPeriodFilter) {

        let userId = req.params.userId;
        let showTimes = showNTimesAtPeriodFilter.settings.showTimes;
        let period = showNTimesAtPeriodFilter.settings.period;

        db.log.find({
            MessageID: newAdvertise._id,
            date: {$gte: new Date(new Date() - period * ONEMINUTE)}
        }).then(result => {

            if (result.length === showTimes - 1) {

                let futureDate = new Date((new Date()).getTime() + period * ONEMINUTE);

                addWillShowMessage(newAdvertise, futureDate, userId)

            }
        });
    }
}


function getRandomAdvertise(req) {

    return Promise.all([
        db.advertisingMessage
            .find(),
        db.willShowMessages
            .find({
                $and: [
                    {date: {$gt: new Date()}},
                    {useId: req.params.userId}
                ]
            })

    ]).then(([allMessages, messagesWillShow]) => {


        let wasAllMessagesShown = false;
        let countOfIteratedMessages = initIteratedArr(allMessages);

        while (!wasAllMessagesShown) {

            let newAdvertise = generateRandomMessage(allMessages);
            let returnCurrentAdvertise = iterateFilters(newAdvertise, messagesWillShow, req);

            if (returnCurrentAdvertise) {
                createWillShowMessage(newAdvertise, req);
                return newAdvertise
            }

            increaseCountForIteratedMessage(countOfIteratedMessages, newAdvertise);
            wasAllMessagesShown = wereTheMessagesAllShown(countOfIteratedMessages);
        }

        return db.noMessageWarning
            .find({"_id": ObjectId("5a6afb9161cb6c1f103e7918")})
            .then(result => {
                return result[0]
            })
    });
}


function getAllAdvertise() {
    return db.advertisingMessage.find({})
}


function deleteMessageById(messageId) {
    return db.advertisingMessage.findByIdAndRemove({_id: messageId})
}

