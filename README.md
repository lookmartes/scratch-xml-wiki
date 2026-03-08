# Scratch XML Injector — Wiki

Official documentation site for the [Scratch XML Injector](https://scratch.mit.edu) userscript (v6.3).

## Live Site

Once deployed: `https://YOUR-USERNAME.github.io/scratch-xml-wiki/`

## Contents

| Page | Description |
|------|-------------|
| `index.html` | Landing page with feature overview and quick-start |
| `docs/getting-started.html` | Installation and first injection |
| `docs/blocks-xml.html` | Blockly XML format reference |
| `docs/opcodes.html` | Complete opcode reference (Events, Motion, Control, Sensing, Operators, Looks, Variables) |
| `docs/inputs-fields.html` | Number, string, boolean, dropdown, reporter inputs |
| `docs/project-xml.html` | Project XML format — building full projects |
| `docs/costumes.html` | Auto-generated circle and rectangle costume shapes |
| `docs/examples.html` | Copy-pasteable XML examples |
| `docs/troubleshooting.html` | Common errors and fixes |
| `docs/hosting.html` | Deploying this wiki to GitHub Pages |

## Hosting on GitHub Pages

1. Fork or upload this repository to GitHub (must be **public**)
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` → `/ (root)`
4. Click **Save**
5. Your site goes live at `https://YOUR-USERNAME.github.io/REPO-NAME/` in ~60 seconds

## Local Development

No build tools required — open `index.html` directly in a browser, or use any static file server:

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .
```

Then visit `http://localhost:8080`.

## License

Documentation is released under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).  
Scratch is a project of the MIT Media Lab.
