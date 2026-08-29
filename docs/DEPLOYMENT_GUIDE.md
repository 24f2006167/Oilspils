# 🚀 OceanGuard AI — Full Production Deployment Guide
**Smart India Hackathon 2026 • Problem Statement SIH26143**

---

## 🌐 1. Deploy Frontend to GitHub Pages (Instant & Free)

The repository includes a pre-configured automated GitHub Actions deployment workflow [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

### **Steps to Activate in 30 Seconds:**
1. Open your repository on GitHub: **[github.com/24f2006167/Oilspils](https://github.com/24f2006167/Oilspils)**
2. Click on **⚙️ Settings** (top menu).
3. In the left sidebar, click on **Pages** (under *Code and automation*).
4. Under **Build and deployment > Source**, select:
   👉 **`GitHub Actions`**
5. Go to the **Actions** tab on your repo. The deployment workflow will automatically run.
6. Your live website URL will be:
   👉 **`https://24f2006167.github.io/Oilspils/`**

---

## ⚡ 2. Deploy Frontend to Vercel (1-Click)

1. Go to **[vercel.com](https://vercel.com)** and log in with GitHub.
2. Click **Add New... > Project**.
3. Select your repository: **`24f2006167/Oilspils`**.
4. Leave all default settings (Root Directory `./`) and click **Deploy**.
5. Your custom Vercel link (`https://oilspils.vercel.app`) is instantly live with worldwide CDN caching.

---

## ☁️ 3. Deploy FastAPI Backend on Render.com (Free Cloud Tier)

1. Go to **[render.com](https://render.com)** and log in.
2. Click **New + > Web Service**.
3. Connect your GitHub repository: **`24f2006167/Oilspils`**.
4. Fill in the deployment parameters:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
5. Click **Create Web Service**.
6. Once deployed, your live interactive API & Swagger docs will be live at:
   👉 **`https://oceanguard-backend.onrender.com/docs`**

---

## 🐳 4. Run Locally with Docker Container

To run the complete production container locally or on any cloud VPS (AWS EC2 / DigitalOcean):

```bash
# Build the Docker image
docker build -t oceanguard-ai:latest .

# Run the container on port 8000
docker run -d -p 8000:8000 --name oceanguard oceanguard-ai:latest

# Open in browser
open http://localhost:8000
```
