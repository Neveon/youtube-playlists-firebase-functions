const { admin, db } = require('../util/admin');

exports.getPlaylists = (req, res) => {
  db.collection('playlists')
    .where('userId', '==', req.user.userId) // from req.user FBAuth
    .orderBy('createdAt', 'desc') // query requires an index
    .get()
    .then(data => {
      let playlists = [];
      data.forEach(doc => {
        playlists.push(doc.data());
      });
      return res.json(playlists);
    })
    .catch(err => console.error(err));
};

exports.getAllPlaylists = (req, res) => {
  db.collection('playlists')
    .orderBy('createdAt', 'desc') // query requires an index
    .get()
    .then(data => {
      let playlists = [];
      data.forEach(doc => {
        playlists.push(doc.data());
      });
      return res.json(playlists);
    })
    .catch(err => console.error(err));
};

exports.addPlaylist = (req, res) => {
  if (req.body.list.length === 0) {
    return res
      .status(400)
      .json({ general: 'Playlist must contain at least one video ID' });
  } else if (req.body.name.trim() === '') {
    return res.status(400).json({ general: 'Playlist name must not be empty' });
  } else if (req.body.name.split(' ').length > 1) {
    return res.status(400).json({
      general: 'Playlist name must not contain whitespace, use underscore "_"'
    });
  }

  const newPlaylist = {
    createdAt: new Date().toISOString(),
    list: req.body.list,
    name: req.body.name,
    userId: req.user.userId // defined in FBAuth using token
  };

  db.doc(`/playlists/${newPlaylist.name}`)
    .set(newPlaylist)
    .then(() => {
      return res.status(201).json(newPlaylist);
    })
    .catch(err => {
      res.status(500).json({ error: 'somthing went wrong' });
      console.error(err);
    });
};
exports.removePlaylist = (req, res) => {
  if (req.params.name === '') {
    return res.status(400).json({ general: 'Playlist name must not be empty' });
  }

  const playlistToRemove = req.params.name;
  const document = db.doc(`/playlists/${playlistToRemove}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Playlist not found' });
      }
      if (doc.data().userId !== req.user.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      return res
        .status(200)
        .json({ message: `${playlistToRemove} deleted successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'somthing went wrong' });
      console.error(err);
    });
};

exports.addVideo = (req, res) => {
  if (req.body.videoId.trim() === '') {
    return res
      .status(400)
      .json({ general: 'must contain at least one video ID' });
  }

  if (req.body.name.trim() === '') {
    return res.status(400).json({ general: 'must contain a name' });
  }

  const videoToAdd = req.body.videoId;
  const playlistName = req.body.name;

  db.doc(`/playlists/${playlistName}`)
    .update({ list: admin.firestore.FieldValue.arrayUnion(videoToAdd) })
    .then(() => {
      return res
        .status(200)
        .json({ message: `${playlistName} updated successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'somthing went wrong' });
      console.error(err);
    });
};

exports.removeVideo = (req, res) => {
  const videoToRemove = req.body.videoId;
  const playlistName = req.body.name;

  db.doc(`/playlists/${playlistName}`)
    .update({ list: admin.firestore.FieldValue.arrayRemove(videoToRemove) })
    .then(() => {
      return res
        .status(200)
        .json({ message: `${playlistName} updated successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'somthing went wrong' });
      console.error(err);
    });
};
