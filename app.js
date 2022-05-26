const express = require('express');                   //express middleware
const path = require('path');                         //path navigation
const { engine } = require('express-handlebars');     //view engine

const appController = require("./controllers/appController"); //import routes
const isAuth = require("./app_modules/isAuth");               //express-session middleware

// CREATE AN EXPRESS APP AND RUN THE HTTP SERVER AND SOCKET-IO SERVER
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// CREATE AN EXPRESS SESSION DB FOR MONGODB
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

// STORES THE SESSION IN MONGODB
const store = new MongoDBStore({
  uri: "mongodb+srv://aquaponics:kkPtqtaAybCpbzk7@aquaponicssystem.nl36c.mongodb.net/?retryWrites=true&w=majority",
  collection: "userSessions",
});

//CREATE AN EXPRESS SESSION FOR PERSISTENT LOGIN
app.use(
  session({
    secret: "6QX#$Cu%W?2Ta%D4E4JqBC!j$%E&G8",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//Express-session middleware (required to parse the body)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/res'));

//Load socket-connection.js and pass the socket-io object
const socketConnection = require('./app_modules/socket-connection');
socketConnection.start(io);

// CONNECT TO MONGO DB
const connectDB = require('./config/mongoDB-connect');
connectDB();

//Handlebars Helpers
const {stripTags} = require('./helpers/hbs');
const {eq} = require('./helpers/hbs');

// Handlebars middleware
app.engine('handlebars', engine({
  helpers: {stripTags: stripTags, eq:eq },
  defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// ROUTES
// Landing Page
app.get("/", appController.landing_page);

// Login Page
app.get("/login", appController.login_get);
app.post("/login", appController.login_post);

// Register Page
app.get("/register", appController.register_get);
app.post("/register", appController.register_post);

// Dashboard Page
app.get("/", isAuth, appController.dashboard_get);
app.get("/monitoring", isAuth, appController.monitoring_get);
app.get("/controls", isAuth, appController.controls_get);

// Controls Post
app.post("/controls", appController.controls_post)

// User Loguout Request
app.post("/logout", appController.logout_post);

//Starting Server
const port = process.env.PORT || 5000;
http.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
});