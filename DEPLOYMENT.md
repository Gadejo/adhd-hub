# ADHD Learning Hub - Deployment Guide

## Overview
This guide covers deploying the ADHD Learning Hub application to Cloudflare Pages for fast, global CDN delivery with automatic deployments from GitHub.

## Prerequisites
- Git installed and configured
- Node.js 18+ installed
- GitHub account
- Cloudflare account (free tier is sufficient)

## Project Configuration
The project is configured as follows:
- **Framework**: Astro with static site generation
- **Styling**: Tailwind CSS
- **TypeScript**: Enabled
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18

## Deployment Steps

### Step 1: GitHub Repository Setup

1. **Navigate to project directory**:
   ```bash
   cd "C:\Users\corin\Documents\b\ADHD learning app\adhd-hub"
   ```

2. **Add Git remote** (if not already done):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/adhd-learning-hub.git
   ```

3. **Stage and commit all files**:
   ```bash
   git add .
   git commit -m "Initial commit - ADHD Learning Hub ready for deployment"
   ```

4. **Push to GitHub**:
   ```bash
   git branch -M main
   git push -u origin main
   ```

### Step 2: Cloudflare Pages Setup

#### Option A: Using Cloudflare Dashboard (Recommended)

1. **Login to Cloudflare Dashboard**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to "Pages" in the sidebar

2. **Create New Project**:
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose "GitHub" and authorize Cloudflare

3. **Configure Repository**:
   - Select your `adhd-learning-hub` repository
   - Choose the `main` branch

4. **Build Settings**:
   ```
   Framework preset: Astro
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   ```

5. **Environment Variables** (if needed):
   ```
   NODE_VERSION: 18
   NPM_VERSION: 9
   ```

6. **Deploy**:
   - Click "Save and Deploy"
   - Wait for the build to complete (typically 2-5 minutes)

#### Option B: Using Wrangler CLI

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create Pages project**:
   ```bash
   wrangler pages project create adhd-learning-hub
   ```

4. **Deploy**:
   ```bash
   npm run build
   wrangler pages publish dist --project-name adhd-learning-hub
   ```

### Step 3: Custom Domain Setup (Optional)

1. **Add Custom Domain**:
   - In Cloudflare Pages dashboard
   - Go to your project → "Custom domains"
   - Click "Set up a custom domain"
   - Enter your domain (e.g., `adhd-hub.yourdomain.com`)

2. **DNS Configuration**:
   - Add a CNAME record pointing to your Pages URL
   - Or use Cloudflare's DNS management

### Step 4: Automatic Deployments with GitHub Actions

The included GitHub Actions workflow (`.github/workflows/deploy.yml`) enables automatic deployments.

1. **Get Cloudflare API Token**:
   - Go to Cloudflare Dashboard → "My Profile" → "API Tokens"
   - Create token with "Cloudflare Pages:Edit" permissions
   - Get your Account ID from the right sidebar

2. **Configure GitHub Secrets**:
   - In your GitHub repository settings
   - Go to "Secrets and variables" → "Actions"
   - Add these secrets:
     ```
     CLOUDFLARE_API_TOKEN: your_api_token_here
     CLOUDFLARE_ACCOUNT_ID: your_account_id_here
     ```

3. **Test Automatic Deployment**:
   - Push changes to the main branch
   - Check the "Actions" tab in GitHub
   - Verify deployment in Cloudflare Pages dashboard

## Build Optimizations

### Performance Optimizations Applied:
- Static site generation for fast loading
- Automatic code splitting by Astro
- Tailwind CSS purging for minimal CSS
- Asset optimization and caching headers

### Additional Optimizations:
1. **Enable Cloudflare Analytics** (free):
   - In Pages dashboard → Analytics
   - Monitor performance and visitor data

2. **Configure Caching**:
   - The `_headers` file includes optimized caching rules
   - Static assets cached for 1 year
   - HTML files cached with smart invalidation

3. **Security Headers**:
   - XSS protection enabled
   - Content type sniffing disabled
   - Frame options for clickjacking prevention

## Monitoring and Maintenance

### Deployment Verification:
1. Check that the build completed successfully
2. Test all major features of the application
3. Verify responsive design on different devices
4. Check performance scores using Lighthouse

### Continuous Integration Checks:
- TypeScript compilation (`astro check`)
- Build process completion
- Asset optimization
- Link validation (if enabled)

### Troubleshooting Common Issues:

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs in Cloudflare dashboard

**404 Errors:**
- Ensure proper routing configuration in Astro
- Check that all assets are in the `public` directory
- Verify build output in `dist` directory

**Performance Issues:**
- Monitor Cloudflare Analytics
- Use browser dev tools for performance profiling
- Consider enabling additional Cloudflare features

## Maintenance Commands

```bash
# Update dependencies
npm update

# Rebuild and test locally
npm run build
npm run preview

# Deploy manually (if not using auto-deploy)
wrangler pages publish dist --project-name adhd-learning-hub

# Check build status
wrangler pages project list
```

## Support and Resources

- [Astro Documentation](https://docs.astro.build/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Project URLs
After deployment, your application will be available at:
- **Primary URL**: `https://adhd-learning-hub.pages.dev`
- **Custom Domain**: `https://your-custom-domain.com` (if configured)
- **GitHub Repository**: `https://github.com/YOUR_USERNAME/adhd-learning-hub`

---

**Deployment Status**: ✅ Ready for production deployment
**Last Updated**: August 2025
**Framework**: Astro v5.13.0 + Tailwind CSS + TypeScript
