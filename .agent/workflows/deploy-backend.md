---
description: Deploy Backend to Cloud Server (AWS/Oracle)
---

# 🚀 Cloud Backend Deployment Guide

This guide explains how to deploy the `backend/` directory to a cloud server (AWS EC2, Oracle VM, or any Linux server) using Docker.

## 1. Prerequisites

- **Server**: A Linux server (Ubuntu 22.04 recommended) with a public IP.
- **Docker**: Installed on the server.
- **Git**: To pull the code.

## 2. Server Setup (First Time)

Connect to your server via SSH:
```bash
ssh ubuntu@your-server-ip
```

Install Docker (if not installed):
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER
# Log out and log back in for group changes to take effect
```

## 3. Deployment Steps

### A. Clone/Pull Code
```bash
git clone https://github.com/hyunggyu96/hgdaniel.git
cd hgdaniel
# OR if already cloned
git pull origin main
```

### B. Configure Environment
Create a `.env` file in the `backend/` directory:
```bash
cd backend
nano .env
```
Paste your API Keys:
```ini
DART_API_KEY=your_key
NAVER_CLIENT_ID=your_id
NAVER_CLIENT_SECRET=your_secret
GEMINI_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_service_role_key
```

### C. Build & Run
Back to root to run docker-compose:
```bash
cd ..
docker-compose up -d --build
```

## 4. Verification

Check if the server is running:
```bash
docker ps
# Status should be 'Up'
```

Test the Health Endpoint:
```bash
curl http://localhost:8000/health
# Output: {"status":"healthy"}
```

## 5. Frontend Connection

Once your backend is live at `http://YOUR_SERVER_IP:8000`:
1. Update your local `.env.local` file in `web/` or Vercel Environment Variables:
   ```ini
   NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000
   ```
2. Redeploy frontend.
