
let db   = require('../model/model-settings.js');


module.exports = {

    addNoMessageToShow: addNoMessageToShow,
    getNoMessageToShow: getNoMessageToShow

};



function addNoMessageToShow() {


    let newWarningMessage = new db.noMessageWarning({
        message: "no message to show",
    });

    return newWarningMessage.save(function (err) {
        if (err) return console.error(err);
    });


}



function getNoMessageToShow() {
    return db.noMessageWarning.find({})
}

