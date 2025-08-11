# 🚀 Frontend Deployment Plan - Angular SSR to AWS EC2

## 🎯 **Current Status Analysis**

### **✅ What We Have:**
- **Framework**: Angular 12 with Universal SSR support
- **Current Domain**: Frontend pointing to `.com` domains (eazyvenue.com, api.eazyvenue.com)
- **Target Domain**: Need to point to `.in` domains (eazyvenue.in, api.eazyvenue.in)
- **Backend Status**: ✅ Already deployed and running at `api.eazyvenue.in`

### **🔧 Required Changes:**
1. **Environment Configuration**: Update both `environment.ts` and `environment.prod.ts`
2. **Domain Alignment**: Point to `eazyvenue.in` and `api.eazyvenue.in`
3. **Deployment Setup**: Create GitHub Actions workflow for frontend deployment
4. **SSL Configuration**: Set up SSL certificate for `eazyvenue.in`
5. **Nginx Configuration**: Configure reverse proxy for frontend

---

## 📋 **Step-by-Step Deployment Plan**

### **Step 1: Fix Environment Configuration**
Update environment files to point to correct `.in` domains:

**Files to Update:**
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

**Changes Needed:**
```typescript
// FROM:
apiUrl: 'https://api.eazyvenue.com/api/'
productUploadUrl: 'https://api.eazyvenue.com/uploads/'
frontEnd: { domain: 'https://eazyvenue.com', picPath: 'https://api.eazyvenue.com' }

// TO:
apiUrl: 'https://api.eazyvenue.in/api/'
productUploadUrl: 'https://api.eazyvenue.in/uploads/'
frontEnd: { domain: 'https://eazyvenue.in', picPath: 'https://api.eazyvenue.in' }
```

### **Step 2: Create GitHub Actions Workflow**
- Set up automated deployment similar to backend
- Deploy to same EC2 server (13.61.182.152)
- Build Angular SSR application
- Deploy to `/home/ubuntu/aws/eazyvenue-frontend`

### **Step 3: Server Configuration**
- Configure Nginx for both frontend and backend
- Set up SSL certificate for `eazyvenue.in`
- Configure PM2 for Angular Universal SSR server

### **Step 4: Domain Configuration**
- **Frontend**: `https://eazyvenue.in` (main website)
- **Backend API**: `https://api.eazyvenue.in` (already configured ✅)
- **File Uploads**: `https://api.eazyvenue.in/uploads/`

---

## 🏗️ **Infrastructure Overview**

```
┌─────────────────────────────────────────────────────────┐
│                 AWS EC2 (13.61.182.152)                │
├─────────────────────────────────────────────────────────┤
│  Nginx (Port 80/443)                                   │
│  ├── eazyvenue.in → Frontend (Port 4000)               │
│  └── api.eazyvenue.in → Backend (Port 3006) ✅         │
├─────────────────────────────────────────────────────────┤
│  PM2 Process Manager                                    │
│  ├── eazyvenue-frontend-ssr (Angular Universal)        │
│  └── eazyvenue-backend (Node.js API) ✅                │
├─────────────────────────────────────────────────────────┤
│  Services                                               │
│  ├── MongoDB ✅                                        │
│  ├── Redis ✅                                          │
│  └── Let's Encrypt SSL ✅                              │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 **Deployment Commands Preview**

### **Build & Deploy Process:**
```bash
# 1. Install dependencies
npm ci --legacy-peer-deps

# 2. Build for production with SSR
npm run build:ssr

# 3. Deploy built files to server
# 4. Start with PM2
pm2 start dist/freya-ng/server/main.js --name eazyvenue-frontend-ssr

# 5. Configure Nginx for eazyvenue.in
# 6. Setup SSL certificate
```

---

## 📊 **Expected Results**

### **After Successful Deployment:**
- **✅ Frontend**: `https://eazyvenue.in` - Angular SSR application
- **✅ Backend**: `https://api.eazyvenue.in` - Node.js API (already live)
- **✅ File Uploads**: `https://api.eazyvenue.in/uploads/`
- **✅ SSL Security**: Both domains with Let's Encrypt certificates
- **✅ Performance**: Server-side rendering for better SEO and loading

---

## 🔧 **Required GitHub Secrets**

We'll need to add these secrets for frontend deployment:
- `ACCESS_TOKEN` ✅ (already configured)
- `EC2_HOST` ✅ (already configured) 
- `EC2_SSH_KEY` ✅ (already configured)
- `EC2_USERNAME` ✅ (already configured)

---

## 🎯 **Next Actions**

1. **Fix Environment Files** - Update domain configurations
2. **Create Deployment Workflow** - GitHub Actions for frontend
3. **Deploy Frontend** - Build and deploy Angular SSR app
4. **Configure SSL** - Set up certificate for eazyvenue.in
5. **Test & Verify** - Ensure frontend-backend communication works

---

**Ready to start with environment configuration fixes? 🚀**
