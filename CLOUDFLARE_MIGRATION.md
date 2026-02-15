# 🚀 Cloudflare Workers + D1 Migration Guide

This guide walks you through migrating your Next.js CMS to Cloudflare Workers with D1 database.

## 📋 Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Domain (Optional)**: For custom domain deployment
3. **Node.js**: Version 18 or later

## 🔧 Migration Steps

### Step 1: Install Dependencies

The necessary dependencies are already installed:
- `wrangler` - Cloudflare CLI tool
- `@cloudflare/workers-types` - TypeScript definitions

### Step 2: Configure Cloudflare

1. **Login to Cloudflare**:
   ```bash
   npx wrangler login
   ```
   This will open a browser window for authentication.

2. **Get your Account ID** (optional):
   ```bash
   npx wrangler whoami
   ```
   Update `wrangler.toml` with your account ID if needed.

### Step 3: Deploy Using the Automated Script

Run the automated deployment script:

```bash
./deploy-workers.sh
```

This script will:
- ✅ Create a D1 database
- ✅ Deploy the database schema
- ✅ Insert seed data
- ✅ Deploy your CMS to Cloudflare Workers

### Step 4: Manual Deployment (Alternative)

If you prefer manual control:

1. **Create D1 Database**:
   ```bash
   npx wrangler d1 create cms-prototype-db
   ```

2. **Update `wrangler.toml`** with the returned database ID.

3. **Deploy Schema**:
   ```bash
   npx wrangler d1 execute cms-prototype-db --file=migrations/d1-schema.sql
   ```

4. **Deploy Seed Data**:
   ```bash
   npx wrangler d1 execute cms-prototype-db --file=migrations/d1-seed.sql
   ```

5. **Deploy Worker**:
   ```bash
   npx wrangler deploy
   ```

## 🌐 Custom Domain Setup (Optional)

1. **Add your domain to Cloudflare**:
   - Add your domain in the Cloudflare dashboard
   - Update your DNS nameservers

2. **Configure Custom Domain**:
   ```bash
   npx wrangler domains add your-cms-domain.com
   ```

3. **Update `wrangler.toml`**:
   ```toml
   routes = [
     { pattern = "your-cms-domain.com/*", custom_domain = true }
   ]
   ```

4. **Redeploy**:
   ```bash
   npx wrangler deploy
   ```

## 🔍 Development & Testing

### Local Development
```bash
npm run workers:dev
```
This starts a local development server with D1 database.

### View Logs
```bash
npm run workers:tail
```
View real-time logs from your deployed Worker.

### Database Operations
```bash
# Create local D1 database for development
npm run db:local

# Deploy to remote D1 database
npm run db:remote

# Run migrations only
npm run db:migrations
```

## 🚀 Key Features in Workers Version

### ⚡ **Performance**
- **Global Edge Deployment**: Your CMS runs on 275+ locations worldwide
- **Zero Cold Starts**: Instant response times
- **Automatic Scaling**: Handles millions of requests seamlessly

### 🛡️ **Security**
- **Built-in DDoS Protection**: Cloudflare's security at the edge
- **JWT Authentication**: Stateless authentication system
- **Content Security Policy**: Enhanced security headers

### 💾 **Database**
- **D1 SQLite**: Global replication with strong consistency
- **Automatic Backups**: Point-in-time recovery
- **Schema Migrations**: Version-controlled database changes

### 🌍 **Global**
- **Edge Caching**: Content delivered from the nearest location
- **99.99% Uptime**: Enterprise-grade reliability
- **Custom Domains**: Use your own domain with SSL

## 🔄 Data Migration from MySQL

If you have existing data in MySQL, here's how to migrate:

### 1. Export MySQL Data
```bash
# Export users
mysqldump --no-create-info cms_prototype users > users.sql

# Export posts
mysqldump --no-create-info cms_prototype posts > posts.sql

# Export categories
mysqldump --no-create-info cms_prototype categories > categories.sql
```

### 2. Convert to SQLite Format
The main changes needed:
- `TRUE/FALSE` → `1/0`
- `AUTO_INCREMENT` → Remove (handled by SQLite)
- `ENUM` types → Use `CHECK` constraints

### 3. Import to D1
```bash
npx wrangler d1 execute cms-prototype-db --file=converted_data.sql
```

## 🎯 Production Configuration

### Environment Variables
Set these using Wrangler secrets:

```bash
# JWT secret
npx wrangler secret put JWT_SECRET

# Admin email
npx wrangler secret put ADMIN_EMAIL
```

### Performance Tuning
```toml
# wrangler.toml
[build]
minify = true

[deploy]
minify = true
```

## 📊 Monitoring & Analytics

### Built-in Analytics
- View request metrics in Cloudflare dashboard
- Monitor error rates and response times
- Track geographic distribution of users

### Custom Logging
```bash
# View real-time logs
npx wrangler tail

# Filter logs
npx wrangler tail --format json
```

## 🔧 Troubleshooting

### Common Issues

1. **Database ID Not Found**:
   ```bash
   npx wrangler d1 list
   # Update wrangler.toml with correct database_id
   ```

2. **Authentication Errors**:
   ```bash
   npx wrangler login
   # Re-authenticate with Cloudflare
   ```

3. **Database Migration Errors**:
   ```bash
   # Check D1 database status
   npx wrangler d1 info cms-prototype-db
   ```

4. **Deployment Failures**:
   ```bash
   # Check syntax
   npx wrangler deploy --dry-run
   
   # View detailed errors
   npx wrangler tail
   ```

### Getting Help

- **Cloudflare Discord**: [discord.gg/cloudflaredev](https://discord.gg/cloudflaredev)
- **Documentation**: [developers.cloudflare.com](https://developers.cloudflare.com)
- **Workers Examples**: [github.com/cloudflare/workers-examples](https://github.com/cloudflare/workers-examples)

## 🎉 Success!

After deployment, your CMS will be available at:
- **Workers Domain**: `https://cms-prototype.your-subdomain.workers.dev`
- **Custom Domain**: `https://your-domain.com` (if configured)

### Default Login
- **Email**: `admin@example.com`
- **Password**: `admin123`

### Next Steps
1. 🔐 Change default admin password
2. 🌐 Configure custom domain
3. 👥 Create additional user accounts
4. 📝 Start creating content
5. 🎨 Customize the design

---

## 💰 Cost Estimation

Cloudflare Workers pricing is very affordable:

- **Free Tier**: 100,000 requests/day
- **Paid Tier**: $5/month for 10M requests
- **D1 Database**: $5/month for 25M row reads/writes

For most CMS use cases, you'll stay within the free tier! 🎯