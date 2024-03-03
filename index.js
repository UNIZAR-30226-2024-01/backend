const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
require('dotenv').config();

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

const app = express();
const port = 3000;

app.use(bodyParser.json())

const pool = new Pool({
  host:  process.env.DB_HOST,
  user:  process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
})

// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the database');
  done();

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});

// Handle SIGINT signal to close the database connection properly
process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Disconnected from PostgreSQL server');
    process.exit(0);
  });
});

