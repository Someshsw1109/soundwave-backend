import express from 'express'
import jwt from 'jsonwebtoken'
import Favorite from '../models/Favorite.js'

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

// Get user's favorites
router.get('/', verifyToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId })
      .sort({ createdAt: -1 })

    res.json(favorites)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add to favorites
router.post('/', verifyToken, async (req, res) => {
  try {
    const { track } = req.body

    // Check if already favorited
    const existing = await Favorite.findOne({
      user: req.userId,
      'track.spotifyId': track.spotifyId || track.id
    })

    if (existing) {
      return res.status(400).json({ error: 'Already in favorites' })
    }

    const favorite = new Favorite({
      user: req.userId,
      track
    })

    await favorite.save()
    res.status(201).json(favorite)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove from favorites
router.delete('/:trackId', verifyToken, async (req, res) => {
  try {
    const result = await Favorite.findOneAndDelete({
      user: req.userId,
      $or: [
        { 'track.spotifyId': req.params.trackId },
        { 'track.id': req.params.trackId }
      ]
    })

    if (!result) {
      return res.status(404).json({ error: 'Favorite not found' })
    }

    res.json({ message: 'Removed from favorites' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Check if track is favorited
router.get('/check/:trackId', verifyToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.userId,
      $or: [
        { 'track.spotifyId': req.params.trackId },
        { 'track.id': req.params.trackId }
      ]
    })

    res.json({ isFavorited: !!favorite })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router