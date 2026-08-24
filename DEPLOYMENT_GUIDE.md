# 🚀 DhatuChakra LCA Tool — Deployment Guide

> **Project Type:** Pure Frontend (HTML + CSS + JS) — **No backend server required**
>
> Iska matlab hai ki tumhara poora prototype browser me chalta hai — koi Node.js server, database ya API nahi chahiye. Isliye deployment bahut simple hai aur **100% free** ho sakti hai.

---

## 📊 Platform Comparison — Kahan Deploy Karein?

| Platform | Best For | Free Tier | Custom Domain | Auto Deploy (Git Push) | SSL (HTTPS) | Speed |
|---|---|---|---|---|---|---|
| **⭐ GitHub Pages** | Static sites, SIH demo | ✅ Unlimited | ✅ Free | ✅ On push to `main` | ✅ Auto | ⚡ Fast |
| **⭐ Vercel** | Frontend apps | ✅ Unlimited | ✅ Free | ✅ On push | ✅ Auto | ⚡⚡ Very Fast (CDN) |
| **⭐ Netlify** | Static sites + forms | ✅ 100GB/month | ✅ Free | ✅ On push | ✅ Auto | ⚡⚡ Very Fast (CDN) |
| Cloudflare Pages | Performance-focused | ✅ Unlimited | ✅ Free | ✅ On push | ✅ Auto | ⚡⚡⚡ Fastest (Edge) |
| Render | Backend + Static | ✅ Static free | ✅ Free | ✅ On push | ✅ Auto | ⚡ Good |

### 🏆 Recommendation (Tumhare project ke liye)

> **Primary: GitHub Pages** — Sabse easy, tumhara code already GitHub pe hai, zero config.
>
> **Secondary: Vercel** — Agar speed + preview links chahiye toh ye best hai. Har PR pe ek preview URL milta hai.
>
> **Note:** Tumhara project **pure frontend** hai — koi backend nahi hai. Isliye **Render jaise backend platforms ki zaroorat nahi hai.** Agar future me backend add karo (Node.js API, database), tab Render use karna.

---

## 1️⃣ GitHub Pages (Recommended — Sabse Aasaan)

### Why GitHub Pages?
- Code already GitHub pe hai (`grv-io/LCA-TOOL`)
- Zero config — sirf Settings me jaake enable karo
- Free SSL, free hosting, no limits
- URL: `https://grv-io.github.io/LCA-TOOL/prototype/`

### Step-by-Step Setup

#### Step 1: GitHub Repository Settings
1. GitHub pe apna repo kholo: `https://github.com/grv-io/LCA-TOOL`
2. **Settings** tab pe click karo (top-right gear icon)
3. Left sidebar me **Pages** click karo
4. **Source** section me:
   - **Deploy from a branch** select karo
   - Branch: `main`
   - Folder: `/ (root)`
5. **Save** click karo

#### Step 2: Wait for Deployment
- GitHub automatically build karega (1-2 minute lagega)
- **Actions** tab me jaake deployment ka status dekh sakte ho
- Green checkmark ✅ aaye toh site live hai

#### Step 3: Access Your Live Site
```
🔗 Main URL: https://grv-io.github.io/LCA-TOOL/prototype/
📄 Pages:
   - Home:    https://grv-io.github.io/LCA-TOOL/prototype/index.html
   - Assess:  https://grv-io.github.io/LCA-TOOL/prototype/assess.html
   - Compare: https://grv-io.github.io/LCA-TOOL/prototype/compare.html
   - Results: https://grv-io.github.io/LCA-TOOL/prototype/results.html
   - Report:  https://grv-io.github.io/LCA-TOOL/prototype/report.html
```

#### Step 4: Verify on Mobile
- Phone pe URL kholo ya QR code scan karo (section 6 dekho)
- Check karo ki sab pages load ho rahe hain
- Mobile data pe test karo (WiFi ke bina) — SIH demo me WiFi na ho toh bhi kaam kare

#### Troubleshooting
| Problem | Solution |
|---|---|
| 404 Error | Check karo ki `prototype/index.html` exist karta hai repo me |
| CSS/JS not loading | Ensure all paths are **relative** (e.g., `css/theme.css`, not `/css/theme.css`) |
| Changes not showing | Hard refresh karo (`Ctrl+Shift+R`) — GitHub caches files |
| Still old version | Actions tab me check karo ki latest deployment complete hua ya nahi |

---

## 2️⃣ Vercel (Best Speed + Preview Links)

### Why Vercel?
- **Fastest CDN globally** — India me bhi blazing fast
- Har git push pe **automatic preview URL** milta hai
- Team members ko preview link share kar sakte ho before merging

### Step-by-Step Setup

#### Step 1: Vercel Account Create Karo
1. `https://vercel.com` pe jao
2. **"Sign Up"** → **"Continue with GitHub"** select karo
3. GitHub account se login karo aur permissions allow karo

#### Step 2: Import Your Repository
1. Vercel dashboard pe **"Add New → Project"** click karo
2. **"Import Git Repository"** me `grv-io/LCA-TOOL` search karo
3. **Import** click karo

#### Step 3: Configure Build Settings
```
Framework Preset:  Other
Root Directory:    prototype
Build Command:     (leave empty — no build needed)
Output Directory:  . (dot — current directory)
```
4. **Deploy** click karo

#### Step 4: Get Your Live URLs
```
🔗 Production:  https://lca-tool.vercel.app
🔗 Preview:     https://lca-tool-<hash>.vercel.app (har push pe naya)
```

> **💡 Tip:** Vercel har branch pe ek alag preview URL deta hai. Agar koi teammate `feature/u4-knn-imputer` branch pe kaam kar raha hai, toh uska bhi ek separate preview URL banega — bahut useful hai review ke liye!

---

## 3️⃣ Netlify (Easy + Great Free Tier)

### Step-by-Step Setup

#### Step 1: Netlify Account
1. `https://netlify.com` pe jao
2. **"Sign up"** → **"GitHub"** se login karo

#### Step 2: Add New Site
1. **"Add new site"** → **"Import an existing project"**
2. **GitHub** select karo → `grv-io/LCA-TOOL` repo choose karo

#### Step 3: Configure
```
Branch to deploy:    main
Base directory:      prototype
Build command:       (leave empty)
Publish directory:   prototype
```
4. **Deploy site** click karo

#### Step 4: Get Your URL
```
🔗 Default:  https://random-name-12345.netlify.app
🔗 Custom:   Settings → Domain → Change site name → https://dhatuchakra.netlify.app
```

> **💡 Tip:** Netlify pe site ka naam change kar sakte ho free me — `dhatuchakra.netlify.app` jaise professional URL banao!

---

## 4️⃣ Cloudflare Pages (Fastest Performance)

### Step-by-Step Setup

1. `https://pages.cloudflare.com` pe jao
2. **"Create a project"** → **"Connect to Git"**
3. GitHub se repo connect karo
4. Configure:
```
Production branch:   main
Build command:       (leave empty)
Build output:        prototype
```
5. **Save and Deploy**

```
🔗 URL: https://lca-tool.pages.dev
```

---

## 5️⃣ Render (Sirf Agar Backend Chahiye Future Me)

> ⚠️ **Abhi tumhare project ke liye Render ki zaroorat NAHI hai** kyunki tumhara project pure frontend hai. Ye section future reference ke liye hai — agar kabhi Node.js API, database ya authentication add karo toh Render use karna.

### Static Site Deploy (Free)
1. `https://render.com` pe jao → GitHub se signup
2. **"New"** → **"Static Site"**
3. Repo connect karo
4. Configure:
```
Branch:              main
Root Directory:      prototype
Build Command:       (leave empty — or use `echo "no build"`)
Publish Directory:   .
```
5. **Create Static Site**

### Future: Backend Deploy (Free Tier)
Agar future me backend add karo:
```
Type:        Web Service
Runtime:     Node
Build:       npm install
Start:       node server.js
Free Tier:   750 hours/month (enough for demo)
```

> ⚠️ **Render free tier ka downside:** Server 15 min idle rehne pe **sleep** ho jaata hai. Pehli request pe 30-50 second lagta hai wake up hone me. SIH demo ke liye ye risky hai — pehle se site khol ke rakho!

---

## 6️⃣ QR Code Generate Karo (Demo ke liye)

### Free QR Code Generators

| Tool | URL | Best Feature |
|---|---|---|
| **QR Code Generator** | `https://www.qr-code-generator.com` | Simple, high-res PNG |
| **QRCode Monkey** | `https://www.qrcode-monkey.com` | Custom colors + logo |
| **GoQR** | `https://goqr.me` | Fastest, no signup |

### Steps:
1. Apna live URL copy karo (e.g., `https://grv-io.github.io/LCA-TOOL/prototype/`)
2. QR generator me paste karo
3. **High resolution PNG** download karo (minimum 500×500 px)
4. Save as `prototype/assets/qr.png`
5. PPT ke **Slide 2** (links box) aur **Slide 6** (demo slide) me add karo

### QR Code Best Practices:
- ✅ Dark background pe **white QR** use karo (better scan rate)
- ✅ Center me **DhatuChakra logo** daal do (QRCode Monkey pe free hai)
- ✅ Neeche URL bhi likh do text me (backup agar scan na ho)
- ❌ QR bahut chota mat banao — minimum 3cm × 3cm print size rakhoo

---

## 7️⃣ Custom Domain Setup (Optional — Professional Look)

Agar tum ek custom domain lena chaho (e.g., `dhatuchakra.in`):

### Free Subdomain Options (No Cost):
- `dhatuchakra.netlify.app` (Netlify pe site rename karo)
- `lca-tool.vercel.app` (Vercel pe automatic)
- `lca-tool.pages.dev` (Cloudflare pe automatic)

### Cheap Domain (~₹100-500/year):
| Provider | Price | Domain |
|---|---|---|
| Namecheap | ~₹100/year | `.me`, `.xyz` |
| GoDaddy | ~₹200/year | `.in` |
| Google Domains | ~₹500/year | `.dev` |

> For SIH internal round, **free subdomain is more than enough.** Custom domain sirf finals ke liye consider karo.

---

## 8️⃣ Pre-Deployment Checklist ✅

Run through this before deploying:

```
□  All file paths are RELATIVE (no absolute paths like /css/ or C:\...)
□  No hardcoded localhost URLs
□  All assets (images, fonts) are included in the repo
□  index.html loads correctly when opened directly in browser
□  Site works on mobile (responsive design)
□  Site works without WiFi (no external API calls that can fail)
□  Console me koi error nahi hai (F12 → Console tab check karo)
□  All HTML pages are linked correctly to each other
□  README.md me live URL add kiya
□  QR code generated and added to PPT
```

---

## 9️⃣ Post-Deployment Steps

### Update README.md
```markdown
# DhatuChakra — LCA Tool for Indian Metal Recycling

🔗 **Live Demo:** [https://grv-io.github.io/LCA-TOOL/prototype/](https://grv-io.github.io/LCA-TOOL/prototype/)

📱 **Scan to try on mobile:**
![QR Code](prototype/assets/qr.png)
```

### Update GitHub Repo "About" Section
1. Repo page pe jao
2. Right side me **⚙️ gear icon** (About section) click karo
3. **Website** field me live URL paste karo
4. Save karo

### Demo Day Preparation
- ✅ Live URL pehle se phone me khol ke rakho
- ✅ Mobile data pe test karo (WiFi depend mat karo)
- ✅ QR code PPT me clearly visible ho
- ✅ Backup: laptop pe bhi locally chalao in case internet na ho

---

## 🎯 TL;DR — Kya Karna Hai?

| Step | Action | Time |
|---|---|---|
| 1 | GitHub Pages enable karo (Settings → Pages) | 2 min |
| 2 | URL verify karo browser + mobile pe | 3 min |
| 3 | QR code generate karo aur PPT me daalo | 5 min |
| 4 | README + repo About section update karo | 2 min |
| **Total** | | **~12 min** |

> **Sabse fast aur reliable:** GitHub Pages use karo. Tumhara code already wahan hai, zero extra setup, aur SIH judges ke liye `github.io` URL professional lagta hai — ye dikhata hai ki tum GitHub pe actively kaam kar rahe ho.

---

*Last updated: 24 August 2026*
