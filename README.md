<div align="center">
  <img src="https://stashr.vercel.app/favicon.svg" alt="Stashr Logo" width="64" height="64">
  <h1>Stashr</h1>
</div>

A modern, fast, and beautiful bookmark management application built with Next.js, TypeScript, and MongoDB. Organize your web bookmarks into colorful folders with an intuitive interface and secure user authentication.

## ✨ Features

- **🔐 User Authentication**: Secure login with Google OAuth using NextAuth.js
- **📁 Folder Organization**: Create and manage bookmark folders with custom colors
- **🔖 Smart Bookmarks**: Automatic favicon detection and URL validation
- **🎨 Beautiful UI**: Modern, responsive design with dark/light theme support
- **⚡ Fast Performance**: Built with Next.js 15 and optimized for speed
- **📱 Mobile Friendly**: Responsive design that works on all devices
- **🔍 Easy Search**: Quick access to your organized bookmarks
- **🔄 Real-time Updates**: Instant feedback when adding or editing bookmarks
- **🔒 Data Privacy**: Each user's bookmarks are completely isolated

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Authentication**: NextAuth.js with Google OAuth
- **Styling**: Tailwind CSS, Radix UI Components
- **Database**: MongoDB with Mongoose ODM
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Validation**: Zod
- **Theme**: Next Themes (Dark/Light mode)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/stashr.git
   cd stashr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in the following variables in `.env.local`:
   - `MONGODB_URI`: Your MongoDB connection string
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for development)
   - `NEXTAUTH_SECRET`: A random secret key (generate with `openssl rand -base64 32`)
   - `GOOGLE_CLIENT_ID`: Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

4. **Set up Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to "Credentials" and create an OAuth 2.0 Client ID
   - Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
   - Copy the Client ID and Client Secret to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

## 📁 Project Structure

```
stashr/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # NextAuth.js routes
│   │   │   ├── bookmarks/     # Bookmark API endpoints
│   │   │   └── folders/       # Folder API endpoints
│   │   ├── auth/              # Authentication pages
│   │   ├── folder/            # Protected folder management
│   │   └── (landing)/         # Public landing page
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── bookmark/          # Bookmark management components
│   │   ├── layouts/           # Layout components
│   │   └── ui/                # Reusable UI components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── mongodb.ts        # Database connection
│   │   └── utils.ts          # Utility functions
│   ├── models/               # Mongoose models
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── middleware.ts            # NextAuth middleware
```

## 🔐 Authentication

Stashr uses NextAuth.js with Google OAuth for secure user authentication. Each user's bookmarks and folders are completely isolated and protected.

### Features:
- **Google OAuth**: One-click sign-in with Google
- **Session Management**: Secure session handling with JWT
- **Route Protection**: Middleware protects all bookmark management routes
- **User Isolation**: Each user can only access their own data

## 🗄️ Database Schema

### User (Managed by NextAuth.js)
- `id`: Unique user identifier
- `name`: User's display name
- `email`: User's email address
- `image`: User's profile picture

### Folder
- `name`: Folder name (unique per user)
- `description`: Optional folder description
- `color`: Hex color code for folder styling
- `userId`: Reference to the user who owns the folder
- `bookmarks`: Array of bookmark IDs
- `createdAt`, `updatedAt`: Timestamps

### Bookmark
- `title`: Bookmark title
- `url`: Bookmark URL
- `description`: Optional bookmark description
- `favicon`: Automatic favicon URL
- `userId`: Reference to the user who owns the bookmark
- `folderId`: Reference to the folder containing the bookmark
- `createdAt`, `updatedAt`: Timestamps

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Update Google OAuth**
   - Add your production domain to Google OAuth redirect URIs
   - Update `NEXTAUTH_URL` in environment variables

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Authentication with [NextAuth.js](https://next-auth.js.org/)
- Database with [MongoDB](https://www.mongodb.com/)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://x.com/lokendratwt">Lokendra</a></p>
</div>