const express = require('express');
const mysql = require('mysql2');

const database = 'event_management';
const username = "root";
const password = "";
const host = 'localhost';

//connect to the database
const connectionDB = mysql.createConnection({
    host: host,
    user: username,
    password: password,
    databse: database
});

connectionDB.connect((error) =>{
    if(error) {
        console.error('Error connecting to database:', error)
        process.exit(1); //Exit the process on error connection
    } else {
        console.log('Connected to database')
    }
})

module.exports = connectionDB