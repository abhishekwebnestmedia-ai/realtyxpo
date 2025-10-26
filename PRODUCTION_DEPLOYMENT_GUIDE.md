# Production Deployment Guide - RealtyXpo CRM

## Pre-Deployment Checklist

### 🔒 Security Requirements
- [x] Environment variables configured
- [x] API endpoints use HTTPS
- [x] All console.log statements removed/replaced with logger
- [x] Global error boundary implemented
- [x] Client-side security measures active
- [x] Form validation and sanitization implemented
- [x] Memory leak prevention in place
- [ ] SSL certificate installed and valid
- [ ] Security headers configured on server
- [ ] CORS properly configured for production domain

### ⚡ Performance Requirements
- [x] Code splitting implemented
- [x] Lazy loading for routes
- [x] Bundle optimization configured
- [x] Image optimization ready
- [x] Caching strategies defined
- [ ] CDN configured for assets
- [ ] Gzip compression enabled
- [ ] Performance monitoring setup

### 🧪 Testing Requirements
- [x] All critical features manually tested
- [x] API integration tested
- [x] Error handling tested
- [x] Cross-browser compatibility checked
- [ ] Load testing completed
- [ ] Security penetration testing done
- [ ] Mobile responsiveness verified

## Environment Setup

### 1. Environment Variables
Create `.env.production` with the following variables:
```bash
VITE_API_BASE_URL=https://backend.realtyxpo.in
VITE_API_TIMEOUT=30000
VITE_APP_ENV=production
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_LOG_LEVEL=error
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.xlsx,.xls,.csv,.pdf,.jpg,.jpeg,.png
VITE_ENABLE_SERVICE_WORKER=true
VITE_CACHE_DURATION=3600000
```

### 2. Build Commands
```bash
# Install dependencies
npm ci --production

# Run security audit
npm audit

# Build for production
npm run build

# Preview production build locally
npm run preview

# Serve production build
npm run serve
```

## Server Configuration

### 1. Nginx Configuration
```nginx
server {
    listen 80;
    server_name realtyxpo.in www.realtyxpo.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name realtyxpo.in www.realtyxpo.in;

    # SSL Configuration
    ssl_certificate /path/to/ssl/certificate.crt;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://backend.realtyxpo.in; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://backend.realtyxpo.in; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';" always;

    # Document root
    root /var/www/realtyxpo/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # API proxy
    location /api/ {
        proxy_pass https://backend.realtyxpo.in;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Security - block access to sensitive files
    location ~ /\.(env|git|svn) {
        deny all;
        return 404;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
    
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass https://backend.realtyxpo.in;
    }
    
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass https://backend.realtyxpo.in;
    }
}
```

### 2. Apache Configuration (.htaccess)
```apache
# HTTPS Redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# Content Security Policy
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://backend.realtyxpo.in; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://backend.realtyxpo.in; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# React Router Support
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Block sensitive files
<FilesMatch "\.(env|git|svn)">
    Order allow,deny
    Deny from all
</FilesMatch>
```

## Deployment Steps

### 1. Prepare Production Build
```bash
# Clone repository
git clone https://github.com/your-org/realtyxpo-crm.git
cd realtyxpo-crm

# Switch to production branch
git checkout main

# Install dependencies
npm ci --production

# Run pre-deployment checks
npm run pre-deploy

# Build for production
npm run build
```

### 2. Upload to Server
```bash
# Using rsync
rsync -avz --delete dist/ user@server:/var/www/realtyxpo/

# Or using SCP
scp -r dist/* user@server:/var/www/realtyxpo/

# Set proper permissions
ssh user@server "chmod -R 755 /var/www/realtyxpo && chown -R www-data:www-data /var/www/realtyxpo"
```

### 3. Configure Web Server
```bash
# For Nginx
sudo systemctl reload nginx

# For Apache
sudo systemctl reload apache2

# Test configuration
sudo nginx -t  # For Nginx
sudo apache2ctl configtest  # For Apache
```

## Post-Deployment Verification

### 1. Security Checks
- [ ] SSL certificate valid (A+ grade on SSL Labs)
- [ ] Security headers present (securityheaders.com)
- [ ] No mixed content warnings
- [ ] CSP violations monitored
- [ ] Rate limiting functional

### 2. Performance Checks
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Caching headers correct

### 3. Functionality Checks
- [ ] All routes accessible
- [ ] API calls working
- [ ] Authentication flow functional
- [ ] File uploads working
- [ ] Error handling active
- [ ] Form submissions successful

## Monitoring & Maintenance

### 1. Error Monitoring
```javascript
// Setup error tracking
if (import.meta.env.PROD && window.Sentry) {
  Sentry.init({
    dsn: 'YOUR_SENTRY_DSN',
    environment: 'production'
  });
}
```

### 2. Performance Monitoring
```javascript
// Web Vitals tracking
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onFCP(console.log);
onLCP(console.log);
onTTFB(console.log);
```

### 3. Regular Maintenance
- [ ] Security updates monthly
- [ ] Dependency updates quarterly
- [ ] Performance reviews monthly
- [ ] Backup verifications weekly
- [ ] SSL certificate renewal annually

## Troubleshooting Common Issues

### Build Failures
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Permission Issues
```bash
# Fix file permissions
chmod -R 755 /var/www/realtyxpo
chown -R www-data:www-data /var/www/realtyxpo
```

### CSP Violations
- Check browser console for violations
- Update CSP headers to allow necessary resources
- Test with relaxed policy first, then tighten

### Performance Issues
- Check bundle size with `npm run analyze`
- Optimize images and assets
- Review lazy loading implementation
- Check network requests in DevTools

## Rollback Plan
```bash
# Keep previous version for quick rollback
mv /var/www/realtyxpo /var/www/realtyxpo-backup
# Deploy new version
# If issues occur:
mv /var/www/realtyxpo-backup /var/www/realtyxpo
systemctl reload nginx
```

## Support Contacts
- **Technical Issues**: tech@realtyxpo.com
- **Security Issues**: security@realtyxpo.com
- **Emergency Contact**: +1-XXX-XXX-XXXX

---

**Deployment Status**: ✅ Ready for Production
**Last Updated**: October 25, 2025
**Version**: 1.0.0