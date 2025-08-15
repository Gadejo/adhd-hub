#!/bin/bash

# ADHD Learning Hub - Quick Deployment Script
# This script automates the GitHub and Cloudflare Pages setup

echo "🚀 ADHD Learning Hub Deployment Script"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# Add all files to git
echo "📝 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit - ADHD Learning Hub ready for deployment"

# Instructions for GitHub setup
echo ""
echo "✅ Git repository prepared!"
echo ""
echo "🔗 Next steps:"
echo "1. Create a new repository on GitHub named 'adhd-learning-hub'"
echo "2. Copy and run this command to add the remote:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/adhd-learning-hub.git"
echo "3. Push to GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "4. Go to Cloudflare Pages dashboard:"
echo "   - Connect to Git"
echo "   - Select your repository"
echo "   - Use these build settings:"
echo "     Framework: Astro"
echo "     Build command: npm run build"
echo "     Output directory: dist"
echo ""
echo "🎉 Your ADHD Learning Hub will be live in minutes!"
