# CI/CD Setup Instructions — The Legacy Circle

GitHub requires the **workflow** OAuth scope to auto-create workflow files via API.
To activate the CI workflow, copy the file below into your repo:

## Step 1 — Copy the workflow

In your GitHub repo, go to:
`Actions → New workflow → Set up a workflow yourself`

Paste the contents of `docs/ci-workflow.yml` into the editor and click **Commit changes**.

Or from the command line:
```bash
mkdir -p .github/workflows
cp docs/ci-workflow.yml .github/workflows/ci.yml
git add .github/workflows/ci.yml
git commit -m "ci: add Legacy Circle CI workflow"
git push
```

## Step 2 — Verify

After pushing, go to the **Actions** tab in GitHub. You should see the workflow run automatically on your next push to `main`.
