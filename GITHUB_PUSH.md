# Pushing to GitHub Securely

## What’s already done
- **`.gitignore`** – Ignores `.env`, `node_modules/`, `build/`, and other unwanted files so they are never committed.
- **`.env.example`** (in `server/` and `client/`) – Safe templates with placeholders only (no real API keys). Others can copy these to `.env` and add their own secrets.

## Before you push

1. **Never commit real `.env` files.**  
   They are in `.gitignore`, so `git add .` will not add them. Double-check with:
   ```bash
   git status
   ```
   You should **not** see `server/.env` or `client/.env` in the list.

2. **Optional: stop tracking `node_modules` (recommended)**  
   If `node_modules` was committed earlier, remove it from Git (files stay on disk):
   ```powershell
   git rm -r --cached client/node_modules
   git rm -r --cached server/node_modules
   git commit -m "Stop tracking node_modules"
   ```
   After this, `.gitignore` will keep them ignored.

## Push steps

1. **Create a new repo on GitHub** (if you haven’t):  
   https://github.com/new  
   Do **not** add a README, .gitignore, or license if you already have a local repo.

2. **Stage only what you want** (`.gitignore` will exclude `.env` and `node_modules` if you ran the optional step above):
   ```powershell
   git add .
   git status
   ```
   Confirm that **no** `.env` files are listed.

3. **Commit and push:**
   ```powershell
   git commit -m "Add project with secure .gitignore and env examples"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   If `origin` already exists, use:
   ```powershell
   git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## After cloning (for you or others)
- Copy `server/.env.example` to `server/.env` and add your real `GEMINI_API_KEY`, etc.
- Copy `client/.env.example` to `client/.env` and set `REACT_APP_API_URL` if needed.
- Run `npm install` in both `client/` and `server/`.
