#!/bin/bash
set -e

echo "🚀 Deploying CMS to Cloudflare Workers with D1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
if ! command -v npx wrangler &> /dev/null; then
    print_error "Wrangler CLI not found. Installing..."
    npm install wrangler --save-dev
fi

# Check if user is logged in to Cloudflare
print_status "Checking Cloudflare authentication..."
if ! npx wrangler whoami &> /dev/null; then
    print_warning "Not logged in to Cloudflare. Please login first:"
    echo "Run: npx wrangler login"
    exit 1
fi

# Step 1: Create D1 database if it doesn't exist
print_status "Creating D1 database (if not exists)..."
DB_OUTPUT=$(npx wrangler d1 create cms-prototype-db 2>&1 || true)

# Extract database ID from output
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'database_id = "[^"]*"' | cut -d'"' -f2 || true)

if [ -z "$DB_ID" ]; then
    print_warning "Database might already exist. Checking existing databases..."
    npx wrangler d1 list
    echo ""
    print_error "Please update wrangler.toml with your database_id manually"
    print_error "You can find it by running: npx wrangler d1 list"
    echo ""
else
    print_status "Database created with ID: $DB_ID"
    
    # Update wrangler.toml with the database ID
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/database_id = \"your-d1-database-id\"/database_id = \"$DB_ID\"/" wrangler.toml
    else
        # Linux
        sed -i "s/database_id = \"your-d1-database-id\"/database_id = \"$DB_ID\"/" wrangler.toml
    fi
    
    print_status "Updated wrangler.toml with database ID"
fi

# Step 2: Deploy database schema
print_status "Deploying database schema..."
if ! npx wrangler d1 execute cms-prototype-db --file=migrations/d1-schema.sql; then
    print_error "Failed to deploy database schema"
    exit 1
fi

# Step 3: Deploy seed data
print_status "Deploying seed data..."
if ! npx wrangler d1 execute cms-prototype-db --file=migrations/d1-seed.sql; then
    print_warning "Failed to deploy seed data (might already exist)"
fi

# Step 4: Deploy the Worker
print_status "Deploying Cloudflare Worker..."
if npx wrangler deploy; then
    print_status "🎉 Deployment successful!"
    echo ""
    print_status "Your CMS is now deployed! Check the URL provided above."
    print_status "Default login: admin@example.com / admin123"
    echo ""
    print_status "Useful commands:"
    echo "  - View logs: npm run workers:tail"
    echo "  - Local development: npm run workers:dev"
    echo "  - Re-deploy: npm run workers:deploy"
else
    print_error "Deployment failed"
    exit 1
fi