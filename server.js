
'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const app = express();
const routes = require('./routes.js');
const auth = require('./auth.js');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('view engine', 'pug');
app.set('views', './views/pug');
app.use(session({
  //secret: process.env.SESSION_SECRET,
  secret: 'test',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  routes(app, myDataBase);
  auth(app, myDataBase);

  let currentUsers = 0;
  io.on('connection', socket => {
    ++currentUsers;
    io.emit('user count', currentUsers);
    console.log('A user has connected');
  });

  // Be sure to add this...
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
// app.listen out here...


const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
