# DEPLOYMENT BLOCKER FIXES — Complete Guide

## Overview
Two critical blockers preventing full deployment:
1. **HTTPS returns 503** (site works on HTTP but not HTTPS)
2. **Missing Anthropic API key** (voice search won't work)

## Your Local SSH Issue
Your local PowerShell/SSH commands are hanging. This is a local network/shell issue, not a server problem.

**Solution:** Run commands DIRECTLY on the server via SSH terminal, not via automated scripts.

---

## BLOCKER 1: Fix HTTPS 503

### Step 1: Diagnose
SSH into server and run diagnostics:

```bash
ssh root@146.190.111.28

# Check SSL certificates
sudo certbot certificates

# Find nginx config
ls -la /etc/nginx/sites-enabled/

# View the config (replace 'rezvo' with actual filename)
sudo cat /etc/nginx/sites-enabled/rezvo

# Check backend
sudo systemctl status rezvo-backend --no-pager
ss -tlnp | grep 8000

# Check errors
sudo tail -30 /var/log/nginx/error.log
```

### Step 2: Identify the Problem

**Scenario A: No SSL certificate exists**
- `certbot certificates` shows no certificates
- **Fix:** Run certbot to install SSL

**Scenario B: Certificate exists but nginx config is wrong**
- Certificate exists but nginx config has no `listen 443 ssl` block
- Or SSL paths are wrong
- **Fix:** Update nginx config

**Scenario C: Backend is not running**
- `systemctl status rezvo-backend` shows "inactive" or "failed"
- Port 8000 is not listening
- **Fix:** Restart backend service

### Step 3: Apply the Fix

#### Fix A: Install SSL Certificate (if missing)
```bash
sudo certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose redirect option (recommended: Yes)

# Test
curl -I https://rezvo.co.uk
```

#### Fix B: Update Nginx Config (if wrong)
```bash
# Backup current config
sudo cp /etc/nginx/sites-enabled/rezvo /etc/nginx/sites-enabled/rezvo.backup

# Edit config
sudo nano /etc/nginx/sites-enabled/rezvo
```

**Required HTTPS server block:**
```nginx
server {
    listen 443 ssl http2;
    server_name rezvo.co.uk www.rezvo.co.uk;
    
    ssl_certificate /etc/letsencrypt/live/rezvo.co.uk/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rezvo.co.uk/privkey.pem;
    
    root /opt/rezvo/frontend/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save and apply:**
```bash
# Test config
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Test HTTPS
curl -I https://rezvo.co.uk
```

#### Fix C: Restart Backend (if not running)
```bash
# Restart service
sudo systemctl restart rezvo-backend

# Check status
sudo systemctl status rezvo-backend

# Check logs if it fails
sudo journalctl -u rezvo-backend -n 50

# Verify port is listening
ss -tlnp | grep 8000
```

### Step 4: Verify HTTPS Works
```bash
# Test HTTPS homepage
curl -I https://rezvo.co.uk
# Expected: HTTP/2 200

# Test HTTPS API
curl -I https://rezvo.co.uk/api/docs
# Expected: HTTP/2 200

# Open in browser
# https://rezvo.co.uk (should show SSL padlock)
```

---

## BLOCKER 2: Add Anthropic API Key

### Step 1: Edit Backend Environment File
```bash
# Open .env file
sudo nano /opt/rezvo/backend/.env
```

### Step 2: Add API Key
Add this line to the file:
```
ANTHROPIC_API_KEY=sk-ant-YOUR-ACTUAL-KEY-HERE
```

**Replace `sk-ant-YOUR-ACTUAL-KEY-HERE` with your real Anthropic API key.**

### Step 3: Save and Restart
```bash
# Save file
# Press: Ctrl+O, Enter, Ctrl+X

# Restart backend
sudo systemctl restart rezvo-backend

# Verify it's running
sudo systemctl status rezvo-backend

# Check logs for any errors
sudo journalctl -u rezvo-backend -n 20
```

### Step 4: Verify API Key Works
```bash
# Check key is in environment
grep "ANTHROPIC_API_KEY" /opt/rezvo/backend/.env

# Test voice search endpoint
curl -X POST https://rezvo.co.uk/api/voice-search/parse \
  -H "Content-Type: application/json" \
  -d '{"transcript":"Italian restaurant in Shoreditch","vertical":"restaurant"}'

# Should return JSON with parsed intent (not an error)
```

---

## Final Verification Checklist

After both fixes, verify:

### 1. HTTPS Works
- [ ] `https://rezvo.co.uk` loads with SSL padlock
- [ ] `https://rezvo.co.uk/api/docs` shows FastAPI Swagger UI
- [ ] No 503 errors on any page
- [ ] Browser shows "Secure" or padlock icon

### 2. Backend Running
- [ ] `sudo systemctl status rezvo-backend` shows "active (running)"
- [ ] `ss -tlnp | grep 8000` shows listening process
- [ ] No errors in `sudo journalctl -u rezvo-backend -n 20`

### 3. API Key Active
- [ ] `grep ANTHROPIC_API_KEY /opt/rezvo/backend/.env` shows key
- [ ] Voice search button on homepage is clickable
- [ ] Voice search processes transcript (doesn't error)

### 4. Frontend Updated
- [ ] All headings use clean geometric font (Figtree, not serif)
- [ ] Footer CTA appears once
- [ ] Giant REZVO watermark at bottom

---

## Common Issues & Solutions

### Issue: "Connection refused" on HTTPS
**Cause:** Nginx not running
**Fix:** `sudo systemctl start nginx`

### Issue: "502 Bad Gateway"
**Cause:** Backend not running or crashed
**Fix:** `sudo systemctl restart rezvo-backend`

### Issue: "Certificate not found"
**Cause:** Certbot hasn't been run
**Fix:** `sudo certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk`

### Issue: nginx test fails
**Cause:** Syntax error in config
**Fix:** Check error message, fix syntax, test again

### Issue: Voice search returns error
**Cause:** API key missing or invalid
**Fix:** Check `.env` file, verify key format starts with `sk-ant-`

---

## Quick Reference

| Item | Value |
|------|-------|
| Server IP | 146.190.111.28 |
| SSH User | root |
| Backend Service | rezvo-backend |
| Backend Port | 8000 |
| Frontend Path | /opt/rezvo/frontend/dist |
| Backend .env | /opt/rezvo/backend/.env |
| Nginx Config | /etc/nginx/sites-enabled/rezvo |
| SSL Certs | /etc/letsencrypt/live/rezvo.co.uk/ |
| HTTP URL | http://rezvo.co.uk |
| HTTPS URL | https://rezvo.co.uk |

---

## Files Created for You

1. **`QUICK-DIAGNOSE.txt`** — Copy-paste diagnostic commands
2. **`MANUAL-FIX-HTTPS.txt`** — Step-by-step manual fix instructions
3. **`FIX-HTTPS-AND-API-KEY.sh`** — Automated diagnostic script (run on server)
4. **`rezvo-nginx-https.conf`** — Reference nginx config with proper HTTPS setup

---

## Report Back

After running these fixes, report:
1. ✅ or ❌ HTTPS working? (`curl -I https://rezvo.co.uk`)
2. ✅ or ❌ Backend running? (`systemctl status rezvo-backend`)
3. ✅ or ❌ API key added? (`grep ANTHROPIC_API_KEY /opt/rezvo/backend/.env`)
4. ✅ or ❌ Voice search working? (test on homepage)

Once confirmed, we'll move to **Prompt 2: Search Component Swap**.
