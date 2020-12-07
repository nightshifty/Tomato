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
    { body, validationResult } = require('express-validator');

//declaration & initialisations of required plugins
const port = parseInt(process.env.PORT);
const app = express();
app.use(express.static(__dirname + "/public"));//to allow direct access to files in public
app.use(bodyParser.urlencoded({ extended: true }));
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
//const getLastAddedByUser = "SELECT MAX(TODOID), CONTENT, ESTIMATION FROM TODOS WHERE USERID = $1;";
const updateTimeSpentOnTodo = "UPDATE TODOS SET TIMESPENT = TIMESPENT + $1 WHERE TODOID = $2 AND USERID = $3;";
const updatePomoTmeforUser = "UPDATE USERS SET POMOTIME = $1 WHERE ID = $2;";
const getPomoTime = "SELECT POMOTIME FROM USERS WHERE ID = $1;";
const getPWHashForUser = "SELECT PASSWORD FROM USERS WHERE ID = $1;";
const changePWForUser = "UPDATE USERS SET PASSWORD = $1 WHERE ID = $2;";
const deleteOneUser = "DELETE FROM USERS WHERE ID = $1;";

/**
 * passport authentication function
 */
passport.use(new LocalStrategy(
    function (username, password, done) {
        const userQuery = db.prepare(getOneUserByName);
        userQuery.get(username, function (error, row) {
            if (error) return err;
            if (!row) return done(null, false, { message: 'User not found!' });
            //Comparison of passwords if no error + a row exists:
            bcrypt.compare(password, row.PASSWORD, function (err, res) {
                if (err) { return done(null, false, { message: err }); }
                if (res == true) {
                    //password matches
                    console.log("password comparison successful");
                    user = { id: row.ID }
                    return done(null, user);
                }
                else {
                    //password doesn´t match
                    return done(null, false, { message: 'Incorrect password!' });
                }
            })
        })
    }));

/**
 * serialisation function of passport to store userID in session
 */
passport.serializeUser(function (user, done) {
    return done(null, user.id);
});

/**
 * deserialisation function of passport to get information from session about the user
 */
passport.deserializeUser(function (id, done) {
    const userQuery = db.prepare("SELECT ID FROM USERS WHERE ID = $1;");
    userQuery.get(id, function (err, row) {
        if (!row) return done(null, false); //in this case userID doesn´t exist
        return done(null, row);
    })
});

/**
 * let the server run on port x
 */
app.listen(port, function () {
    console.log('Server now running on port ' + port);
});

/**
 * This route is called by the login form on index-page if first login attempt was not succesfull
 */
app.get('/login', function (req, res) {
    res.sendFile(__dirname + "/login.html");
});

/**
 * This route is called by the change-password form on index-page(in settings) 
 * if the old password entered was wrong
 */
app.get('/wrong-password', function (req, res) {
    if (req.isAuthenticated())
        req.logout();
    res.sendFile(__dirname + "/wrong-pw.html");
});

/**
 * General error route is called to inform users about errors 
 * which don´t need to bes specified for them
 */
app.get('/error', function (req, res) {
    res.sendFile(__dirname + "/error.html");
});

/**
 * General success route is called to inform users about that something worked 
 * which don´t need to bes specified for them (because he usually know what he wanted to happen)
 * used for logout and account delete
 */
app.get('/success', function (req, res) {
    res.sendFile(__dirname + "/success.html");
});



/**
 * Route opens the website where user can fill out the registration form
 */
app.get('/register', function (req, res) {
    res.sendFile(__dirname + "/register.html");
});

/**
 * Handle a Login attempt
 * Trying to authenticate user using password
 */
app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            //authentication error
            console.log(err);
            return next(err);
        }
        if (!user) {
            //user is undefined
            console.log(info);
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {//actual user login
            if (err) {//error while login
                console.log(err);
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

/**
 * handle registration attempt
 * client-side should be already validated for the requirements
 * now validating server-side the same requirements
 */
app.post('/register', [
    //username must be at least 3 chars long
    body('username').isLength({ min: 3 }).trim().escape(),
    //min 8 chars length, TODO contain min 1 char and 1 letter
    body('password').isLength({ min: 8 }).withMessage('password needs min 8 characters')
        .matches('[0-9]').withMessage('password must contain a number')
        .matches('[A-Z,a-z]').withMessage('password must contain a letter').trim().escape()
    //TODO: check not in use
], function (req, res) {// Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("did not match");
        //following message is sent to the client on registration page using AJAX
        return res.status(400).json({
            error:
                "Check your inputs. username needs min. 3 chars, password needs a legth of 8+ and at least one number and one letter"
        });
    }
    //at this point username & password are validated
    const username = req.body.username;
    const plainpw = req.body.password;
    console.log("Trying to insert to db: " + username);
    //checking if username exists alroady
    const userExistQuery = db.prepare(getOneUserByName);
    userExistQuery.get(username, function (error, row) {
        if (error) return err;
        if (!row) {
            //bcrypt functions:
            //insert hashed pw to to db:
            const saltRounds = 10;
            bcrypt.hash(plainpw, saltRounds, function (err, hash) {
                const prsmInsert = db.prepare(insertToUsers);
                prsmInsert.run(username, hash);
                prsmInsert.finalize();
            });
            console.log("success.");
            res.status(200).send("user created!")
        } else {
            //If code ends up here -> The user exists already:
            res.status(400).json({ error: "This username exists already!" });
        }
    });
});
//end of registration fucntion

/**
 * logout functionality
 * logging user out and redirecting him to success page
 */
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/success');
});

/**
 * delete account functionality
 * deletes account of user and redirect to success page
 */
app.post('/deleteMyAccount', function (req, res) {
    const prsmDelUser = db.prepare(deleteOneUser);
    prsmDelUser.run(user.id);
    req.logOut();
    res.redirect('/success');
})


/**
 * change password functionality
 * validating old and new passwords
 * changes password if validation is fine
 */
app.post('/changePW',
    [
        //min 8 chars length, TODO contain min 1 char and 1 letter
        body('newpw').isLength({ min: 8 }).withMessage('password needs min 8 characters')
            .matches('[0-9]').withMessage('password must contain a number')
            .matches('[A-Z,a-z]').withMessage('password must contain a letter').trim().escape()
    ],
    function (req, res) {
        if (req.isAuthenticated()) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log("did not match");
                res.redirect("/error");
            }
            let oldPW = req.body.oldpw;
            const newPWPlain = req.body.newpw;
            //check if old password is correct:
            const userQuery = db.prepare(getPWHashForUser);
            userQuery.get(user.id, function (error, row) {
                if (error) return err;
                if (!row) res.redirect("/error");
                //Comparison of passwords if no error + a row exists:
                bcrypt.compare(oldPW, row.PASSWORD, function (err, resp) {
                    if (err) { return done(null, false, { message: err }); }
                    if (resp == true) {
                        //password matches
                        console.log("password comparison successful, changing password now");
                        // TODO CHANGE PW HERE!!!
                        //UPDATE USERS SET PASSWORD = $1 WHERE ID = $2;
                        const saltRounds = 10;
                        bcrypt.hash(newPWPlain, saltRounds, function (err, hash) {
                            const prsmUpdatePW = db.prepare(changePWForUser);
                            prsmUpdatePW.run(hash, user.id)
                            prsmUpdatePW.finalize();
                        });
                        console.log("Password should be updated now");
                        res.status(200).send("Password was updated.")
                    }
                    else {
                        //password doesn´t match
                        res.redirect("/wrong-password");
                    }
                });
            });
        }
        else {
            res.redirect("/error");
        }
    }
);

/**
 * Deletes one todoItem from DB, called with AJAX
 */
app.post('/deleteOneEntry', function (req, res) {
    if (req.isAuthenticated()) {
        //DELETE FROM TODOS WHERE TODOID = $1 AND USERID = $2:
        console.log("Trying to delete todoitem " + req.body.todoid + " from user " + user.id);
        const prsmDelete = db.prepare(deleteOneTOdo);
        prsmDelete.run(req.body.todoid, user.id);
        prsmDelete.finalize();
        console.log("deleted");
        res.status(200).send('OK');
    } else {
        res.status(400).send(error);
    }
});

/**
 * Route function to the main page
 */
app.get('/', function (req, res) {
    if (req.isAuthenticated()) {//included only for debugging reasons
        console.log("+++ User IS authenticated while requesting");
    } else {
        console.log("--- User NOT authenticated while requesting");
    }
    res.sendFile(__dirname + '/index.html');
});

/**
 * handles Requsts to add entry to TODO:
 */
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
        console.log("user tries to insert pomodoro: " + req.body.pomodoro);
        if (!errors.isEmpty()) {
            console.log("forbidden to add to todo because not validated.");
            return res.status(400).json({ errors: errors.array() });
        }
        console.log("Trying to post todo item");
        if (req.isAuthenticated()) {
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
        if (req.isAuthenticated()) {
            console.log("user tries to track " + req.body.time + " to task " + req.body.task);
            const time = req.body.time;
            const task = parseInt(req.body.task);

            if (!isNaN(task) && task >= 0) {//checks if user submitted a valid ID
                const prsmaddTimetoTodo = db.prepare(updateTimeSpentOnTodo);
                //UPDATE TODOS SET TIMESPENT = TIMESPENT + $1 WHERE TODOID = $2 AND USERID = $3
                prsmaddTimetoTodo.run(time, task, user.id);
                prsmaddTimetoTodo.finalize;
                console.log("pomodoro should be updated");
                res.status(200).send('OK');
            } else {
                console.log("not tracking to any task because task was NaN");
                res.status(400).send('denied');
            }
        } else {
            res.status(400).send('denied');
        }
    });

//change PomodoroTime
app.post('/changePomoTime',
    function (req, res) {
        if (req.isAuthenticated()) {
            console.log("user tries to change pomodoroTime to: " + req.body.newtime);
            const newtime = parseInt(req.body.newtime);

            if (!isNaN(newtime) && newtime > 0) {//checks if user submitted a valid time
                const prsmchangePomoTime = db.prepare(updatePomoTmeforUser);
                //UPDATE USERS SET POMOTIME = $1 WHERE USERID = $2;
                prsmchangePomoTime.run(newtime, user.id);
                prsmchangePomoTime.finalize;
                console.log("pomodoroTime should be updated for the user");
                res.status(200).send('OK');
            } else {
                console.log("not updating anything because submitted time was not valid");
                res.status(400).send('denied');
            }
        } else {
            res.status(400).send('denied');
        }
    });

//create JSON with TODOS
app.get('/getTodoEntrys', function (req, res, next) {
    console.log("Asked for ToDo list JSON");
    if (req.isAuthenticated()) {
        console.log("generating JSON now...");
        const prsmGetTodos = db.prepare(getAllToDosOfOneUser);
        prsmGetTodos.all(user.id, function (error, rows) {
            if (error) {
                console.log(error);
                res.status(400).json(error);
            } else {
                console.log("JSON sent");
                res.status(200).json(rows);
            }
        });
    } else {
        res.status(400).send();
    }
});

//create JSON with POMOTIME
app.get('/getPomoTime', function (req, res, next) {
    console.log("Asked for PomoTime JSON");
    if (req.isAuthenticated()) {
        console.log("generating JSON now...");
        //SELECT POMOTIME FROM USERS WHERE ID = $1;"
        const prsmGetPomoTime = db.prepare(getPomoTime);
        prsmGetPomoTime.all(user.id, function (error, rows) {
            if (error) {
                console.log(error);
                res.status(400).json(error);
            } else {
                console.log("JSON sent");
                res.status(200).json(rows);
            }
        });
    } else {
        res.status(400).send();
    }
});

//find out if user is authenticated
app.get('/auth', function (req, res) {
    console.log("Responding auth /auth request");
    if (req.isAuthenticated()) {
        res.status(201).send('authenticated');
    } else {
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
            console.log(row.ID + " | " + row.NAME + " |" + row.PASSWORD + " |" + row.POMOTIME);
        });
    }
});

db.close;
