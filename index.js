const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/ecommerce');

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const authRoute = require('./routes/auth');
// const cookieSession = require('cookie-session');
const passportStrategy = require('./passport');
const session = require('express-session');
const flash = require('express-flash');
const config = require('./config/config');
const app = express();
const morgan = require('morgan');
const nocache = require('nocache');
const userRouter = require('./routes/userRouter');
const adminRouter = require('./routes/adminRouter');
const path = require('path');
const crypto = require('crypto');

function setDynamicViews(req, res, next) {
    if (req.path.startsWith('/admin')) {
        app.set('views', path.join(__dirname, 'views/admin'));
    } else {
        app.set('views', path.join(__dirname, 'views/user'));
    }
    next();
}

app.use(setDynamicViews);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true,
        // expires : new Date( Date.now() + 300000 )
    }
}));

// app.use(
//     cookieSession({
//         name:"session",
//         keys:["somesessionkey"],
//         maxAge:24 * 60 * 60 * 100,
//     })
// );

app.use(passport.initialize());
app.use(passport.session());

app.use(flash())
app.use("/auth,", authRoute);

app.use(nocache());
// app.use(morgan('dev'));
app.use('/', userRouter);

app.use('/admin', adminRouter);
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/productImages', express.static('public/productImages'));

app.get('*',(req,res)=>{
    res.render('../error');
})
// app.locals.formData = {};

app.listen(3000, () => {
    console.log('server is running...')
})
