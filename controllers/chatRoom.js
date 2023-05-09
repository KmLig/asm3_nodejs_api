const io = require('../socket');
const User = require('../models/user');
const ChatRoom = require('../models/chatRoom');

exports.getMessageByRoomId = async (req, res, next) => {
    // console.log(req.role == 'sales');
    // if (req.role !== 'sales' && req.role !== 'admin') {
    //     const error = new Error('Not athorised to use this chat app');
    //     error.statusCode = 401;
    //     throw error;
    // }
    try {
        const room = await ChatRoom.findById(req.query.roomId).populate('messages.userId');
        console.log('message by roomId', room);
        res.status(200).json({ type: 'get message by roomId', messages: room.messages ? room.messages : null });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getRoomIdByUserId = async (req, res, next) => {
    const user = await User.findById(req._id);
    console.log(user);
    res.status(200).json({ message: 'get room ID by user ID', _id: user.chatRoomId ? user.chatRoomId : null });
};
exports.createNewRoom = async (req, res, next) => {
    const room = new ChatRoom({
        messages: []
    });
    const result = await room.save();
    const user = await User.findById(req._id);
    console.log('chat room id', result._id);
    user.chatRoomId = result._id;
    const updatedUser = await user.save();
    res.status(200).json({
        message: 'create room',
        _id: result._id.toString()
    });
};

exports.addMessage = async (req, res, next) => {
    const { message, roomId, is_admin } = req.body;
    console.log('req body add message', req.body);
    const room = await ChatRoom.findById(roomId);
    console.log(room);
    room.messages.push({
        userId: req.userId,
        content: message,
        is_admin: is_admin
    });
    const result = await room.save();
    io.getIO().emit('receive_message', {
        action: 'create',
        messages: result.messages
    });
    res.status(201).json({ type: 'added message', messages: result.messages });
};

exports.getAllRoom = async (req, res, next) => {
    const rooms = await ChatRoom.find();
    res.status(200).json({ type: 'get all chat rooms', rooms: rooms });
};