# Preview Workflow

- `master` is the approved stable branch.
- `preview` is the active development branch published to GitHub Pages.
- GitHub Pages deploys only from pushes to `preview`.
- Do not merge `preview` into `master` without explicit approval.

Before each significant preview change, create a restore branch from the last working preview commit:

```powershell
$stamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
git branch "restore/$stamp" preview
git push origin "restore/$stamp"
```

For each preview change:

```powershell
git checkout preview
npm run lint
npm run typecheck
npm run test
npm run build
$env:GITHUB_PAGES='true'; npm run build:pages
git push origin preview
```

If a preview change is rejected, revert only the relevant preview commit:

```powershell
git checkout preview
git revert <commit-sha>
git push origin preview
```

After every push to `preview`, wait for the GitHub Pages workflow to finish and verify:

https://abdazeembaig.github.io/ar-menu-platform/r/brunch-cafe/t/T12/
