# SETUP — do this ONCE on your laptop

Everyone (Ritesh, Harsh, Gaurav) does Part 1. Gaurav also does Part 2.
Every command goes in a terminal (Windows: "Git Bash" or PowerShell; Mac/Linux: Terminal).
After each step there is a CHECK. If the CHECK fails, fix it before moving on.

---

## Part 1 — Everyone

### 1.1 Install Git
- Download: https://git-scm.com/downloads
- Install with default options (click Next until Finish).

CHECK: open a NEW terminal and run:
```
git --version
```
Expected: prints something like `git version 2.x`. If "not recognized", restart the terminal or reinstall.

### 1.2 Install Python 3.11 or newer
- Download: https://www.python.org/downloads/
- IMPORTANT (Windows): on the first install screen, tick the checkbox **"Add Python to PATH"** before clicking Install.

CHECK:
```
python --version
```
Expected: `Python 3.11.x` or higher. (On Mac/Linux the command may be `python3`.)

### 1.3 Install VS Code
- Download: https://code.visualstudio.com/
- Install extensions: "Python" (by Microsoft). Gaurav also installs "ESLint" and "Tailwind CSS IntelliSense".

### 1.4 Set your git identity (use YOUR name and email)
```
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

### 1.5 Clone the repository
Gaurav creates the repo first (see GIT_WORKFLOW.md, "One-time setup"). Then everyone runs:
```
git clone https://github.com/<gaurav-username>/lca-tool.git
cd lca-tool
```
CHECK: `ls` shows `PLAN.md`, `docs/`.

### 1.6 Create the Python virtual environment (inside the lca-tool folder)
```
python -m venv .venv
```
Activate it — you must do this EVERY time you open a new terminal to work:
- Windows (PowerShell): `.venv\Scripts\Activate.ps1`
- Windows (Git Bash):   `source .venv/Scripts/activate`
- Mac/Linux:            `source .venv/bin/activate`

CHECK: your terminal prompt now starts with `(.venv)`.

### 1.7 Install Python packages
```
pip install -r backend/requirements.txt
```
NOTE: if `backend/requirements.txt` does not exist yet, skip this — Gaurav creates it on Day 1. Run this command after his first push reaches `main`.

### 1.8 Create your env file
```
cp backend/.env.example backend/.env
```
Then open `backend/.env` in VS Code and fill in real values (Harsh puts the ANTHROPIC_API_KEY here). NEVER commit `.env` — it is already in `.gitignore`.

---

## Part 2 — Gaurav only

### 2.1 Install Node.js 20 LTS
- Download: https://nodejs.org/ (LTS version)

CHECK: `node --version` → `v20.x` or higher; `npm --version` works.

### 2.2 Frontend packages (after frontend/ exists)
```
cd frontend
npm install
```

### 2.3 Docker Desktop (needed from Week 1, optional Day 1)
- Download: https://www.docker.com/products/docker-desktop/
- Windows: needs WSL2 — the installer sets it up; say yes.

CHECK: `docker --version` works and Docker Desktop app opens.

---

## Daily reminder (everyone)
Every time you sit down to work:
1. Open terminal in the `lca-tool` folder
2. Activate venv (step 1.6)
3. Run the DAILY ROUTINE from `docs/GIT_WORKFLOW.md`
4. Open your role file in `docs/` and continue from your last unchecked task
