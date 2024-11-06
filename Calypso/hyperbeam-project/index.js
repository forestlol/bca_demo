const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

// Enable CORS to allow requests from the frontend
app.use(cors());

// Cache to store session data
let sessionCache = null;
let sessionCacheTimestamp = null;
const CACHE_TTL = 31536000000; // Cache for 1 year (in milliseconds)

// Your Hyperbeam API key
const apiKey = process.env.HYPERBEAM_API_KEY; // Replace with your actual API key

// Route to create or retrieve a cached Hyperbeam session
app.post('/create-session', async (req, res) => {
  try {
    // Check if there is a valid session in the cache
    const currentTime = new Date().getTime();
    if (sessionCache && currentTime - sessionCacheTimestamp < CACHE_TTL) {
      console.log('Returning cached session');
      return res.json({ embed_url: sessionCache });
    }

    // Otherwise, create a new Hyperbeam session
    const response = await axios.post('https://engine.hyperbeam.com/v0/vm', {
      url: 'https://login.remotepc.com/rpcnew/home', // The VM will open RemotePC
      interactive: true
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Store session in cache
    sessionCache = response.data.embed_url;
    sessionCacheTimestamp = currentTime;

    // Respond with the embed URL for the session
    res.json({ embed_url: sessionCache });
  } catch (error) {
    console.error('Error creating Hyperbeam session:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error creating session' });
  }
});

// Serve the app on the specified port
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});