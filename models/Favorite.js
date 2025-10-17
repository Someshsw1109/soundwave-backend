import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  track: {
    id: String,
    title: String,
    artist: String,
    album: String,
    image: String,
    duration: String,
    url: String,
    spotifyId: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Ensure user can only favorite a track once
favoriteSchema.index({ user: 1, 'track.spotifyId': 1 }, { unique: true })

export default mongoose.model('Favorite', favoriteSchema)