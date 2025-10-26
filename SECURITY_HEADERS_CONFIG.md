# Security Headers Configuration

## For Apache (.htaccess)
```apache
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"

# Content Security Policy
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://backend.realtyxpo.in; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://backend.realtyxpo.in; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';"

# Strict Transport Security
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

# Remove server information
Header unset Server
Header unset X-Powered-By

# Cache control for sensitive pages
<FilesMatch "\.(html|htm|js|css)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</FilesMatch>

# Security for file uploads
<FilesMatch "\.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

## For Nginx
```nginx
# Security Headers
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://backend.realtyxpo.in; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://backend.realtyxpo.in; media-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'self'; form-action 'self';" always;

# Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Hide server information
server_tokens off;

# Security for static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
}

# Block access to sensitive files
location ~* \.(php|phtml|php3|php4|php5|pl|py|jsp|asp|sh|cgi)$ {
    deny all;
}

# Block access to hidden files
location ~ /\. {
    deny all;
}
```

## Security.js - Client-side Security Enhancement
```javascript
// security.js - Add to public folder or index.html
(function() {
    'use strict';
    
    // Disable right-click context menu in production
    if (window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
        document.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+U
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'U')) {
                e.preventDefault();
            }
        });
    }
    
    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', function() {
        // Clear any sensitive form data
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input[type="password"], input[data-sensitive]');
            inputs.forEach(input => input.value = '');
        });
    });
    
    // Detect if running in iframe (clickjacking protection)
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
    
    // Console warning for developers
    console.log('%cWarning!', 'color: red; font-size: 50px; font-weight: bold;');
    console.log('%cThis is a browser feature intended for developers. Do not paste any code here that someone tells you to paste. This could allow attackers to steal your information or take control of your account.', 'font-size: 16px;');
})();
```

## Deployment Checklist

### 1. HTTPS Configuration
- [ ] SSL certificate installed and valid
- [ ] HTTP to HTTPS redirect configured
- [ ] HSTS header enabled
- [ ] SSL Labs test score A or A+

### 2. Security Headers
- [ ] Content-Security-Policy configured
- [ ] X-Frame-Options set to DENY or SAMEORIGIN
- [ ] X-Content-Type-Options set to nosniff
- [ ] X-XSS-Protection enabled
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy configured

### 3. Server Security
- [ ] Server information headers removed
- [ ] Directory listing disabled
- [ ] Unnecessary services disabled
- [ ] File upload restrictions in place
- [ ] Rate limiting configured

### 4. Application Security
- [ ] All user inputs validated and sanitized
- [ ] Authentication tokens properly managed
- [ ] Session management secure
- [ ] Error messages don't expose sensitive information
- [ ] Logging configured without sensitive data

### 5. CORS Configuration
- [ ] CORS properly configured for production domain
- [ ] Wildcard origins removed from production
- [ ] Credentials handling secure

## Environment-Specific Headers

### Development
```
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' http://localhost:* ws://localhost:*;
```

### Production
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://backend.realtyxpo.in; object-src 'none';
```

## Security Testing Tools

1. **SSL Labs SSL Test**: https://www.ssllabs.com/ssltest/
2. **Security Headers Check**: https://securityheaders.com/
3. **Observatory by Mozilla**: https://observatory.mozilla.org/
4. **OWASP ZAP**: For comprehensive security testing
5. **Lighthouse Security Audit**: Built into Chrome DevTools