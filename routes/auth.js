import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Helper function to create JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '30d'
  })
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    })

    await user.save()

    const token = createToken(user._id)
    res.status(201).json({
      token,
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ error: 'User not found' })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid password' })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    const token = createToken(user._id)
    res.json({
      token,
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Verify token
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      valid: true,
      user: user.getPublicProfile()
    })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router