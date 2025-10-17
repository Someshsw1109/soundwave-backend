import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Middleware to verify JWT
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

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user.getPublicProfile())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // If user is private and not the requester, don't show full profile
    if (!user.isPublic) {
      return res.json({
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        isPublic: user.isPublic
      })
    }

    res.json(user.getPublicProfile())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, bio, avatar, isPublic } = req.body

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, bio, avatar, isPublic },
      { new: true }
    )

    res.json(user.getPublicProfile())
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { email: { $regex: req.params.query, $options: 'i' } }
      ],
      isPublic: true
    })
      .select('name avatar bio followers')
      .limit(10)

    res.json(users)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router