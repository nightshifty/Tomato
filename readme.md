# Tomato

## Overview

Tomato is a simple Pomodoro webapp that is suitable for everyone. It aims to provide an attractive user interface and an easy way to write and edit tasks using the Pomodoro technique.

This webapp was developed during the course "Web Development and Deployment" at the TU Dublin.

## Features

- Pomodoro Timer with personalized duration
- Profile management
- pleasant alarm sound to remind you for a break
- modern design for phone and desktop (phone prioritized)
- explanation about pomodor technique and how to use the app
- implements data minimisation principles (only asks for really needed informations)

### Additional Features as Member

- ToDo list
- select a task from list to "work on it"
- Tracking of time worked on tasks from todo list
- change password
- delete account

## Deployment

1. NodeJS needs to be installed on your machine.
2. Install the following packets for node:
    - dotenv
    - sqlite3
    - passport
    - passport-local
    - body-parser
    - express
    - express-session
    - bcrypt
    - express-validator
    You can install all of them with the following command inside the project folder:
>   npm install dotenv sqlite3 passport passport-local body-parser express express-session bcrypt express-validator
3. Modify the .env file: set a port and a session key. It is very important to set an own session key for security reasons. But you can leave it unchanged for testing.
4. Start the server with the command node server.js
5. Open the app on localhost:port (default: localhost:80 
[if it´s 80 you can leave it out and just open localhost ])
If the page is not loading one common problem is that the browser is redirecting to https://localhost but the page is on http not https.
Also before opening the page ensure JS is enabled and loading of external scripts is not blocked (we use the CDNs of JQuery, Bootstrap, etc.). Without JavaScript our app is useless because even the most basic functionallity of it (the timer) is built in JS.

## Usage of the app
Just expand the navigation bar and click on help to find out about the usecase of the app and how to use it.
Note: We also registered a Testing user you can use. Its username is tester and its password is iwanttotest1pomodoroapp 
Or you just create a new user. It only takes 2 seconds.
Note for testing: We implemented this app with a mobile first approach. It is also working on desktops but the main platform we focused on are mobile phones.

## Future releases
The project is fully working and potential finished but we have many features we plan to add in future releases. The database tables are already designed to work with future releass to avoid complicated data migration after updates. That´s why in this release some fields of the Database are not used.

## Database
The database (a SQLite DB) is included already. This section is only for further information.
The tables included in database.db can also manually be created using the following sqlite3 commands.


### Users Table
Contains all Users which are registered (notice that the password is not stored but only a hash of it)

> CREATE TABLE USERS(ID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT UNIQUE NOT NULL, PASSWORD TEXT NOT NULL, LASTUSED TEXT, PUBLIC INTEGER, POMOTIME INTEGER DEFAULT 25);

### ToDos Table
Contains all ToDo list elements

> CREATE TABLE TODOS (TODOID INTEGER PRIMARY KEY AUTOINCREMENT, CONTENT TEXT NOT NULL, CREATEDDATE TEXT, DONE INTEGER, DONETIME TEXT, TIMESPENT INTEGER, ESTIMATION INTEGER, USERID INTEGER NOT NULL ,FOREIGN KEY (USERID) REFERENCES USERS(ID));

### Pomodoro Table
Will contain all Pomodoros tracked in future versions for advanced individual statistics about each user.

> CREATE TABLE POMODORO (ID INTEGER PRIMARY KEY AUTOINCREMENT, USERID INTEGER NOT NULL, TODOID INTEGER, BEGIN TEXT, END TEXT, DURATION INT, VOTING INT CONTENT TEXT NOT NULL, FOREIGN KEY (USERID) REFERENCES USERS(ID), FOREIGN KEY (TODOID) REFERENCES TODOS(TODOID));