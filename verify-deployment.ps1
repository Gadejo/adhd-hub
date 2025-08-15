# ADHD Hub - Deployment Verification Script
# Run this after deployment to verify everything works

Write-Host "🚀 ADHD Hub - Post-Deployment Verification" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

$baseUrl = "https://adhd-hub.pages.dev"

Write-Host "📍 Testing deployment at: $baseUrl" -ForegroundColor Yellow

# Test 1: Check if site is live
Write-Host "`n1. ✅ Checking if site is live..." -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri $baseUrl -Method HEAD -ErrorAction Stop
    Write-Host "   ✅ Site is responding (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Site is not responding: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check API endpoints
Write-Host "`n2. 🔌 Testing API endpoints..." -ForegroundColor Green

$apiTests = @(
    @{ endpoint = "/api/me"; description = "Authentication check" },
    @{ endpoint = "/api/resources"; description = "Resources API" },
    @{ endpoint = "/api/goals"; description = "Goals API" },
    @{ endpoint = "/api/sessions"; description = "Sessions API" }
)

foreach ($test in $apiTests) {
    try {
        $url = "$baseUrl$($test.endpoint)"
        $response = Invoke-WebRequest -Uri $url -Method GET -ErrorAction Stop
        Write-Host "   ✅ $($test.description): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "   ✅ $($test.description): 401 (Expected - requires auth)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $($test.description): $statusCode" -ForegroundColor Yellow
        }
    }
}

# Test 3: Check static assets
Write-Host "`n3. 📦 Checking static assets..." -ForegroundColor Green
$staticTests = @("/favicon.ico", "/_astro/", "/images/")

foreach ($asset in $staticTests) {
    try {
        $url = "$baseUrl$asset"
        $response = Invoke-WebRequest -Uri $url -Method HEAD -ErrorAction Stop
        Write-Host "   ✅ $asset: Available" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  $asset: Not found (may be normal)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Deployment verification complete!" -ForegroundColor Cyan
Write-Host "Visit your ADHD Hub at: $baseUrl" -ForegroundColor White

# Additional info
Write-Host "`n📊 Next steps:" -ForegroundColor Cyan
Write-Host "• Test user registration at $baseUrl" -ForegroundColor White
Write-Host "• Try cloud sync functionality" -ForegroundColor White
Write-Host "• Check Cloudflare dashboard for analytics" -ForegroundColor White
Write-Host "• Monitor error logs with: wrangler pages deployment tail" -ForegroundColor White
