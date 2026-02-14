# MySQL Database Setup Guide

Follow these steps to set up your MySQL database for the CMS prototype.

## Step 1: Create Database and User

```sql
-- Connect to MySQL as root
sudo mysql -u root -p

-- Create the database
CREATE DATABASE cms_prototype;

-- Create user with proper permissions
CREATE USER 'cms_user'@'localhost' IDENTIFIED BY 'secure_password_123';

-- Grant all necessary permissions
GRANT ALL PRIVILEGES ON cms_prototype.* TO 'cms_user'@'localhost';

-- Grant global permissions needed for foreign key operations
GRANT REFERENCES ON *.* TO 'cms_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Test the connection
USE cms_prototype;
SELECT 'Database ready!' as status;

-- Exit MySQL
EXIT;
```

## Step 2: Test Connection

```bash
# Test the connection with your new user
mysql -u cms_user -p cms_prototype

# You should be able to connect without errors
```

## Step 3: Update Environment Variables

Update your `.env.local` file:

```env
DATABASE_URL="mysql://cms_user:secure_password_123@localhost:3306/cms_prototype"
DB_HOST=localhost
DB_PORT=3306
DB_USER=cms_user
DB_PASSWORD=secure_password_123
DB_NAME=cms_prototype
```

## Step 4: Test Database Connection

Before initializing, test the connection:

```bash
# Start your development server
npm run dev

# In another terminal, test the database connection
curl http://localhost:3000/api/test-db
```

You should see a successful response with:
- `connected: true`
- A test query result
- Empty tables array (before initialization)

## Step 5: Initialize Database

Go to `http://localhost:3000/admin/setup` and click "Initialize Database".

## Troubleshooting

### Error: "Access denied for user"
- Check username/password in `.env.local`
- Verify user exists: `SELECT User, Host FROM mysql.user WHERE User='cms_user';`

### Error: "Database 'cms_prototype' doesn't exist"
```sql
CREATE DATABASE cms_prototype;
```

### Error: "Table 'cms_prototype.users' doesn't exist"
- The database exists but isn't initialized
- Go to `/admin/setup` to initialize

### Error: "Cannot add foreign key constraint" 
- Make sure user has REFERENCES permission:
```sql
GRANT REFERENCES ON *.* TO 'cms_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Syntax error near..."
- Check MySQL version: `SELECT VERSION();`
- This CMS requires MySQL 5.7+ or 8.0+

### Connection timeout errors
```sql
-- Check MySQL is running
sudo systemctl status mysql

-- Start MySQL if stopped
sudo systemctl start mysql

-- Check if MySQL is listening on correct port
netstat -tlnp | grep :3306
```

### Character encoding issues
If you see weird characters, set proper encoding:

```sql
ALTER DATABASE cms_prototype CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Manual Table Creation (If Automatic Setup Fails)

If the automatic setup continues to fail, you can create tables manually:

```bash
# Connect to your database
mysql -u cms_user -p cms_prototype

# Copy and paste the contents of src/lib/sql/schema.sql
# Then copy and paste the contents of src/lib/sql/seed.sql
```

## Verify Installation

After successful setup:

1. **Check tables exist:**
```sql
SHOW TABLES;
```
Should show: categories, post_tags, posts, settings, tags, users

2. **Check sample data:**
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM posts;
SELECT COUNT(*) FROM categories;
```

3. **Test login:**
   - Go to `http://localhost:3000/admin`
   - Login: `admin@example.com` / `admin123`

## Security Notes

- Change the default admin password after first login
- Use a strong password for your MySQL user
- In production, use environment variables, not hardcoded passwords
- Consider using SSL/TLS for MySQL connections in production

## Performance Tips

```sql
-- For better performance, add these to your MySQL config
-- /etc/mysql/mysql.conf.d/mysqld.cnf

[mysqld]
innodb_buffer_pool_size = 256M
query_cache_type = 1
query_cache_size = 64M
```