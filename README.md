# CMS Prototype

A powerful and flexible Content Management System built with Next.js, TypeScript, MySQL, and Tailwind CSS. Designed for easy migration to Cloudflare Workers and D1 database.

## Features

### ✨ Content Management
- **Posts Management**: Create, edit, publish, and organize blog posts
- **Categories**: Hierarchical category system with custom colors
- **Tags**: Flexible tagging system for better content organization
- **Rich Content**: Support for HTML content with built-in sanitization
- **SEO Optimization**: Custom meta titles and descriptions
- **View Tracking**: Built-in page view analytics

### 👥 User Management  
- **Multi-role System**: Admin, Editor, and Author roles
- **Secure Authentication**: Password hashing with bcrypt
- **Permission System**: Role-based access control
- **User Profiles**: Avatar support and user information

### 🎨 Modern Interface
- **Admin Dashboard**: Clean, responsive admin interface
- **Public Frontend**: Beautiful blog layout with responsive design
- **Real-time Stats**: Dashboard with content statistics
- **Mobile Friendly**: Fully responsive design

### 🔧 Technical Features
- **TypeScript**: Full type safety throughout the application
- **API-First**: RESTful API design
- **Database Abstraction**: Easy-to-migrate database layer
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Input sanitization and SQL injection protection

### 🚀 Migration Ready
- **Cloudflare Workers**: Designed for easy migration to edge computing
- **D1 Database**: Compatible with SQLite/D1 database structure
- **Scalable Architecture**: Built with horizontal scaling in mind

## Quick Start

### Prerequisites
- Node.js 20.9.0+ (required for Next.js 15)
- MySQL 5.7+ or 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cms-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Update `.env.local` with your database configuration:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/cms_prototype"
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=cms_prototype
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Initialize database**
   - Visit `http://localhost:3000/admin/setup`
   - Click "Initialize Database" to create tables and seed data

6. **Access admin panel**
   - Go to `http://localhost:3000/admin`
   - Default login: `admin@example.com` / `admin123`

## Project Structure

```
cms-prototype/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── admin/             # Admin interface pages
│   │   ├── api/               # API routes
│   │   ├── blog/              # Public blog pages
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   ├── blog/             # Blog frontend components  
│   │   └── ui/               # Reusable UI components
│   ├── lib/                  # Utility libraries
│   │   ├── api-utils.ts      # API helper functions
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── db.ts             # Database connection
│   │   └── sql/              # Database schema and seeds
│   ├── models/               # Data models (Repository pattern)
│   └── types/                # TypeScript type definitions
├── public/                   # Static assets
├── MIGRATION.md             # Cloudflare migration guide
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout  
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - List posts (with filtering)
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post by ID
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `GET /api/posts/slug/[slug]` - Get post by slug

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `GET /api/categories/[id]` - Get category
- `PUT /api/categories/[id]` - Update category
- `DELETE /api/categories/[id]` - Delete category

### Tags
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag(s)
- `GET /api/tags/[id]` - Get tag
- `PUT /api/tags/[id]` - Update tag
- `DELETE /api/tags/[id]` - Delete tag

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings
- `GET /api/settings/[key]` - Get specific setting
- `PUT /api/settings/[key]` - Update specific setting

### System
- `GET /api/setup` - Check database status
- `POST /api/setup` - Initialize/reset database

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **posts**: Blog posts and articles
- **categories**: Hierarchical content categories
- **tags**: Content tags
- **post_tags**: Many-to-many relationship
- **settings**: System configuration

### Key Features
- Foreign key relationships for data integrity
- Soft delete support for users
- Hierarchical categories with parent/child relationships
- Full-text search capabilities
- Audit trail with created/updated timestamps

## Authentication & Security

### Authentication
- Session-based authentication with HTTP-only cookies
- Password hashing using bcrypt
- Role-based access control (Admin, Editor, Author)
- Token-based API access

### Security Features
- Input validation and sanitization
- SQL injection protection via parameterized queries
- XSS protection with content sanitization
- CSRF protection with secure cookies
- Rate limiting ready (can be added)

## Admin Interface

### Dashboard
- Content statistics overview
- Recent posts listing
- System status indicators
- Quick action buttons

### Posts Management
- Rich text editor
- SEO optimization fields
- Category and tag assignment
- Scheduling and draft support
- Bulk operations

### User Management
- User role assignment
- Profile management
- Activity monitoring
- Permission control

### Settings
- Site configuration
- System preferences  
- Feature toggles
- Backup and restore

## Migration to Cloudflare

This CMS is designed for easy migration to Cloudflare's edge infrastructure:

- **Database**: MySQL → D1 (SQLite)
- **API**: Next.js API Routes → Cloudflare Workers
- **Storage**: Local files → R2 Object Storage
- **Authentication**: Sessions → JWT + KV Store
- **Frontend**: Can remain on Next.js or migrate to Workers

See [MIGRATION.md](./MIGRATION.md) for detailed migration guide.

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Style
- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commit messages
- Component-based architecture

### Testing Strategy
- API endpoint testing with proper error handling
- Database transaction testing
- Authentication flow testing
- Frontend component testing (can be added)

## Deployment Options

### Traditional Hosting
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Good alternative with edge functions
- **AWS/GCP/Azure**: Full control with container deployment
- **VPS**: Traditional server deployment

### Edge Computing (Recommended)
- **Cloudflare Workers**: Global edge deployment
- **Vercel Edge Functions**: Similar performance benefits  
- **Deno Deploy**: TypeScript-first edge platform

### Database Options
- **PlanetScale**: MySQL-compatible with scaling
- **Neon**: PostgreSQL with serverless scaling
- **Cloudflare D1**: SQLite at the edge
- **Supabase**: PostgreSQL with real-time features

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the [MIGRATION.md](./MIGRATION.md) for Cloudflare-specific guidance
- Review the API documentation above
- Examine the code - it's well-commented and structured

## Roadmap

### Phase 1 (Current)
- ✅ Basic CMS functionality
- ✅ Admin interface
- ✅ Authentication system
- ✅ MySQL database integration

### Phase 2 (Planned)
- 📋 Cloudflare Workers migration
- 📋 File upload and media management
- 📋 Comment system
- 📋 Email notifications

### Phase 3 (Future)
- 📋 Multi-site support
- 📋 Plugin system
- 📋 Advanced SEO features
- 📋 Analytics integration
- 📋 API webhooks
- 📋 Content versioning

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.