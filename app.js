const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/order');
const chatRoomRoutes = require('./routes/chatRoom');

const MONGODB_URI =
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.gqkd11r.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();

const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});



app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

// app.set("trust proxy", 1);

const whitelist = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true
}));

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        // sameSite: "none",
        // secure: true,
        maxAge: 1000 * 60 * 60,
        // httpOnly: true,
    }
}));


// app.use(multer({ storage: fileStorage, fileFilter }).array('images', 4));



app.use('/products', shopRoutes);
app.use('/carts', cartRoutes);
app.use('/users', authRoutes);
app.use('/orders', orderRoutes);
app.use('/admins', adminRoutes);
app.use('/chatrooms', chatRoomRoutes);


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message: message,
        data: data
    });
});

mongoose.connect(MONGODB_URI)
    .then((result) => {
        const server = app.listen(process.env.PORT || 5000);
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            console.log('client connected!');
        });
    })
    .catch((err) => {
        console.log(err);
    });
