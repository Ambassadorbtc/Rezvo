# 🚀 Deploy Rezvo to DigitalOcean

**GitHub Repo**: https://github.com/Ambassadorbtc/Rezvo.git  
**Cost**: £24/month (first 6-10 months FREE with $200 credit)

---

## Quick Deploy (Copy & Paste)

### 1. Create Droplet

- Region: **London LON1**
- Image: **Ubuntu 24.04 LTS**
- Size: **Basic - 2 CPU, 4GB RAM, 80GB SSD** ($24/mo)
- Add SSH key
- Enable Monitoring + Backups

### 2. SSH In & Run Setup

```bash
ssh root@YOUR_DROPLET_IP

# Run this entire block
curl -fsSL https://raw.githubusercontent.com/Ambassadorbtc/Rezvo/main/scripts/setup_server.sh | bash
```

### 3. Configure Environment

```bash
cd /opt/rezvo/backend
nano .env
```

Fill in your API keys, then:

```bash
# Start services
systemctl enable rezvo && systemctl start rezvo
systemctl reload nginx

# Get SSL
certbot --nginx -d rezvo.co.uk -d www.rezvo.co.uk
```

### 4. Seed Database

```bash
cd /opt/rezvo
source backend/venv/bin/activate
python scripts/rezvo_seed_uk.py
```

---

## Full Guide: DEPLOY_NOW.md

See complete step-by-step instructions with troubleshooting in `DEPLOY_NOW.md`

---

## You're Live! 🎉

**Frontend**: https://rezvo.co.uk  
**API**: https://rezvo.co.uk/api  
**API Docs**: https://rezvo.co.uk/api/docs
