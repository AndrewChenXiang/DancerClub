var Messgae=require('../models').Message;

exports.getMessagesCount = function (id, callback) {
    Message.count({master_id: id, has_read: false}, callback);
};