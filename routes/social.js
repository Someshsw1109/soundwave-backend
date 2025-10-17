import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

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

// Follow user
router.post('/follow/:userId', verifyToken, async (req, res) => {
  try {
    if (req.params.userId === req.userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    const userToFollow = await User.findById(req.params.userId)
    const currentUser = await User.findById(req.userId)

    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if already following
    if (currentUser.following.includes(req.params.userId)) {
      return res.status(400).json({ error: 'Already following' })
    }

    // Add to following
    currentUser.following.push(req.params.userId)
    // Add to followers
    userToFollow.followers.push(req.userId)

    await currentUser.save()
    await userToFollow.save()

    res.json({ message: 'Successfully followed user' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Unfollow user
router.post('/unfollow/:userId', verifyToken, async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId)
    const currentUser = await User.findById(req.userId)

    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Remove from following
    currentUser.following = currentUser.following.filter(id => id.toString() !== req.params.userId)
    // Remove from followers
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.userId)

    await currentUser.save()
    await userToUnfollow.save()

    res.json({ message: 'Successfully unfollowed user' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get followers
router.get('/followers/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'name avatar bio')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user.followers)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get following
router.get('/following/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('following', 'name avatar bio')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user.following)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get recommendations based on following
router.get('/recommendations', verifyToken, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).populate('following')

    // Get playlists from users that current user is following
    const Playlist = require('../models/Playlist.js').default
    const playlists = await Playlist.find({
      owner: { $in: currentUser.following },
      isPublic: true
    })
      .populate('owner', 'name avatar')
      .limit(20)

    res.json(playlists)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router