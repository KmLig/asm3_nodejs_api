const express = require('express');


const chatRoomController = require('../controllers/chatRoom');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/getById', isAuth, chatRoomController.getMessageByRoomId);

router.get('/getRoomIdByUserId', isAuth, chatRoomController.getRoomIdByUserId);

router.post('/createNewRoom', isAuth, chatRoomController.createNewRoom);

router.put('/addMessage', isAuth, chatRoomController.addMessage);

router.get('/getAllRoom', isAuth, chatRoomController.getAllRoom);

module.exports = router;