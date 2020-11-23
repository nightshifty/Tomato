//requires:
require('dotenv').config();
//const user = 'user';
//const password = 'passw';
const 
    express = require('express'),
    sqlite3 = require('sqlite3').verbose(),
    passport = require('passport'),
    session = require('express-session'),
    bcrypt = require('bcrypt'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser');
//    auth = require('./auth'),
//    cookieParser = require('cookie-parser'),
//    cookieSession = require('cookie-session'),

//declaration & initialisations of required plugins
const port = parseInt(process.env.PORT); 
const app = express();
app.use(express.static(__dirname + "/public"));//to allow direct access to files in public
app.use(bodyParser.urlencoded({extended: true}));
//express-session
app.use(session({
    //TODO reconfigure like described here: https://www.npmjs.com/package/express-session
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false
}));
//passport
app.use(passport.initialize());
app.use(passport.session());

//SQLite DB:
const db = new sqlite3.Database('database.db');
//prepared Queries:
const getAllUsers = "SELECT ID, NAME, PASSWORD FROM USERS;";
const getOneUserByName = "SELECT ID, NAME, PASSWORD FROM USERS WHERE NAME = $1;";
const insertToUsers = "INSERT INTO USERS (NAME, PASSWORD) VALUES ($1, $2);";
const insertToToDos = "INSERT INTO TODOS (CONTENT, POMODOROS, USERID, DONE) VALUES ($1, $2, $3, $4);";
const getAllToDosOfOneUser = "SELECT TODOID, CONTENT, POMODOROS FROM TODOS WHERE USERID = $1;";
const deleteOneTOdo = "DELETE FROM TODOS WHERE TODOID = $1 AND USERID = $2;";
const getLastAddedByUser = "SELECT MAX(TODOID), CONTENT, POMODOROS FROM TODOS WHERE USERID = $1;";

//passport authentication
passport.use(new LocalStrategy(
    function(username, password, done) {
        const userQuery = db.prepare(getOneUserByName);
        userQuery.get(username, function(error, row) {
            if(error) return err;
            if(!row) return done(null, false, {message: 'User not found!'});
            //Comparison of passwords if no error + a row exists:
            bcrypt.compare(password, row.PASSWORD, function(err, res){
                if(err){return done(null, false, {message: err});}
                if(res == true){
                    //password matches
                    console.log("password comparison successful");
                    user = {id: row.ID}
                    return done(null, user);
                }
                else{
                    //password doesn´t match
                    return done(null, false, {message: 'Incorrect password!'});
                }
            })
        })
    }));


passport.serializeUser(function(user, done){
    return done(null, user.id);
});

passport.deserializeUser(function(id, done){
    const userQuery = db.prepare("SELECT ID FROM USERS WHERE ID = $1;");
    userQuery.get(id, function(err, row){
        if(!row) return done(null, false); //in this case userID doesn´t exist
        return done(null, row);
    })
});

//let the server run on port
app.listen(port, function () {
    console.log('Server now running on port '+port);
});

//For testing of login:
app.get('/login', function(req, res) {
    res.sendFile(__dirname + "/login.html");
});
//For testing of register:
app.get('/register', function(req, res) {
    res.sendFile(__dirname + "/register.html");
});

//handle Login attempt:
app.post('/login', function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err){
            //authentication error
            console.log(err);
            return next(err);
        }
        if(!user){
            //user is undefined
            console.log(info);
            return res.redirect('/login');
        }
        req.logIn(user, function(err){//actual user login
            if(err){//error while login
                console.log(err);
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

//handle register
app.post('/register', function(req, res, next){
const username = req.body.username;
const plainpw = req.body.password;
console.log("Trying to insert to db: "+username);
//check if username exists already (because of UNIQUE Constraint in DB):
const userExistQuery = db.prepare(getOneUserByName);
userExistQuery.get(username, function(error, row) {
    if(error) return err;
    if(!row) {
    //bcrypt functions:
    //insert hashed pw to to db:
    const saltRounds = 10;
    bcrypt.hash(plainpw, saltRounds, function(err, hash){
        const prsmInsert = db.prepare(insertToUsers);
        prsmInsert.run(username, hash);
        prsmInsert.finalize();
        });
    console.log("success.")
    res.send("registration complete");
    }else{
    //If code ends up here => The user exists already:
    res.send("The Username exists already!");
    }
});
});

// GET method route
app.get('/', function (req, res) {
    if(req.isAuthenticated()){
        console.log("USER IS AUTHENTICATED WHILE REQUESTING");
       
    }else{
        console.log("ISER IS NOT AUTHENTICATED WHILE REQUESTING"); 


    }
    res.sendFile(__dirname + '/index.html');
});

//handle TODO add Entry Requests:
app.post('/addTodoItem', function (req, res, next) {
    console.log("Trying to post todo item");
    if(req.isAuthenticated()){
        console.log("posting is authenticated");
        const todoContent = req.body.text;
        const pomodoroAmount = req.body.pomodoro;
        const prsmInsertToDoEntry = db.prepare(insertToToDos);
        //values: CONTENT, POMODOROS, USERID, DONE(0 means no)
        prsmInsertToDoEntry.run(todoContent, pomodoroAmount, user.id, 0);
        prsmInsertToDoEntry.finalize;
    }
});

//create JSON with TODOS
app.get('/getTodoEntrys', function(req, res, next){
    console.log("Asked for ToDo list JSON");
    if(req.isAuthenticated()){
        console.log("generating JSON now...");
        const prsmGetTodos = db.prepare(getAllToDosOfOneUser);
        prsmGetTodos.all(user.id, function(error, rows) {
            if(error) {
                console.log(error);
                res.status(400).json(error);
            }else{
                res.status(200).json(rows);
            }
        });
    }
})

//find out if user is authenticated
app.get('/auth', function (req, res) {
    console.log("Responding auth /auth request");
    if(req.isAuthenticated()){
       res.status(200).send('authenticated');
    }else{
        res.status(403).send('unauthorized');
    }
});


//print user table to make testing easier :)
db.all(getAllUsers, (err, rows) => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("User table for testing purpose: (ID|NAME|PASSWORD):")
        rows.forEach((row) => {
            console.log(row.ID+" | "+row.NAME+" |"+row.PASSWORD);
          });
    }
});


db.close;
