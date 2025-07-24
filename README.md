<div align="center">
  <img src="https://stashr.in/favicon.svg" alt="Stashr Logo" width="80" height="80">
  <h1>Stashr</h1>
  <p><strong>Organize Your Bookmarks</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-View_Online-blue?style=for-the-badge&logo=vercel)](https://stashr.in)
  [![Twitter Follow](https://img.shields.io/badge/Twitter-Follow-blue?style=for-the-badge&logo=twitter)](https://twitter.com/lokendratwt)
</div>

<br>

<div align="center">
  <img src="https://stashr.in/og.png" alt="Stashr Preview" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

<br>

**Stashr** is a modern, fast, and beautiful bookmark management application built with Next.js 15, TypeScript, and MongoDB. Organize your web bookmarks into colorful folders with an intuitive interface and secure user authentication powered by NextAuth.js.

## 🚀 Live Demo

**[Try Stashr Now →](https://stashr.in)**

## ✨ Key Features

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
- **🌙 Dark/Light Mode**: Seamless theme switching with system preference detection
- **📱 PWA Ready**: Install as a progressive web app for native-like experience
- **🔗 Shareable Links**: Direct links to specific folders and bookmarks
- **⚡ Instant Loading**: Optimized for fast page loads and smooth interactions

## 🚀 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 18](https://react.dev/)** - UI library with concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons

### Backend & Database
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[MongoDB](https://www.mongodb.com/)** - NoSQL database
- **[Mongoose](https://mongoosejs.com/)** - MongoDB object modeling
- **[MongoDB Adapter](https://next-auth.js.org/adapters/mongodb)** - NextAuth database adapter

### Development & Tools
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Dark/light mode
- **[Geist Font](https://vercel.com/font)** - Modern typeface by Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database
- Google OAuth credentials

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Lokendrakushwah12/stashr.git
   cd stashr
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in the following variables in `.env.local`:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stashr
   
   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

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
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run typecheck    # Run TypeScript type checking
npm run format       # Format code with Prettier

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
```

### Development Workflow

1. **Fork and clone** the repository
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and test locally
4. **Run linting** (`npm run lint`) and fix any issues
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to your branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

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
   - Connect your GitHub repository to [Vercel](https://vercel.com)
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Update Google OAuth**
   - Add your production domain to Google OAuth redirect URIs
   - Update `NEXTAUTH_URL` in environment variables

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** and test thoroughly
4. **Run linting** (`npm run lint`) and fix any issues
5. **Commit your changes** (`git commit -m 'Add amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features when possible
- Update documentation for any API changes
- Ensure all linting checks pass
- Write clear commit messages

### Issues

If you find a bug or have a feature request, please [open an issue](https://github.com/Lokendrakushwah12/stashr/issues) and we'll get back to you as soon as possible.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project wouldn't be possible without these amazing open-source projects:

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework
- **[Lucide React](https://lucide.dev/)** - Beautiful & consistent icons
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[MongoDB](https://www.mongodb.com/)** - The database for modern applications
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Vercel](https://vercel.com/)** - The platform for frontend developers

## 📊 Project Stats

<div align="center">
  <img src="https://img.shields.io/github/stars/Lokendrakushwah12/stashr?style=social" alt="GitHub Stars">
  <img src="https://img.shields.io/github/forks/Lokendrakushwah12/stashr?style=social" alt="GitHub Forks">
  <img src="https://img.shields.io/github/issues/Lokendrakushwah12/stashr" alt="GitHub Issues">
  <img src="https://img.shields.io/github/license/Lokendrakushwah12/stashr" alt="License">
</div>

---

<div align="center">
  <p>Made with ❤️ by <a href="https://x.com/lokendratwt">Lokendra</a></p>
  <p>
    <a href="https://stashr.in">🌐 Live Demo</a> • 
    <a href="https://twitter.com/lokendratwt">🐦 Twitter</a>
  </p>
</div>