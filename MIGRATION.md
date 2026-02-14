# Cloudflare Workers + D1 Migration Guide

This CMS prototype has been designed with Cloudflare Workers and D1 migration in mind. This document outlines the migration strategy and steps.

## Migration Strategy

### 1. Database Migration (MySQL → D1)

#### Schema Conversion
The current MySQL schema in `src/lib/sql/schema.sql` needs to be adapted for D1 (SQLite):

**Changes needed:**
- Remove `AUTO_INCREMENT` and use `INTEGER PRIMARY KEY` (SQLite auto-increment)
- Remove `ENUM` types and use `TEXT` with constraints
- Replace `LONGTEXT` with `TEXT`
- Update timestamp handling

#### Example Conversion:
```sql
-- MySQL
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTO_INCREMENT,
  role ENUM('admin', 'editor', 'author') DEFAULT 'author'
);

-- D1 (SQLite)
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  role TEXT DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author'))
);
```

### 2. Database Connection Layer

#### Current Implementation
The `Database` class in `src/lib/db.ts` provides an abstraction layer that makes migration easier.

#### D1 Adapter
Create a new D1 database adapter:

```typescript
// src/lib/d1-adapter.ts
export class D1Database {
  constructor(private db: D1Database) {}
  
  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    const result = await stmt.bind(...params).all();
    return result.results as T[];
  }
  
  async queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results[0] || null;
  }
  
  // ... other methods
}
```

### 3. API Routes Migration

#### Current Structure
API routes are in `src/app/api/*` using Next.js App Router.

#### Cloudflare Workers Structure
```
workers/
├── src/
│   ├── handlers/
│   │   ├── posts.ts
│   │   ├── categories.ts
│   │   ├── users.ts
│   │   └── auth.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── models/
│   │   └── (same as current)
│   └── index.ts
├── wrangler.toml
└── package.json
```

#### Example Worker Handler:
```typescript
// workers/src/handlers/posts.ts
import { Router } from 'itty-router';
import { PostModel } from '../models/Post';

const router = Router();

router.get('/api/posts', async (request, env) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  
  const { posts, total } = await PostModel.getAll({ page, limit });
  
  return Response.json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export { router as postsRouter };
```

### 4. Authentication Migration

#### Current Implementation
Uses HTTP-only cookies and simple token-based auth.

#### Cloudflare Workers Adaptation
- Use Cloudflare's edge sessions or JWT tokens
- Store session data in KV for scalability
- Implement rate limiting with Durable Objects

```typescript
// workers/src/auth.ts
export async function authenticateRequest(request: Request, env: Env) {
  const token = getCookie(request, 'auth-token');
  if (!token) return null;
  
  // Verify token and get user from D1
  const user = await verifyAndGetUser(token, env.DB);
  return user;
}
```

### 5. Frontend Migration Options

#### Option 1: Keep Next.js (Recommended)
- Deploy Next.js frontend to Vercel/Netlify
- Point API calls to Cloudflare Workers
- Update API base URL in environment variables

#### Option 2: Static Site Generation
- Generate static site from Next.js
- Deploy to Cloudflare Pages
- Use Workers for API

#### Option 3: Full Migration to Workers
- Use Hono.js or similar framework
- Serve HTML directly from Workers
- Use HTMLRewriter for dynamic content

### 6. File Storage Migration

#### Current: Local file system
#### Cloudflare: R2 Object Storage

```typescript
// workers/src/storage.ts
export async function uploadFile(file: File, bucket: R2Bucket): Promise<string> {
  const key = `uploads/${Date.now()}-${file.name}`;
  await bucket.put(key, file.stream());
  return `https://your-domain.com/${key}`;
}
```

## Migration Steps

### Phase 1: Database Migration
1. Create D1 database: `wrangler d1 create cms-database`
2. Convert schema to SQLite-compatible format
3. Export MySQL data to SQL format
4. Import data to D1: `wrangler d1 execute cms-database --file=migration.sql`

### Phase 2: Workers Setup
1. Initialize Workers project: `wrangler init cms-workers`
2. Copy and adapt model classes
3. Create route handlers for each API endpoint
4. Set up authentication middleware
5. Configure D1 bindings in `wrangler.toml`

### Phase 3: Frontend Updates
1. Update API base URL configuration
2. Handle CORS if needed
3. Update authentication flow
4. Test all functionality

### Phase 4: Deployment
1. Deploy Workers: `wrangler deploy`
2. Update DNS/routing
3. Monitor and optimize

## Configuration Files

### wrangler.toml
```toml
name = "cms-workers"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "cms-database"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"

[vars]
ENVIRONMENT = "production"
```

### Environment Variables
```
# Cloudflare Workers
DB_BINDING = "DB"
KV_SESSIONS = "SESSIONS"
JWT_SECRET = "your-jwt-secret"
CORS_ORIGIN = "https://your-frontend-domain.com"
```

## Benefits of Migration

### Performance
- Global edge deployment
- Sub-100ms response times worldwide
- Automatic scaling

### Cost
- Pay-per-request pricing
- No idle server costs
- Included free tier

### Reliability
- Built-in redundancy
- No cold starts (compared to Lambda)
- 99.9% uptime SLA

### Developer Experience
- Git-based deployments
- Built-in analytics
- Easy rollbacks

## Considerations

### Limitations
- 10MB response limit
- 30-second execution limit (longer for Durable Objects)
- D1 has some SQLite limitations

### Workarounds
- Use streaming responses for large data
- Implement pagination properly
- Use Durable Objects for long-running tasks
- Consider R2 for large file storage

## Testing Strategy

1. **Local Development**: Use Wrangler dev mode
2. **Staging**: Deploy to staging environment
3. **Data Migration**: Test with subset of production data
4. **Performance**: Load test critical endpoints
5. **Rollback Plan**: Keep current system running during migration

## Timeline Estimate

- **Phase 1** (Database): 1-2 days
- **Phase 2** (Workers): 3-5 days
- **Phase 3** (Frontend): 1-2 days
- **Phase 4** (Deployment): 1 day
- **Testing & Optimization**: 2-3 days

**Total: 8-13 days** depending on complexity and testing requirements.