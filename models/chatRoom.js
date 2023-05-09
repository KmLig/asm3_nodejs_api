const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
    messages: [
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            content: {
                type: String,
                required: true
            },
            is_admin: {
                type: Boolean,
                required: true
            }
        }
    ]
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);