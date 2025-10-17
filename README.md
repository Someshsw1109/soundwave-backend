# Music Player Backend API

Node.js/Express backend for the Music Player application with MongoDB.

## Features

- ✅ User Authentication (JWT)
- ✅ User Profiles & Social Features
- ✅ Playlist Management (create, edit, share, collaborate)
- ✅ Favorites/Likes
- ✅ Follow/Followers System
- ✅ Recommendations based on following

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/music-player
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

3. Start MongoDB locally or use MongoDB Atlas

4. Run server:
```bash
npm start      # Production
npm run dev    # Development with auto-reload
```

5. Server runs on `http://localhost:5000`

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

#### Users
- `GET /api/user/me` - Get current user
- `GET /api/user/:userId` - Get user profile
- `PUT /api/user/me` - Update profile
- `GET /api/user/search/:query` - Search users

#### Playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/user/:userId` - Get user's playlists
- `GET /api/playlists/:playlistId` - Get playlist details
- `POST /api/playlists/:playlistId/tracks` - Add track
- `DELETE /api/playlists/:playlistId/tracks/:trackId` - Remove track
- `PUT /api/playlists/:playlistId` - Update playlist
- `DELETE /api/playlists/:playlistId` - Delete playlist

#### Favorites
- `GET /api/favorites` - Get all favorites
- `POST /api/favorites` - Add to favorites
- `DELETE /api/favorites/:trackId` - Remove from favorites
- `GET /api/favorites/check/:trackId` - Check if favorited

#### Social
- `POST /api/social/follow/:userId` - Follow user
- `POST /api/social/unfollow/:userId` - Unfollow user
- `GET /api/social/followers/:userId` - Get followers
- `GET /api/social/following/:userId` - Get following
- `GET /api/social/recommendations` - Get recommendations

## Environment Variables

```
PORT              - Server port (default: 5000)
MONGODB_URI       - MongoDB connection string
JWT_SECRET        - Secret key for JWT tokens
FRONTEND_URL      - Frontend origin for CORS
NODE_ENV          - development or production
```

## Deployment (Vercel)

1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy (automatic on push)

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## Technologies

- **Express.js** - HTTP server
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests

## Project Structure

```
backend/
├── models/           # MongoDB schemas
│   ├── User.js
│   ├── Playlist.js
│   ├── Favorite.js
│   └── Social.js (in User.js)
├── routes/           # API routes
│   ├── auth.js
│   ├── user.js
│   ├── playlist.js
│   ├── favorite.js
│   └── social.js
├── server.js         # Main server file
├── package.json
├── vercel.json       # Vercel config
└── .env.example      # Example env vars
```

## License

MIT