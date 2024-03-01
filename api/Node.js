const express = require('express');
const { Pool } = require('pg');
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

const app = express();
const port = 3000;



// Test the database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
    done();
  }
});

// Define your API routes here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

