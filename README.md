# Scratch XML Injector — Wiki

This is the documentation wiki for the Scratch XML Injector v7.0 userscript. Open https://lookmartes.github.io/scratch-xml-wiki/ in your browser to get started.

---

## Pages

### Getting Started
**`docs/getting-started.html`**
How to install the script via Tampermonkey, where to use it, and how to do your first injection. Start here if you're new.

### What's New in v7.0
**`docs/whats-new.html`**
Full changelog — all 4 inject modes, 2 export modes, the Script copy tab, and everything that changed from v6.3.

### Inject Modes
**`docs/inject-modes.html`**
Deep reference for all 4 inject modes: New Project, Add to Project, Replace Blocks, and Append Blocks. Covers when to use each one and what XML format each expects.

### Export Modes
**`docs/export-modes.html`**
How to use Grab Sprite XML and Grab Project XML — including how the exported XML can be re-injected for a round-trip edit workflow.

### Blocks XML Format
**`docs/blocks-xml.html`**
The `<xml>` format used for Replace Blocks and Append Blocks modes. Covers block structure, nesting, inputs, fields, shadows, and next chains.

### Project XML Format
**`docs/project-xml.html`**
The `<project>` format used for New Project and Add to Project modes. Covers sprite definitions, costume shapes, and embedding blocks XML inside a project.

### Opcodes Reference
**`docs/opcodes.html`**
Full list of Scratch block opcodes — Events, Motion, Looks, Control, Sensing, Operators, Variables, and more.

### Inputs & Fields
**`docs/inputs-fields.html`**
How to write number inputs, text inputs, boolean conditions, dropdown menus, variable reporters, and broadcast options in XML.

### Costumes
**`docs/costumes.html`**
How auto-generated costumes work — circle and rectangle shapes, color, stroke, size, and dimension attributes.

### Examples
**`docs/examples.html`**
Ready-to-paste XML examples: animations, movement, conditionals, full multi-sprite projects.

### Troubleshooting
**`docs/troubleshooting.html`**
Fixes for common errors: `FixedAsciiString`, `VM not found`, blank injections, missing variables, and more.

### Copy Script
**`docs/copy-script.html`**
Three ways to copy and share the userscript without needing access to Tampermonkey's dashboard.

---

## Viewing locally

No build tools needed — just open `index.html` directly in any browser. All pages are plain HTML with no dependencies or server required.

---

Scratch is a project of the MIT Media Lab. This wiki and script are unofficial and unaffiliated.
