import express from 'express'
import jwt from 'jsonwebtoken'
import Playlist from '../models/Playlist.js'

const router = express.Router()

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    req.userId = decoded.id
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Create playlist
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body

    const playlist = new Playlist({
      name,
      description,
      owner: req.userId,
      isPublic
    })

    await playlist.save()
    await playlist.populate('owner', 'name avatar')

    res.status(201).json(playlist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user's playlists
router.get('/user/:userId', async (req, res) => {
  try {
    const playlists = await Playlist.find({
      $or: [
        { owner: req.params.userId },
        { collaborators: req.params.userId }
      ]
    })
      .populate('owner', 'name avatar')
      .populate('followers', 'name avatar')

    res.json(playlists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get playlist by ID
router.get('/:playlistId', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
      .populate('owner', 'name avatar')
      .populate('followers', 'name avatar')
      .populate('collaborators', 'name avatar')

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' })
    }

    res.json(playlist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add track to playlist
router.post('/:playlistId/tracks', verifyToken, async (req, res) => {
  try {
    const { track } = req.body

    const playlist = await Playlist.findById(req.params.playlistId)
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' })
    }

    // Check if user is owner or collaborator
    if (playlist.owner.toString() !== req.userId && !playlist.collaborators.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    // Check if track already in playlist
    if (playlist.tracks.some(t => t.spotifyId === track.spotifyId || t.id === track.id)) {
      return res.status(400).json({ error: 'Track already in playlist' })
    }

    playlist.tracks.push(track)
    playlist.updatedAt = new Date()
    await playlist.save()

    res.json(playlist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove track from playlist
router.delete('/:playlistId/tracks/:trackId', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' })
    }

    if (playlist.owner.toString() !== req.userId && !playlist.collaborators.includes(req.userId)) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    playlist.tracks = playlist.tracks.filter(t => t.id !== req.params.trackId)
    playlist.updatedAt = new Date()
    await playlist.save()

    res.json(playlist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update playlist
router.put('/:playlistId', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' })
    }

    if (playlist.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const { name, description, isPublic, isCollaborative } = req.body
    Object.assign(playlist, { name, description, isPublic, isCollaborative })
    playlist.updatedAt = new Date()
    await playlist.save()

    res.json(playlist)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete playlist
router.delete('/:playlistId', verifyToken, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId)
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' })
    }

    if (playlist.owner.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await Playlist.deleteOne({ _id: req.params.playlistId })
    res.json({ message: 'Playlist deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router