# ADHD Learning Hub - Windows Deployment Script
# PowerShell script for quick deployment setup

Write-Host "🚀 ADHD Learning Hub Deployment Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Set Git path
$gitPath = "C:\Program Files\Git\bin\git.exe"

# Check if git is available
if (-not (Test-Path $gitPath)) {
    Write-Host "❌ Error: Git not found. Please install Git for Windows." -ForegroundColor Red
    exit 1
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📁 Initializing Git repository..." -ForegroundColor Yellow
    & $gitPath init
}

# Add all files to git
Write-Host "📝 Adding files to Git..." -ForegroundColor Yellow
& $gitPath add .

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
& $gitPath commit -m "Initial commit - ADHD Learning Hub ready for deployment"

# Instructions for GitHub setup
Write-Host ""
Write-Host "✅ Git repository prepared!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub named 'adhd-learning-hub'" -ForegroundColor White
Write-Host "2. Copy and run these commands to add the remote:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/adhd-learning-hub.git" -ForegroundColor Gray
Write-Host "3. Push to GitHub:" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Cloudflare Pages Setup:" -ForegroundColor Cyan
Write-Host "   - Go to https://dash.cloudflare.com" -ForegroundColor White
Write-Host "   - Navigate to Pages → Create a project" -ForegroundColor White
Write-Host "   - Connect to Git → Select your repository" -ForegroundColor White
Write-Host "   - Build settings:" -ForegroundColor White
Write-Host "     Framework: Astro" -ForegroundColor Gray
Write-Host "     Build command: npm run build" -ForegroundColor Gray
Write-Host "     Output directory: dist" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Your ADHD Learning Hub will be live in minutes!" -ForegroundColor Green

# Test build locally
Write-Host ""
Write-Host "🔧 Testing local build..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build successful! Ready for deployment." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Build failed. Please check the errors above." -ForegroundColor Red
}
