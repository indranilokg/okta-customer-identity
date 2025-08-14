#!/bin/bash

echo "🚀 Setting up Okta Device Code Flow Demo..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Okta Configuration
REACT_APP_OKTA_ISSUER=https://ijtestcustom.oktapreview.com/oauth2/default
REACT_APP_OKTA_CLIENT_ID=0oa7ys6l9jyPahMQG1d7
REACT_APP_OKTA_REDIRECT_URI=http://localhost:3000/callback

# Server Configuration
PORT=3001
EOF
    echo "✅ .env file created"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Ensure your Okta application is configured for Device Authorization Grant"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "🔧 Available commands:"
echo "  npm run dev     - Start development server with proxy"
echo "  npm run build   - Build for production"
echo "  npm run prod    - Start production server"
echo "  npm run server  - Start proxy server only"
echo ""
echo "📚 For more information, see README.md" 