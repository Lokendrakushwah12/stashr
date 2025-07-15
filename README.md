<div align="center">
  <img src="https://stashr.vercel.app/favicon.svg" alt="Stashr Logo" width="64" height="64">
  <h1>Stashr</h1>
</div>

A modern, fast, and beautiful bookmark management application built with Next.js, TypeScript, and MongoDB. Organize your web bookmarks into colorful folders with an intuitive interface.

## ✨ Features

- **📁 Folder Organization**: Create and manage bookmark folders with custom colors
- **🔖 Smart Bookmarks**: Automatic favicon detection and URL validation
- **🎨 Beautiful UI**: Modern, responsive design with dark/light theme support
- **⚡ Fast Performance**: Built with Next.js 15 and optimized for speed
- **📱 Mobile Friendly**: Responsive design that works on all devices
- **🔍 Easy Search**: Quick access to your organized bookmarks
- **🔄 Real-time Updates**: Instant feedback when adding or editing bookmarks

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
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
   
   Edit `.env.local` and add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb://localhost:27017/stashr
   # or for MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stashr
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbo
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run typecheck` - Run TypeScript type checking
- `npm run format:write` - Format code with Prettier
- `npm run format:check` - Check code formatting

## 📁 Project Structure

```
stashr/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (landing)/         # Landing page components
│   │   ├── api/               # API routes
│   │   │   ├── bookmarks/     # Bookmark CRUD operations
│   │   │   └── folders/       # Folder CRUD operations
│   │   └── folder/            # Folder detail pages
│   ├── components/            # Reusable UI components
│   │   ├── bookmark/          # Bookmark-specific components
│   │   ├── ui/               # Base UI components (shadcn/ui)
│   │   └── layouts/          # Layout components
│   ├── lib/                  # Utility libraries
│   ├── models/               # MongoDB/Mongoose models
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
└── styles/                   # Global styles
```

## 🗄️ Database Schema

### Folder Model
- `name` (required): Unique folder name
- `description`: Optional folder description
- `color`: Hex color code for folder styling
- `bookmarks`: Array of bookmark ObjectIds
- `createdAt` / `updatedAt`: Timestamps

### Bookmark Model
- `title` (required): Bookmark title
- `url` (required): Valid URL with automatic validation
- `description`: Optional bookmark description
- `favicon`: Auto-generated favicon URL
- `createdAt` / `updatedAt`: Timestamps

## 🎯 Usage

### Creating Folders
1. Click the "Add Folder" button
2. Enter a folder name and optional description
3. Choose a color for your folder
4. Click "Create Folder"

### Adding Bookmarks
1. Navigate to a folder
2. Click "Add Bookmark"
3. Enter the URL (title and favicon are auto-detected)
4. Add an optional description
5. Click "Add Bookmark"

### Managing Bookmarks
- Edit bookmarks by clicking the edit icon
- Delete bookmarks with the delete button
- Organize bookmarks by moving them between folders

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |

### Customization

- **Colors**: Modify the default folder colors in `src/models/Folder.ts`
- **Styling**: Customize the design system in `tailwind.config.ts`
- **Components**: Extend UI components in `src/components/ui/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
---

Made with ❤️ and minimalism.