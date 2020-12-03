//requires:
require('dotenv').config();
const 
    express = require('express'),
    sqlite3 = require('sqlite3').verbose(),
    passport = require('passport'),
    session = require('express-session'),
    bcrypt = require('bcrypt'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    {body, validationResult} = require('express-validator');

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
const getAllUsers = "SELECT ID, NAME, PASSWORD, POMOTIME FROM USERS;";
const getOneUserByName = "SELECT ID, NAME, PASSWORD, POMOTIME FROM USERS WHERE NAME = $1;";
const insertToUsers = "INSERT INTO USERS (NAME, PASSWORD) VALUES ($1, $2);";
const insertToToDos = "INSERT INTO TODOS (CONTENT, ESTIMATION, TIMESPENT, USERID, DONE) VALUES ($1, $2, $3, $4, $5);";
const getAllToDosOfOneUser = "SELECT TODOID, CONTENT, ESTIMATION, TIMESPENT FROM TODOS WHERE USERID = $1;";
const deleteOneTOdo = "DELETE FROM TODOS WHERE TODOID = $1 AND USERID = $2;";
const getLastAddedByUser = "SELECT MAX(TODOID), CONTENT, ESTIMATION FROM TODOS WHERE USERID = $1;";
const updateTimeSpentOnTodo = "UPDATE TODOS SET TIMESPENT = TIMESPENT + $1 WHERE TODOID = $2 AND USERID = $3;";
const updatePomoTmeforUser = "UPDATE USERS SET POMOTIME = $1 WHERE ID = $2;";
const getPomoTime = "SELECT POMOTIME FROM USERS WHERE ID = $1;";

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

//handle register including validation
app.post('/register', [
    //username must be at least 3 chars long
    body('username').isLength({ min: 3 }).trim().escape()
    ,/*.bail().custom(val => {
        return !(checkUserExists(val))
    }),*/
    //min 8 chars length, TODO contain min 1 char and 1 letter
    body('password').isLength({ min: 8 }).withMessage('password needs min 8 characters')
    .matches('[0-9]').withMessage('password must contain a number')
    .matches('[A-Z,a-z]').withMessage('password must contain a letter').trim().escape()
    //TODO: check not in use
], function(req, res){// Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
  if (!errors.isEmpty()) {
      console.log("did not match");
    return res.status(400).json({ errors: errors.array() });
  }
//at this point username & password are validated
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
//    res.redirect('/');
    res.send("registration complete");
    }else{
    //If code ends up here => The user exists already:
    res.send("The Username exists already!");
    }
});
});

/*function checkUserExists(username){
    console.log("checking if username exitst: "+username);
    const userExistQuery = db.prepare(getOneUserByName);
    userExistQuery.get(username, function(error, row) {
        if(error) {
            console.log("there is an error while checking");
            return false;
        }
        if(!row){ //username still free
            console.log("existing already");
            return false;
        }
        console.log("name still free");
        return true;
        })
}*/

//logout functionality
app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

//Delete one todoItem
// POST method route
app.post('/deleteOneEntry', function(req, res){
    if(req.isAuthenticated()){
        //DELETE FROM TODOS WHERE TODOID = $1 AND USERID = $2:
        console.log("Trying to delete todoitem "+req.body.todoid+" from user "+user.id)
        const prsmDelete = db.prepare(deleteOneTOdo);
        prsmDelete.run(req.body.todoid, user.id);
        prsmDelete.finalize();
        console.log("deleted");
        res.status(200).send('OK');
    }else{
        res.status(400).send(error);
    }
})

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
app.post('/addTodoItem', [
    // Check Todo text
    body('text').trim().notEmpty().withMessage('Text can not be empty'),
    // check pomodoronumber
    body('pomodoro').trim()
    .optional({ checkFalsy: true })
    .isNumeric().withMessage('Only Decimals allowed')
], 
   function (req, res) {
    const errors = validationResult(req);
    console.log("user tries to insert pomodoro: "+req.body.pomodoro);
    if (!errors.isEmpty()) {
        console.log("forbidden to add to todo because not validated.");
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("Trying to post todo item");
    if(req.isAuthenticated()){
        console.log("posting is authenticated");
        const todoContent = req.body.text;
        const pomodoroAmount = req.body.pomodoro;
        const prsmInsertToDoEntry = db.prepare(insertToToDos);
        //values: CONTENT, POMODOROS, TIMESPENT, USERID, DONE(0 means no)
        prsmInsertToDoEntry.run(todoContent, pomodoroAmount, 0, user.id, 0);
        prsmInsertToDoEntry.finalize;
        console.log("entry should be added");
        res.status(200).send('OK');
    }
});

//handle track time Requests:
app.post('/trackTime', 
//TODO Track in a POMO Entity
   function (req, res) {
    if(req.isAuthenticated()){
        console.log("user tries to track "+req.body.time+" to task "+req.body.task);
        const time = req.body.time;
        const task = parseInt(req.body.task);

        if(!isNaN(task) && task >= 0){//checks if user submitted a valid ID
            const prsmaddTimetoTodo = db.prepare(updateTimeSpentOnTodo);
            //UPDATE TODOS SET TIMESPENT = TIMESPENT + $1 WHERE TODOID = $2 AND USERID = $3
            prsmaddTimetoTodo.run(time, task, user.id);
            prsmaddTimetoTodo.finalize;
            console.log("pomodoro should be updated");
            res.status(200).send('OK');
        }else{
            console.log("not tracking to any task because task was NaN");
            res.status(400).send('denied');
        }
    }else{
    res.status(400).send('denied');
    }
});

//change PomodoroTime
app.post('/changePomoTime', 
   function (req, res) {
    if(req.isAuthenticated()){
        console.log("user tries to change pomodoroTime to: "+req.body.newtime);
        const newtime = parseInt(req.body.newtime);

        if(!isNaN(newtime) && newtime > 0){//checks if user submitted a valid time
            const prsmchangePomoTime = db.prepare(updatePomoTmeforUser);
            //UPDATE USERS SET POMOTIME = $1 WHERE USERID = $2;
            prsmchangePomoTime.run(newtime, user.id);
            prsmchangePomoTime.finalize;
            console.log("pomodoroTime should be updated for the user");
            res.status(200).send('OK');
        }else{
            console.log("not updating anything because submitted time was not valid");
            res.status(400).send('denied');
        }
    }else{
    res.status(400).send('denied');
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
                console.log("JSON sent");
                res.status(200).json(rows);
            }
        });
    }else{
        res.status(400).send();
    }
})

//create JSON with POMOTIME
app.get('/getPomoTime', function(req, res, next){
    console.log("Asked for PomoTime JSON");
    if(req.isAuthenticated()){
        console.log("generating JSON now...");
        //SELECT POMOTIME FROM USERS WHERE ID = $1;"
        const prsmGetPomoTime = db.prepare(getPomoTime);
        prsmGetPomoTime.all(user.id, function(error, rows) {
            if(error) {
                console.log(error);
                res.status(400).json(error);
            }else{
                console.log("JSON sent");
                res.status(200).json(rows);
            }
        });
    }else{
        res.status(400).send();
    }
})

//find out if user is authenticated
app.get('/auth', function (req, res) {
    console.log("Responding auth /auth request");
    if(req.isAuthenticated()){
       res.status(201).send('authenticated');
    }else{
        res.status(403).send('unauthorized');
    }
});


//print user table to make testing easier :)
db.all(getAllUsers, (err, rows) => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("User table for testing purpose: (ID|NAME|PASSWORD|POMOTIME):")
        rows.forEach((row) => {
            console.log(row.ID+" | "+row.NAME+" |"+row.PASSWORD+" |"+row.POMOTIME);
          });
    }
});

db.close;
