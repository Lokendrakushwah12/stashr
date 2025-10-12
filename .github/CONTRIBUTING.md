# Contributing to Stashr

Thank you for your interest in contributing to Stashr! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/) (local or cloud instance)

### Setup

1. **Fork the repository**
   
   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork locally**
   
   ```bash
   git clone https://github.com/lokendrakushwah12/stashr.git
   cd stashr
   ```

3. **Install dependencies**
   
   ```bash
   npm install
   # or
   pnpm install
   ```

4. **Set up environment variables**
   
   Copy the example environment file:
   
   ```bash
   # Unix/Linux/Mac
   cp env.example .env.local
   
   # Windows Command Prompt
   copy env.example .env.local
   
   # Windows PowerShell
   Copy-Item env.example .env.local
   ```

5. **Configure your `.env.local` file:**
   
   ```bash
   # MongoDB Connection
   MONGODB_URI="mongodb://localhost:27017/stashr"
   # or use MongoDB Atlas
   # MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/stashr"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-here"
   
   # Google OAuth (for authentication)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```
   
   **Generate NEXTAUTH_SECRET:**
   
   ```bash
   # Unix/Linux/Mac
   openssl rand -base64 32
   
   # Windows PowerShell
   [System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   
   # Cross-platform (using Node.js)
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

6. **Start the development server**
   
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
   
   The application will be available at `http://localhost:3000`

## What to Focus On

**🎯 Good Areas to Contribute:**

- **Board & Timeline Features** - Collaboration, timeline entries, board management
- **Bookmark Management** - Folder organization, bookmark cards, import/export
- **Collaboration System** - Invitations, permissions, role management
- **UI/UX Improvements** - Better user experience, accessibility, responsiveness
- **Performance Optimizations** - Query optimization, loading states, caching
- **Documentation** - Code comments, README updates, user guides
- **Testing** - Unit tests, integration tests, E2E tests
- **Bug Fixes** - Any reported issues or unexpected behavior

**💡 Feature Ideas Welcome:**

- Semantic search and AI-powered suggestions
- Public board/folder sharing improvements
- Mobile app development
- Browser extension for quick bookmarking
- Export to other tools (Notion, Linear, etc.)
- Rich text and markdown enhancements

## Development Workflow

### Project Structure

```
stashr/
├── src/
│   ├── app/                          # Next.js app directory (pages & API routes)
│   │   ├── (dashboard)/              # Dashboard route group (protected routes)
│   │   │   ├── board/                # Boards feature
│   │   │   │   ├── [id]/             # Individual board detail page
│   │   │   │   └── page.tsx          # All boards listing
│   │   │   ├── bookmarks/            # Bookmarks feature
│   │   │   │   ├── [id]/             # Individual bookmark folder page
│   │   │   │   └── page.tsx          # All bookmark folders listing
│   │   │   ├── inbox/                # Collaboration invitations
│   │   │   │   └── page.tsx          # Inbox page
│   │   │   ├── profile/              # User profile
│   │   │   │   └── page.tsx          # Profile settings page
│   │   │   └── layout.tsx            # Dashboard layout with sidebar
│   │   ├── (landing)/                # Landing page route group
│   │   │   ├── _components/          # Landing page components
│   │   │   ├── layout.tsx            # Landing layout
│   │   │   └── page.tsx              # Home page
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # NextAuth endpoints
│   │   │   │   └── [...nextauth]/
│   │   │   ├── boards/               # Board API
│   │   │   │   ├── [id]/             # Board CRUD
│   │   │   │   │   ├── collaborators/ # Manage collaborators
│   │   │   │   │   ├── timeline/     # Timeline entries
│   │   │   │   │   └── route.ts      # GET, PUT, DELETE board
│   │   │   │   ├── collaborations/   # Accept/decline invitations
│   │   │   │   └── route.ts          # GET all boards, POST create
│   │   │   ├── bookmarks/            # Bookmark API
│   │   │   │   ├── [id]/             # Bookmark CRUD
│   │   │   │   └── route.ts          # Create bookmark
│   │   │   ├── folders/              # Folder API
│   │   │   │   ├── [id]/             # Folder CRUD
│   │   │   │   └── route.ts          # GET all folders, POST create
│   │   │   ├── collaborations/       # Folder collaboration
│   │   │   ├── user/                 # User profile API
│   │   │   └── admin/                # Admin endpoints
│   │   ├── auth/                     # Auth pages
│   │   │   └── signin/               # Sign in page
│   │   ├── public/                   # Public shared folders
│   │   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx                # Root layout
│   │   └── not-found.tsx             # 404 page
│   ├── components/                   # React components
│   │   ├── board/                    # Board-related components
│   │   │   ├── BoardTimelineEditor.tsx      # Timeline collaboration UI
│   │   │   ├── BoardCollaboratorDialog.tsx  # Manage collaborators
│   │   │   ├── BoardListCard.tsx            # Board card in list
│   │   │   └── AddBoardDialog.tsx           # Create board dialog
│   │   ├── bookmark/                 # Bookmark components
│   │   │   ├── BookmarkCard.tsx      # Individual bookmark
│   │   │   ├── FolderCard.tsx        # Folder card in list
│   │   │   ├── AddBookmarkDialog.tsx # Create bookmark
│   │   │   ├── AddFolderDialog.tsx   # Create folder
│   │   │   └── ImportExportDialog.tsx # Import/export bookmarks
│   │   ├── folder/                   # Folder-specific components
│   │   │   └── CollaboratorDialog.tsx # Folder collaboration
│   │   ├── layouts/                  # Layout components
│   │   │   ├── sidebar/              # Sidebar navigation
│   │   │   │   ├── configs/          # Sidebar configurations
│   │   │   │   └── Sidebar.tsx       # Main sidebar component
│   │   │   ├── DashboardBreadcrumb.tsx # Breadcrumb navigation
│   │   │   └── theme-toggle.tsx      # Dark/light mode toggle
│   │   ├── notifications/            # Notification components
│   │   │   └── CollaborationInvite.tsx # Invitation cards
│   │   ├── auth/                     # Auth components
│   │   │   └── user-menu.tsx         # User profile menu
│   │   └── ui/                       # Reusable UI components (shadcn/ui)
│   │       ├── button.tsx, input.tsx, dialog.tsx, etc.
│   │       ├── inline-edit.tsx       # Inline editing component
│   │       ├── color-picker.tsx      # Color selection
│   │       └── tooltip.tsx           # Tooltip with date display
│   ├── lib/                          # Utilities and configurations
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-boards.ts         # Board data hooks
│   │   │   ├── use-bookmarks.ts      # Bookmark/folder hooks
│   │   │   ├── use-timeline.ts       # Timeline entry hooks
│   │   │   ├── use-board-collaborators.ts # Collaboration hooks
│   │   │   └── use-admin.ts          # Admin hooks
│   │   ├── api.ts                    # Centralized API client
│   │   ├── auth.ts                   # NextAuth configuration
│   │   ├── mongodb.ts                # MongoDB connection
│   │   ├── utils.ts                  # Utility functions
│   │   └── query-client.ts           # React Query config
│   ├── models/                       # Mongoose models
│   │   ├── Board.ts                  # Board schema
│   │   ├── BoardCard.ts              # Board card schema
│   │   ├── BoardCollaboration.ts     # Board collaboration schema
│   │   ├── BoardTimelineEntry.ts     # Timeline entry schema
│   │   ├── Folder.ts                 # Bookmark folder schema
│   │   ├── Bookmark.ts               # Bookmark schema
│   │   ├── FolderCollaboration.ts    # Folder collaboration schema
│   │   └── index.ts                  # Model registration
│   ├── types/                        # TypeScript type definitions
│   │   ├── api.ts                    # API request/response types
│   │   ├── models.ts                 # Data model types
│   │   ├── database.ts               # Mongoose document types
│   │   ├── auth.ts                   # Auth types
│   │   └── index.ts                  # Type exports
│   └── styles/                       # Global styles
│       └── globals.css               # Tailwind CSS
├── public/                           # Static assets
│   ├── favicon.ico, og.png, etc.
│   └── manifest.json                 # PWA manifest
├── .github/                          # GitHub configuration
│   ├── FUNDING.yml                   # Sponsor configuration
│   ├── CODE_OF_CONDUCT.md            # Community standards
│   ├── CONTRIBUTING.md               # This file
│   └── pull_request_template.md     # PR template
├── components.json                   # shadcn/ui config
├── next.config.js                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS config
├── package.json                      # Dependencies
└── README.md                         # Project documentation
```

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Database:** MongoDB with Mongoose
- **Authentication:** NextAuth.js
- **UI:** React, TailwindCSS, shadcn/ui
- **State Management:** React Query (TanStack Query)
- **Icons:** Phosphor Icons, Lucide React
- **Type Safety:** TypeScript

### Code Architecture

- **API Layer** (`src/lib/api.ts`) - Centralized API functions
- **Hooks** (`src/lib/hooks/`) - React Query hooks for data fetching
- **Models** (`src/models/`) - Mongoose schemas
- **Types** (`src/types/`) - TypeScript interfaces

**Important:** Always use the hooks and API layer instead of direct `fetch` calls!

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists
2. Use the bug report template
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots or screen recordings
   - Browser/OS information
   - Console errors (if any)

### Suggesting Features

1. Check existing feature requests
2. Use the feature request template
3. Explain:
   - The problem you're solving
   - Your proposed solution
   - Alternative approaches considered
   - Why this would benefit users

### Code Contributions

1. **Create a new branch:**
   
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   
   - Follow existing code patterns
   - Add TypeScript types (no `any` types!)
   - Write clean, readable code
   - Add comments for complex logic

3. **Test your changes**
   
   - Test manually in the browser
   - Check different user roles (owner, editor, viewer)
   - Test on mobile and desktop viewports

4. **Run linting:**
   
   ```bash
   npm run lint
   ```
   
   Fix any errors before committing.

5. **Commit your changes:**
   
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   **Commit Message Format:**
   
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvements
   - `test:` - Adding or updating tests
   - `chore:` - Build process or tooling changes

6. **Push to your fork:**
   
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   
   - Fill out the PR template completely
   - Link related issues
   - Provide clear description and screenshots
   - Request review from maintainers

## Code Style Guidelines

### TypeScript

- ✅ **Always use proper types** - No `any` types
- ✅ **Use `??` instead of `||`** for null/undefined coalescing
- ✅ **Use `type` imports** - `import type { ... }`
- ✅ **Await async params** - Next.js 15 requirement

### React

- ✅ **Use custom hooks** - Don't make direct API calls
- ✅ **Follow component patterns** - Check existing components
- ✅ **Use React Query** - For data fetching and mutations
- ✅ **Handle loading/error states** - Always provide feedback

### API Routes

- ✅ **Validate inputs** - Check permissions and data
- ✅ **Use Mongoose models** - Import from `registerModels()`
- ✅ **Return `.toObject()`** - Convert Mongoose docs to plain objects
- ✅ **Handle errors properly** - Log and return meaningful messages

### UI Components

- ✅ **Use shadcn/ui** - Prefer existing components
- ✅ **Follow design patterns** - Match existing UI style
- ✅ **Make it responsive** - Test on mobile and desktop
- ✅ **Accessibility** - Use semantic HTML and ARIA labels

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All linter errors are resolved
- [ ] Changes are tested locally
- [ ] No `any` types or direct `fetch` calls
- [ ] Types are properly defined
- [ ] Console logs removed (except necessary error logging)

### PR Template

Your PR should include:

1. **Clear title** - Following commit message format
2. **Description** - What changes were made and why
3. **Screenshots/Videos** - For UI changes
4. **Related issues** - Link to issue numbers
5. **Testing notes** - How to test the changes

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited in the release notes!

## Architecture Guidelines

### Adding a New Feature

1. **Define Types** (`src/types/`)
   - Add interfaces in `api.ts` for requests/responses
   - Add interfaces in `models.ts` for data structures

2. **Create Mongoose Model** (`src/models/`)
   - Define schema with proper validation
   - Add indexes for performance
   - Export model correctly

3. **Create API Routes** (`src/app/api/`)
   - Implement GET, POST, PUT, DELETE as needed
   - Validate permissions (owner/editor/viewer)
   - Use `registerModels()` and `connectDB()`

4. **Add API Functions** (`src/lib/api.ts`)
   - Create functions in appropriate namespace
   - Use `apiRequest` helper
   - Return proper types

5. **Create Custom Hooks** (`src/lib/hooks/`)
   - Create React Query hooks
   - Define query keys
   - Handle mutations with invalidation

6. **Build UI Components** (`src/components/`)
   - Use hooks, not direct API calls
   - Handle loading/error states
   - Follow existing component patterns

### Permission System

Stashr has three user roles:

- **Owner** - Full access (create, read, update, delete, manage collaborators)
- **Editor** - Can edit content (read, update)
- **Viewer** - Read-only access

Always check permissions in both frontend and backend!

## Common Tasks

### Adding a New API Endpoint

```typescript
// 1. Add type in src/types/api.ts
export interface CreateThingRequest {
  name: string;
  description?: string;
}

// 2. Add API function in src/lib/api.ts
async createThing(request: CreateThingRequest): Promise<ApiResponse<{ thing: Thing }>> {
  return apiRequest<{ thing: Thing }>('/things', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// 3. Create hook in src/lib/hooks/use-things.ts
export function useCreateThing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: CreateThingRequest) => {
      const response = await thingApi.createThing(request);
      if (response.error) throw new Error(response.error);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: thingKeys.all });
    },
  });
}

// 4. Use in component
const createThing = useCreateThing();
await createThing.mutateAsync({ name: "New Thing" });
```

## Getting Help

- **Issues:** [GitHub Issues](https://github.com/lokendrakushwah12/stashr/issues)
- **Discussions:** [GitHub Discussions](https://github.com/lokendrakushwah12/stashr/discussions)

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

By contributing to Stashr, you agree that your contributions will be licensed under the project's license.

---

**Thank you for making Stashr better!** 🚀
