const functions = require('firebase-functions');
const express = require('express');
const app = express();
const FBAuth = require('./util/fbAuth');

const cors = require('cors');
app.use(cors());

app.use(express.json());

// Playlists routes
const {
  getPlaylists,
  getAllPlaylists,
  getOnePlaylist,
  addPlaylist,
  addVideo,
  removeVideo,
  removePlaylist
} = require('./routes/playlists');

// User routes
const { signup, login, getAuthenticatedUser } = require('./routes/users');

// Get all user's playlists
app.get('/playlists', FBAuth, getPlaylists);
// Get all playlists
app.get('/allPlaylists', getAllPlaylists);
// Get one playlist
app.get('/playlist', getOnePlaylist);
// Add new playlist
app.put('/addPlaylist', FBAuth, addPlaylist);
// Remove playlist
app.delete('/removePlaylist/:name', FBAuth, removePlaylist);
// Add video to playlist
app.put('/addPlaylistVideo', FBAuth, addVideo);
// Remove video from playlist
app.post('/removePlaylistVideo', FBAuth, removeVideo);

// Signup route
app.post('/signup', signup);
// Login route
app.post('/login', login);
// Get own user's details
app.get('/user', FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);
