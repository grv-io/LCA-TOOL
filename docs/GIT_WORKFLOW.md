# GIT WORKFLOW — read once fully, then follow DAILY ROUTINE forever

> NOTE FOR AI ASSISTANTS: run these commands exactly as written. Never run `git push --force`. Never commit `.env`. Never work directly on `main`.

## Branch map

| Branch | Who | Purpose |
|---|---|---|
| `main` | nobody directly | Always-working code. Changes arrive only via Pull Requests. |
| `ritesh-engine` | Ritesh | All engine + data work |
| `harsh-ml` | Harsh | All ML + LLM work |
| `gaurav-app` | Gaurav | All frontend + API + deploy work |

## One-time setup

### Gaurav (Day 1, before the others clone)
```
# on GitHub.com: create a PRIVATE repo named lca-tool (no README, empty)
cd path/to/lca-tool          # the folder with PLAN.md and docs/
git init
git add .
git commit -m "docs: plan, contracts, role files"
git branch -M main
git remote add origin https://github.com/<gaurav-username>/lca-tool.git
git push -u origin main
```
Then on GitHub: repo → Settings → Collaborators → add Ritesh and Harsh (they must accept the email invite).
Optional but recommended: Settings → Branches → add branch protection rule for `main` → tick "Require a pull request before merging".

### Everyone (after cloning)
Create your own branch (pick YOUR branch name from the table above):
```
git checkout -b ritesh-engine        # Ritesh runs this
git checkout -b harsh-ml             # Harsh runs this
git checkout -b gaurav-app           # Gaurav runs this
git push -u origin <your-branch-name>
```

## DAILY ROUTINE — copy-paste every morning, in order
```
git checkout main
git pull origin main
git checkout <your-branch-name>
git merge main
```
- If it prints "Already up to date" or "Merge made by ..." → good, start working.
- If it prints "CONFLICT" → see the conflict section below.

## Saving your work — every 1–2 hours
```
git add .
git commit -m "short message: what you did"
git push
```
Commit message examples: `engine: real factor-based run_lca`, `ml: imputer v1`, `ui: results page charts`.

## Getting your work into main (at each milestone, roughly weekly)
1. `git push` your branch.
2. On GitHub: "Compare & pull request" → base: `main`, compare: your branch → Create.
3. One OTHER person opens the PR, reads it, clicks "Approve", then "Merge".
4. Everyone runs the DAILY ROUTINE so they get the merged code.

## If you get a merge conflict

99% of the time the conflicted file is `backend/requirements.txt`. Fix:
1. Open the file in VS Code. You will see markers like:
```
<<<<<<< HEAD
lightgbm
=======
weasyprint
>>>>>>> main
```
2. Keep BOTH package lines, delete the `<<<<<<<`, `=======`, `>>>>>>>` lines, keep the list alphabetical:
```
lightgbm
weasyprint
```
3. Then:
```
git add backend/requirements.txt
git commit -m "merge: resolve requirements conflict"
```

Conflict in ANY OTHER file = someone edited outside their folders. Message the group, decide together whose version is correct, keep that side, delete the markers, add + commit.

## FORBIDDEN — never do these
- `git push --force` (anywhere, ever)
- editing folders you do not own (your role file lists them)
- committing `backend/.env` (it contains the API key)
- committing files bigger than 50 MB (ML model artifacts live in `backend/app/ml/artifacts/` which is gitignored — share big files via Google Drive)
- committing directly on `main`
- `git rebase` (we use merge only — simpler and safe for 3 people)
