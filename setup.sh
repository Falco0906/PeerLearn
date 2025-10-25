#!/bin/bash

echo "🎓 KLH Peer Learning Platform - Setup Script"
echo "============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your MongoDB URI and other settings"
else
    echo "✅ .env file already exists"
fi

echo "📥 Installing backend dependencies..."
npm install

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
else
    echo "✅ .env file already exists"
fi

echo "📥 Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "============================================="
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit backend/.env with your MongoDB URI"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm start"
echo ""
echo "🌐 Frontend will run on: http://localhost:3000"
echo "🔌 Backend will run on: http://localhost:5000"
echo ""
echo "Happy Learning! 🚀"
