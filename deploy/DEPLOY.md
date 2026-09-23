# Hostinger VPS Deployment Guide — Diwali Kadai

This guide covers complete, step-by-step instructions to deploy Diwali Kadai to an Ubuntu/Debian Hostinger VPS using **Node.js 20+, PostgreSQL, PM2, and Nginx with Certbot SSL**.

---

## 1. Prerequisites on the Hostinger VPS

Connect to your VPS via SSH:
```bash
ssh root@YOUR_SERVER_IP
```

Update system packages:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential ufw
```

### Install Node.js 20 LTS
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Should show v20.x.x
npm -v
```

### Install PM2 Globally
```bash
sudo npm install -g pm2
pm2 startup # Run the output command PM2 gives you to enable autostart on reboot
```

### Install & Configure PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```
Inside the PostgreSQL interactive shell:
```sql
CREATE DATABASE diwali_kadai;
CREATE USER diwali_user WITH ENCRYPTED PASSWORD 'ReplaceWithStrongDbPassword123!';
GRANT ALL PRIVILEGES ON DATABASE diwali_kadai TO diwali_user;
ALTER DATABASE diwali_kadai OWNER TO diwali_user;
\q
```

---

## 2. Clone Repository & Setup Project

```bash
# Recommended directory: /var/www/diwali-kadai
sudo mkdir -p /var/www/diwali-kadai
sudo chown -R $USER:$USER /var/www/diwali-kadai
cd /var/www/diwali-kadai

# Clone your repository
git clone <YOUR_GIT_REPO_URL> .
```

### Security Audit (Required)
```bash
# Run npm audit before proceeding
npm audit
```

### Install Dependencies
```bash
npm ci --production=false
```

---

## 3. Configure Production Environment Variables (`.env`)

Generate a secure 64-character session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Generate your admin bcrypt password hash:
```bash
node -e "require('bcryptjs').hash('YourChosenAdminPassword', 10).then(console.log)"
```

Create `/var/www/diwali-kadai/.env`:
```bash
nano .env
```

Paste and customize your production variables:
```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://diwali_user:ReplaceWithStrongDbPassword123!@localhost:5432/diwali_kadai"

# Razorpay (LIVE Credentials)
# NOTE: Must start with rzp_live_ in production. The app checks and blocks rzp_test_ keys in production!
RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXX"
RAZORPAY_KEY_SECRET="XXXXXXXXXXXXXXXXXXXXXXXX"
RAZORPAY_WEBHOOK_SECRET="XXXXXXXXXXXXXXXXXXXXXXXX"

# Public Razorpay Key for Frontend Modal
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_XXXXXXXXXXXX"

# SMTP (Nodemailer Email Delivery)
SMTP_HOST="smtp.hostinger.com" # or your SMTP provider
SMTP_PORT=587
SMTP_USER="orders@yourdomain.com"
SMTP_PASS="YourEmailAccountPassword"
SMTP_FROM='"Diwali Kadai" <orders@yourdomain.com>'

# Admin Portal Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="$2b$10$YourGeneratedBcryptHashHere"
ADMIN_SESSION_SECRET="your_generated_64_character_hex_string_here"

# Store Configuration
STORE_ADMIN_EMAIL="storeowner@yourdomain.com"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Runtime
NODE_ENV="production"
PORT=3000
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

Make sure `.env` file permissions are restricted to the owner only:
```bash
chmod 600 .env
```

---

## 4. Run Prisma Migrations & Seed Database

Apply Prisma database schema and generate typed client:
```bash
npx prisma db push
```

Populate the initial ~21 realistic Diwali fireworks catalog with images, categories, prices, and stock:
```bash
npx prisma db seed
```

---

## 5. Build Next.js Production Bundle

```bash
npm run build
```
Verify that the build outputs static pages and dynamic routes with **zero errors**.

---

## 6. Start the App with PM2

```bash
# Start cluster mode using ecosystem.config.js
pm2 start ecosystem.config.js

# Save process list so PM2 restarts your app on server reboot
pm2 save
```

Verify PM2 status:
```bash
pm2 list
pm2 logs diwali-kadai --lines 30
```

Test that the local server is serving requests:
```bash
curl http://localhost:3000
```

---

## 7. Setup Nginx Reverse Proxy & SSL (Certbot)

Install Nginx:
```bash
sudo apt install -y nginx
```

Copy the Nginx configuration:
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/diwali-kadai
```

Edit the file to put your domain name:
```bash
sudo nano /etc/nginx/sites-available/diwali-kadai
```
Replace `yourdomain.com www.yourdomain.com` with your real domain name pointing to this VPS.

Enable the site and verify syntax:
```bash
sudo ln -s /etc/nginx/sites-available/diwali-kadai /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default # Remove default nginx welcome page
sudo nginx -t
sudo systemctl reload nginx
```

### Install Certbot for Free HTTPS / SSL
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the interactive prompts. Certbot will automatically issue Let's Encrypt certificates and configure HTTPS redirects!

### Configure Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 8. Configure Razorpay Webhook in Dashboard

1. Log into your [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Go to **Settings** → **Webhooks** → **Add New Webhook**.
3. **Webhook URL**: `https://yourdomain.com/api/webhooks/razorpay`
4. **Secret**: Enter the exact secret string you put in `RAZORPAY_WEBHOOK_SECRET` in `.env`.
5. **Active Events**:
   - `payment.captured`
   - `payment.failed`
   - `order.paid`
6. Save the webhook.

---

## Maintenance & Updates

When updating code in the future:
```bash
cd /var/www/diwali-kadai
git pull origin main
npm ci --production=false
npm audit
npx prisma db push
npm run build
pm2 reload diwali-kadai
```
