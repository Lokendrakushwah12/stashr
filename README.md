<div align="center">
  <img src="https://stashr.in/favicon.svg" alt="Stashr Logo" width="80" height="80">
  <h1>Stashr</h1>
  <p><strong>Organize Your Bookmarks</strong></p>
</div>

<br>

<div align="center">
  <img src="https://stashr.in/og.png" alt="Stashr Preview" width="800" style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

<br>

**Stashr** is a modern, fast, and beautiful bookmark management application built with Next.js 15, TypeScript, and MongoDB. Organize your web bookmarks into colorful folders with an intuitive interface and secure user authentication powered by NextAuth.js.

## 🚀 Live Demo

**[Try Stashr Now →](https://stashr.in)**

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

---

<div align="center">
  <p>Made with ❤️ by <a href="https://x.com/lokendratwt">Lokendra</a></p>
  <p>
    <a href="https://stashr.in">🌐 Live Demo</a> • 
    <a href="https://twitter.com/lokendratwt">🐦 Twitter</a>
  </p>
</div>