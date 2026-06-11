# Housekeeping Cleaning Log — Deployment Guide

**Enterprise Management Solutions** cleaning log application for tracking and managing housekeeping operations across multiple facilities.

---

## 📦 What's Included

- **React Frontend** – Modern, responsive single-page app with offline-first storage
- **Docker Support** – Production-ready containerization
- **GitHub Actions CI/CD** – Automated testing & deployment pipeline
- **LocalStorage Persistence** – Data synced locally without external database

---

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start
```

### Docker (Local Testing)

```bash
# Build and run with Docker Compose
docker-compose up

# App runs at http://localhost:3000
```

---

## 🐳 Docker Deployment

### Build the Image

```bash
docker build -t cleaning-log:latest .
```

### Run the Container

```bash
docker run -d \
  --name cleaning-log \
  -p 3000:3000 \
  --restart unless-stopped \
  cleaning-log:latest
```

### Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `NODE_ENV` | `production` | Set to `development` for debugging |

---

## 🌐 Deployment Targets

### 1. **Heroku**

```bash
# Create app
heroku create your-app-name

# Deploy
git push heroku main
```

Create `Procfile`:
```
web: npm run serve
```

### 2. **Docker Hub**

```bash
# Build and tag
docker build -t yourusername/cleaning-log:1.0 .

# Push
docker push yourusername/cleaning-log:1.0
```

### 3. **AWS ECS (Elastic Container Service)**

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin [YOUR_ECR_URL]
docker tag cleaning-log:latest [YOUR_ECR_URL]/cleaning-log:latest
docker push [YOUR_ECR_URL]/cleaning-log:latest
```

Then deploy via ECS task definition.

### 4. **Google Cloud Run**

```bash
# Build and deploy
gcloud run deploy cleaning-log \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

### 5. **DigitalOcean App Platform**

- Connect your GitHub repo
- Set build command: `npm run build`
- Set run command: `npm run serve`
- Set HTTP Port to `3000`

---

## 🔧 Build & Test

```bash
# Install dependencies
npm install

# Run tests
npm test -- --watchAll=false

# Build production bundle
npm run build
```

---

## 📊 GitHub Actions Workflow

The repository includes an automated CI/CD pipeline (`.github/workflows/deploy.yml`) that:

1. **Builds** the React app
2. **Tests** the application
3. **Creates** a Docker image
4. **Pushes** to GitHub Container Registry (GHCR)
5. **Triggers** on push to `main` or `develop`

### Manual Deploy

To manually trigger the workflow:

1. Go to **Actions** tab
2. Select **Build & Deploy** workflow
3. Click **Run workflow**

---

## 📱 Features

- **Multi-user authentication** with PIN-based login
- **Role-based access** (Admin unlock required for settings/exports)
- **Offline-first storage** using browser LocalStorage
- **CSV export** for reporting and analysis
- **Facility management** with pre-configured Baltimore locations
- **Cleaning checklists** – Daily, Weekly, Monthly Deep Clean, etc.
- **Quality assurance** checkpoints
- **Time tracking** with duration calculations
- **Responsive design** – Desktop, tablet, mobile

---

## 🔐 Security Notes

- PINs are **hashed with SHA-256** (never stored in plain text)
- Data stored locally in browser — **no external database**
- Admin PIN: `172106` (for test/demo)
- All user data synced to LocalStorage

---

## 📝 Configuration

### Add New Locations

1. Sign in → **Settings** (unlock with admin PIN)
2. **Facilities & Locations**
3. Select group, enter address, click **Add**

### Manage Users

1. **Settings** → **Registered Users**
2. Remove any user account (entries retained)
3. Users create their own accounts from login screen

---

## 🛠 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 3000 already in use** | `lsof -i :3000` to find process, then `kill -9 [PID]` |
| **Docker won't build** | Clear cache: `docker system prune` |
| **Data lost after refresh** | Check browser LocalStorage is enabled |
| **Build fails: "module not found"** | Run `npm install` again |

---

## 📦 Production Checklist

- [ ] Update `ADMIN_PIN` in `src/App.js` to a secure value
- [ ] Review and update location data for your facilities
- [ ] Test user registration & login flow
- [ ] Verify CSV export functionality
- [ ] Enable HTTPS on your hosting platform
- [ ] Set up monitoring/logging if applicable
- [ ] Test on iOS/Android devices
- [ ] Backup LocalStorage data regularly

---

## 📄 License

© 2026 Michele Y. Greene. All rights reserved.  
This application and its design are the exclusive property of Michele Y. Greene.  
Unauthorized reproduction, modification, or distribution is prohibited.

---

## 🤝 Support

For issues, feature requests, or deployment help:
1. Check **GitHub Issues**
2. Review deployment logs
3. Test locally with Docker first

---

**Last Updated:** June 11, 2026  
**Version:** 1.0.0
