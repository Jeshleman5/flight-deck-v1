# Flight Deck — Deployment Guide

**You're deploying a real web app. This guide assumes zero prior experience.**

The typing bug you experienced only exists in the Claude artifact renderer. Once deployed, everything works perfectly.

---

## What You're Setting Up

You'll create accounts on three free services, then connect them like this:

```
Your Code → GitHub (stores it) → Vercel (hosts it) → yourname.vercel.app (live site)
```

Every time you push a code change to GitHub, Vercel automatically rebuilds and deploys. It's magic.

**Total cost: $0.** All three services have generous free tiers.

**Time: ~30 minutes** for the first deploy. After that, updates are instant.

---

## Step 0: Install the Tools

You need two things on your computer: **Node.js** and **Git**.

### Install Node.js
1. Go to https://nodejs.org
2. Click the big green button (LTS version)
3. Run the installer. Click "Next" through everything. Defaults are fine.
4. To verify it worked, open Terminal (Mac) or Command Prompt (Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.11.0`. The exact number doesn't matter.

### Install Git
1. Go to https://git-scm.com/downloads
2. Download for your OS (Mac/Windows)
3. Run the installer. Again, defaults are fine.
4. Verify:
   ```
   git --version
   ```
   Should show something like `git version 2.43.0`.

---

## Step 1: Create a GitHub Account & Repository

GitHub is where your code lives. Think of it as Google Drive for code.

### Create your account
1. Go to https://github.com
2. Click "Sign Up"
3. Use your personal email. Pick a username. Follow the prompts.

### Create a new repository
1. Once logged in, click the **+** button (top right) → **New repository**
2. Fill in:
   - **Repository name:** `flight-deck`
   - **Description:** "Personal flight tracker"
   - **Visibility:** Private (only you can see the code)
   - **DO NOT** check "Add a README file" or any other boxes
3. Click **Create repository**
4. You'll see a page with setup instructions. **Leave this tab open.** You'll need the URL shown (it looks like `https://github.com/YOUR-USERNAME/flight-deck.git`).

---

## Step 2: Download & Set Up the Project

### Get the project files
1. Download the `flight-deck.tar.gz` file from this conversation
2. Decide where on your computer you want the project to live. Your home folder or Desktop is fine.
3. Extract the archive:
   - **Mac:** Double-click the `.tar.gz` file. It creates a `flight-deck` folder.
   - **Windows:** Use 7-Zip or WinRAR to extract. Or in PowerShell: `tar -xzf flight-deck.tar.gz`

### Install dependencies
1. Open Terminal (Mac) or Command Prompt (Windows)
2. Navigate to the project folder. For example:
   ```
   cd ~/Desktop/flight-deck
   ```
   (Replace the path with wherever you extracted the files)
3. Install the project dependencies:
   ```
   npm install
   ```
   This downloads all the libraries the app needs. Takes about 30 seconds. You'll see a progress bar.

### Test it locally
1. Start the development server:
   ```
   npm run dev
   ```
2. You'll see output like:
   ```
   VITE v5.4.0  ready in 300 ms
   ➜  Local:   http://localhost:5173/
   ```
3. Open that URL in your browser. You should see Flight Deck running — and the typing works perfectly.
4. Press `Ctrl+C` in the terminal to stop the server when you're done testing.

---

## Step 3: Push Your Code to GitHub

This connects your local project folder to the GitHub repository you created.

1. Make sure you're in the `flight-deck` folder in your terminal.
2. Run these commands **one at a time** (copy-paste each line, press Enter, wait for it to finish):

```
git init
```
*This turns the folder into a Git project.*

```
git add .
```
*This stages all the files to be saved.*

```
git commit -m "Initial commit - Flight Deck V1"
```
*This creates a snapshot of your code.*

```
git branch -M main
```
*This names your branch "main" (GitHub's default).*

```
git remote add origin https://github.com/YOUR-USERNAME/flight-deck.git
```
**IMPORTANT: Replace `YOUR-USERNAME` with your actual GitHub username** from the URL you saw in Step 1.

```
git push -u origin main
```
*This uploads everything to GitHub.*

You may be asked to sign in to GitHub. Follow the prompts. If it asks about a "personal access token," go to https://github.com/settings/tokens, generate one with "repo" scope, and paste it as your password.

After this, refresh your GitHub repository page. You should see all your files there.

---

## Step 4: Deploy to Vercel

Vercel takes your GitHub code and turns it into a live website. Automatically. For free.

### Create your account
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** — this links the two accounts together.
4. Authorize Vercel to access your GitHub.

### Import your project
1. On the Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repos. Find **flight-deck** and click **"Import"**
3. On the configuration screen:
   - **Framework Preset:** It should auto-detect "Vite". If not, select it from the dropdown.
   - **Root Directory:** Leave blank (`./ ` is fine)
   - **Build Command:** Should say `vite build`. Leave it.
   - **Output Directory:** Should say `dist`. Leave it.
4. Click **"Deploy"**
5. Wait about 60 seconds. You'll see a build log scrolling.
6. When it's done, you'll see a celebration screen with a preview of your site and a URL like:
   ```
   flight-deck-abc123.vercel.app
   ```

**That's your live site.** Open it in your browser. Open it on your phone. Share it with your wife. It's real.

---

## Step 5: Custom Domain (Optional)

If you want a nicer URL like `flightdeck.yourdomain.com`:

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type your desired domain and click **Add**
3. Vercel will tell you what DNS records to add at your domain registrar (Namecheap, Google Domains, Cloudflare, etc.)
4. Follow those instructions, wait 5-10 minutes for DNS to propagate

---

## Making Updates

Whenever you want to change something in the future:

1. Edit the files in your local `flight-deck` folder (use any text editor — VS Code is great and free: https://code.visualstudio.com)
2. Open Terminal, navigate to the folder, and run:
   ```
   git add .
   git commit -m "Description of what you changed"
   git push
   ```
3. Vercel automatically detects the push and redeploys. Your live site updates in about 60 seconds.

That's it. Three commands and your site is updated.

---

## Troubleshooting

**"command not found: node"**
→ Restart your terminal after installing Node.js. If still broken, reinstall Node from nodejs.org.

**"command not found: git"**
→ Same — restart terminal. On Mac, you might need to run `xcode-select --install` first.

**Git asks for a password and rejects it**
→ GitHub no longer accepts regular passwords. You need a Personal Access Token:
  1. Go to https://github.com/settings/tokens
  2. Click "Generate new token (classic)"
  3. Check the "repo" box
  4. Copy the token and use it as your password

**Vercel build fails**
→ Check the build log for red error text. Most common fix: make sure `npm install` ran successfully locally first.

**"Module not found" errors**
→ Run `npm install` again in your project folder.

**Site works locally but not on Vercel**
→ Make sure you committed AND pushed all files: `git add . && git commit -m "fix" && git push`

---

## What's Next (V1.1 Roadmap)

Once this is deployed and working, here's the upgrade path:

1. **Supabase for data persistence** — Right now data is saved in your browser's localStorage (each device/browser has its own data). Supabase gives you a real database so data syncs across devices.

2. **Google Sign-In** — So you and your wife each have accounts.

3. **Flight number auto-lookup** — The lookup feature uses Claude's API which works but isn't ideal for production. We'd swap it for a dedicated flight data API.

4. **V2 social features** — Per the PRD.

Let me know when V1 is live and we'll start on V1.1.
