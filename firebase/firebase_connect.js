const firebase = require("firebase");

const app = firebase.initializeApp({
    apiKey: "AIzaSyBR0kstVOmbMCE6WuaSiXImg5hCAcTpowM",
    authDomain: "messages-d18e7.firebaseapp.com",
    databaseURL: "https://messages-d18e7-default-rtdb.firebaseio.com",
 
});
module.exports = app;