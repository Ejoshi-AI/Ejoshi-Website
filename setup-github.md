# ejoshi-website — GitHub + Cloudflare Pages Setup

**Version 2 — 2026-05-23.** Bundled the partial-git cleanup from yesterday's session, hard-coded `Ejoshi-AI` as the GitHub username, added bilingual deploy (`index.html` + `index_cn.html`).

Open PowerShell on Windows (Win key → type "PowerShell" → Enter) and run each block in order.

---

## Step 1 — Clean up the partial git init from yesterday

```powershell
cd "C:\Users\nick\OneDrive\Desktop\Ejoshi\02 Projects\ejoshi.ai Website\Exports\Public"
Remove-Item -Recurse -Force .git
```

This deletes the broken `.git/` folder that was started but never completed. OneDrive sync blocked it from completing yesterday, so we're redoing it cleanly.

---

## Step 2 — Initialize git, stage, commit

```powershell
git init
git config user.email "nick@ejoshi.info"
git config user.name "Nick Shi"
git branch -M main
git add .
git commit -m "Initial commit: ejoshi.ai v7 — EN + CN bilingual"
```

After the commit, run `git status` — it should say "nothing to commit, working tree clean."

---

## Step 3 — Create the GitHub repo

1. Go to https://github.com/new
2. Owner: **Ejoshi-AI**
3. Repository name: **ejoshi-website**
4. Visibility: **Private**
5. Leave "Initialize this repository with…" all UNCHECKED — we already have files
6. Click **Create repository**

---

## Step 4 — Connect and push

```powershell
git remote add origin https://github.com/Ejoshi-AI/ejoshi-website.git
git push -u origin main
```

GitHub will prompt for credentials. Username is `Ejoshi-AI`. For password, use a **Personal Access Token** (not your GitHub password):

1. Go to https://github.com/settings/tokens/new
2. Note: `ejoshi-website deploy`
3. Expiration: 90 days (or "No expiration" if you prefer)
4. Scopes: check **repo** (top-level box — gives full repo access)
5. Click **Generate token** at the bottom
6. Copy the token immediately — GitHub only shows it once
7. Paste it as the password when prompted

After push completes, refresh https://github.com/Ejoshi-AI/ejoshi-website — you'll see `index.html`, `index_cn.html`, `.gitignore`, and `setup-github.md`.

---

## Step 5 — Connect Cloudflare Pages

1. Go to https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** tab → **Connect to Git**
2. Authorize Cloudflare to access GitHub (if first time). When asked which repos, select **Only select repositories** → **ejoshi-website