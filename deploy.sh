#!/bin/bash

# ==========================================
# CONFIGURATION
# ==========================================
# Replace these with your actual server details
SERVER_USER="u392776475"             # Your Hostinger SSH Username
SERVER_IP="153.92.8.173"            # Your Hostinger Server IP
SERVER_PORT="65002"                  # Hostinger usually uses a custom port (check your dashboard)
REMOTE_PROJECT_PATH="~/domains/klikkamera.com/project"      # Path to your Laravel project on the server
REMOTE_PUBLIC_PATH="~/domains/klikkamera.com/public_html"   # Path to your public_html (or wherever the site is served)

# ==========================================
# SCRIPT START
# ==========================================

echo "🚀 Starting Deployment..."

# 1. Build Assets Locally
echo "📦 Building assets locally..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Aborting deployment."
    exit 1
fi

# 2. Remove Hot File (Safety Check)
if [ -f "public/hot" ]; then
    echo "🔥 Removing public/hot file..."
    rm public/hot
fi

# 3. Sync Assets to Server
echo " Uploading build assets to server..."
# We use rsync to only upload changed files. 
# -a: archive mode (preserves permissions, etc.)
# -v: verbose
# -z: compress during transfer
# -e: specify ssh command with port
rsync -avz -e "ssh -p $SERVER_PORT" public/build/ $SERVER_USER@$SERVER_IP:$REMOTE_PROJECT_PATH/public/build/

if [ $? -ne 0 ]; then
    echo "❌ Asset upload failed! Aborting."
    exit 1
fi

# Also sync to public_html if your setup requires copying build files there
echo "📤 Uploading build assets to public_html..."
rsync -avz -e "ssh -p $SERVER_PORT" public/build/ $SERVER_USER@$SERVER_IP:$REMOTE_PUBLIC_PATH/build/


# 4. Remote Server Commands
echo "🔄 Running remote commands (Git Pull & Cache Clear)..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << EOF
    cd $REMOTE_PROJECT_PATH
    
    echo "⬇️  Pulling latest code..."
    git pull origin main
    
    echo "🧹 Clearing caches..."
    php artisan view:clear
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    
    # Optional: Run migrations if needed
    # php artisan migrate --force
    
    echo "✅ Remote tasks complete."
EOF

echo "🎉 Deployment Finished Successfully!"
