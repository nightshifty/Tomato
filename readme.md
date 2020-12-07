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

### Additional Features as Member

- ToDo list
- select a task from list to "work on it"
- Tracking of time worked on tasks from todo list
- change password
- delete account

## How to use

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
    npm install dotenv sqlite3 passport passport-local body-parser express express-session bcrypt express-validator
3. Modify the .env file: set a port and a session key. It is very important to set an own session key for security reasons. But you can leave it unchanged for testing.
4. Start the server with the command node server.js
5. Open the app on localhost:port (default: localhost:80 
[if it´s 80 you can leave it out and just open localhost ])

## Usage of the app
Just expand the navigation bar and click on help to find out about the usecase of the app and how to use it.

## Future releases
The project is fully working and potential finished but we have many features we plan to add in future releases. The database tables are already designed to work with future releass to avoid complicated data migration after updates. That´s why in this release some fields of the Database are not used.