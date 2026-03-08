<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Blocks XML — Scratch XML Injector Docs</title>
  <link rel="stylesheet" href="../assets/css/main.css"/>
</head>
<body>
<div id="scroll-bar"></div>
<header class="topbar">
  <a class="topbar-logo" href="../index.html"><div class="logo-mark">S</div><span class="logo-name">SXI <span class="logo-sub">Docs</span></span></a>
  <nav class="topbar-nav">
    <a href="../index.html">Home</a>
    <a href="getting-started.html">Guide</a>
    <a href="blocks-xml.html" class="active">Blocks XML</a>
    <a href="project-xml.html">Project XML</a>
    <a href="opcodes.html">Opcodes</a>
    <a href="examples.html">Examples</a>
  </nav>
  <div class="topbar-right">
    <span class="topbar-badge">v6.3</span>
    <a class="topbar-github" href="https://scratch.mit.edu" target="_blank">↗ Scratch</a>
  </div>
</header>

<div class="layout">
  <aside class="sidebar">
    <div class="sidebar-section">Overview</div>
    <a class="sidebar-link" href="../index.html"><span class="icon">◈</span>Introduction</a>
    <a class="sidebar-link" href="getting-started.html"><span class="icon">↓</span>Getting Started</a>
    <div class="sidebar-divider"></div>
    <div class="sidebar-section">Writing Code</div>
    <a class="sidebar-link active" href="blocks-xml.html"><span class="icon">~</span>Blocks XML</a>
    <a class="sidebar-link" href="opcodes.html"><span class="icon">≡</span>Opcode Reference</a>
    <a class="sidebar-link" href="inputs-fields.html"><span class="icon">⌥</span>Inputs &amp; Fields</a>
    <a class="sidebar-link" href="project-xml.html"><span class="icon">#</span>Project XML</a>
    <a class="sidebar-link" href="costumes.html"><span class="icon">◉</span>Costume Shapes</a>
    <div class="sidebar-divider"></div>
    <div class="sidebar-section">Guides</div>
    <a class="sidebar-link" href="examples.html"><span class="icon">▷</span>Examples</a>
    <a class="sidebar-link" href="troubleshooting.html"><span class="icon">!</span>Troubleshooting</a>
    <a class="sidebar-link" href="hosting.html"><span class="icon">↗</span>Hosting on GitHub</a>
  </aside>

  <div class="content-wrap">
    <main class="content">

      <div class="page-header">
        <div class="breadcrumb"><a href="../index.html">docs</a><span class="sep">/</span><span>blocks-xml</span></div>
        <h1>Blocks XML</h1>
        <p class="lead">The complete reference for writing Blockly XML to inject scripts into a Scratch sprite's workspace.</p>
        <div class="meta">
          <span class="meta-tag green">Core concept</span>
          <span class="meta-tag blue">~10 min read</span>
        </div>
      </div>

      <div class="doc-section" id="overview">
        <h2 class="section-title"><span class="num">01</span>What is Blocks XML?</h2>
        <p>Blocks XML is the <strong>native serialisation format</strong> that the Scratch editor uses internally to save and restore block workspaces. The injector reads this same format and loads it directly into the VM, bypassing the UI entirely.</p>
        <p>When you use the <strong>Export</strong> tab to grab blocks from an existing project, you get Blocks XML. That XML can be edited and re-injected — this is the most reliable way to learn the format.</p>
        <div class="callout info">
          <div class="callout-icon">ℹ</div>
          <div><strong>Pro tip:</strong> Build what you want in Scratch's block editor, then use the Export tab to read the XML. Compare it to this guide to understand the structure.</div>
        </div>
      </div>

      <div class="doc-section" id="skeleton">
        <h2 class="section-title"><span class="num">02</span>Document Skeleton</h2>
        <p>Every Blocks XML document has this structure:</p>

        <div class="code-block">
          <div class="code-block-header">
            <span class="code-block-lang">XML</span>
            <button class="copy-btn">Copy</button>
          </div>
          <pre><code><span class="t-tag">&lt;xml</span> <span class="t-attr">xmlns</span>=<span class="t-val">"https://developers.google.com/blockly/xml"</span><span class="t-tag">&gt;</span>

  <span class="t-cm">&lt;!-- Each direct child &lt;block&gt; is an independent script stack.
       Multiple stacks can exist side-by-side. --&gt;</span>

  <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"event_whenflagclicked"</span> <span class="t-attr">x</span>=<span class="t-val">"60"</span> <span class="t-attr">y</span>=<span class="t-val">"60"</span><span class="t-tag">&gt;</span>
    <span class="t-cm">&lt;!-- blocks chained below via &lt;next&gt; --&gt;</span>
  <span class="t-tag">&lt;/block&gt;</span>

  <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"event_whenkeypressed"</span> <span class="t-attr">x</span>=<span class="t-val">"300"</span> <span class="t-attr">y</span>=<span class="t-val">"60"</span><span class="t-tag">&gt;</span>
    <span class="t-cm">&lt;!-- a separate script stack --&gt;</span>
  <span class="t-tag">&lt;/block&gt;</span>

<span class="t-tag">&lt;/xml&gt;</span></code></pre>
        </div>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Attribute</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>xmlns</code> on <code>&lt;xml&gt;</code></td><td><span class="badge green">Yes</span></td><td>Identifies this as a Blockly XML document. Must be exactly as shown.</td></tr>
              <tr><td><code>type</code> on <code>&lt;block&gt;</code></td><td><span class="badge green">Yes</span></td><td>The Scratch opcode string, e.g. <code>event_whenflagclicked</code>.</td></tr>
              <tr><td><code>x</code>, <code>y</code> on top-level <code>&lt;block&gt;</code></td><td><span class="badge yellow">Optional</span></td><td>Workspace position of the stack (cosmetic only). Defaults to 0, 0.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-section" id="elements">
        <h2 class="section-title"><span class="num">03</span>XML Elements</h2>

        <h3 class="sub-title">&lt;block&gt; — a Scratch block</h3>
        <p>Represents any Scratch block. The <code>type</code> attribute is the block's opcode. Child elements define inputs, fields, and the next block in the chain.</p>

        <h3 class="sub-title">&lt;next&gt; — chain to the block below</h3>
        <p>Wraps the next block in the vertical stack. Each block can have at most one <code>&lt;next&gt;</code>.</p>
        <div class="code-block">
          <div class="code-block-header"><span class="code-block-lang">XML — Chaining</span><button class="copy-btn">Copy</button></div>
          <pre><code><span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"motion_movesteps"</span><span class="t-tag">&gt;</span>
  <span class="t-cm">&lt;!-- ...value inputs... --&gt;</span>
  <span class="t-tag">&lt;next&gt;</span>
    <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"motion_ifonedgebounce"</span><span class="t-tag">/&gt;</span>
  <span class="t-tag">&lt;/next&gt;</span>
<span class="t-tag">&lt;/block&gt;</span></code></pre>
        </div>

        <h3 class="sub-title">&lt;value&gt; — an input slot</h3>
        <p>Represents a rounded or pointed input slot on a block. The <code>name</code> attribute matches the block's documented input name (e.g. <code>STEPS</code>, <code>CONDITION</code>). Contains either a <code>&lt;shadow&gt;</code>, a <code>&lt;block&gt;</code>, or both.</p>

        <h3 class="sub-title">&lt;shadow&gt; — default / placeholder value</h3>
        <p>The grey "bubble" input that appears when nothing is connected. Must have a <code>type</code> matching a known shadow block opcode.</p>

        <div class="code-block">
          <div class="code-block-header"><span class="code-block-lang">XML — Number input</span><button class="copy-btn">Copy</button></div>
          <pre><code><span class="t-tag">&lt;value</span> <span class="t-attr">name</span>=<span class="t-val">"STEPS"</span><span class="t-tag">&gt;</span>
  <span class="t-tag">&lt;shadow</span> <span class="t-attr">type</span>=<span class="t-val">"math_number"</span><span class="t-tag">&gt;</span>
    <span class="t-tag">&lt;field</span> <span class="t-attr">name</span>=<span class="t-val">"NUM"</span><span class="t-tag">&gt;</span>10<span class="t-tag">&lt;/field&gt;</span>
  <span class="t-tag">&lt;/shadow&gt;</span>
<span class="t-tag">&lt;/value&gt;</span></code></pre>
        </div>

        <h3 class="sub-title">&lt;field&gt; — a literal value</h3>
        <p>A text field inside a block or shadow. The <code>name</code> attribute is the field's identifier. The text content is its value (number, string, or dropdown option).</p>

        <h3 class="sub-title">&lt;statement&gt; — C-block interior</h3>
        <p>Used for C-shaped blocks like <code>control_forever</code> and <code>control_if</code>. The <code>name</code> attribute is almost always <code>SUBSTACK</code> (or <code>SUBSTACK2</code> for the else branch of <code>control_if_else</code>).</p>

        <div class="code-block">
          <div class="code-block-header"><span class="code-block-lang">XML — C-block</span><button class="copy-btn">Copy</button></div>
          <pre><code><span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"control_forever"</span><span class="t-tag">&gt;</span>
  <span class="t-tag">&lt;statement</span> <span class="t-attr">name</span>=<span class="t-val">"SUBSTACK"</span><span class="t-tag">&gt;</span>
    <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"motion_movesteps"</span><span class="t-tag">&gt;</span>
      <span class="t-tag">&lt;value</span> <span class="t-attr">name</span>=<span class="t-val">"STEPS"</span><span class="t-tag">&gt;</span>
        <span class="t-tag">&lt;shadow</span> <span class="t-attr">type</span>=<span class="t-val">"math_number"</span><span class="t-tag">&gt;</span>
          <span class="t-tag">&lt;field</span> <span class="t-attr">name</span>=<span class="t-val">"NUM"</span><span class="t-tag">&gt;</span>5<span class="t-tag">&lt;/field&gt;</span>
        <span class="t-tag">&lt;/shadow&gt;</span>
      <span class="t-tag">&lt;/value&gt;</span>
    <span class="t-tag">&lt;/block&gt;</span>
  <span class="t-tag">&lt;/statement&gt;</span>
<span class="t-tag">&lt;/block&gt;</span></code></pre>
        </div>

        <h3 class="sub-title">&lt;mutation&gt; — custom block metadata</h3>
        <p>Used by procedure (custom) blocks to carry parameter definitions. You generally don't need this unless working with "My Blocks".</p>
      </div>

      <div class="doc-section" id="shadow-types">
        <h2 class="section-title"><span class="num">04</span>Shadow Block Types</h2>
        <p>These are the available <code>type</code> values for <code>&lt;shadow&gt;</code> elements and their corresponding field names:</p>

        <div class="table-wrap">
          <table>
            <thead><tr><th>Shadow type</th><th>Field name</th><th>Used for</th></tr></thead>
            <tbody>
              <tr><td><code>math_number</code></td><td><code>NUM</code></td><td>Any numeric input</td></tr>
              <tr><td><code>math_positive_number</code></td><td><code>NUM</code></td><td>Positive number inputs</td></tr>
              <tr><td><code>math_whole_number</code></td><td><code>NUM</code></td><td>Whole number inputs</td></tr>
              <tr><td><code>math_integer</code></td><td><code>NUM</code></td><td>Integer inputs</td></tr>
              <tr><td><code>math_angle</code></td><td><code>NUM</code></td><td>Angle inputs (e.g. direction)</td></tr>
              <tr><td><code>text</code></td><td><code>TEXT</code></td><td>String / text inputs</td></tr>
              <tr><td><code>colour_picker</code></td><td><code>COLOUR</code></td><td>Color inputs</td></tr>
              <tr><td><code>event_broadcast_menu</code></td><td><code>BROADCAST_OPTION</code></td><td>Broadcast name selector</td></tr>
              <tr><td><code>sensing_keyoptions</code></td><td><code>KEY_OPTION</code></td><td>Keyboard key dropdown</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="doc-section" id="boolean-inputs">
        <h2 class="section-title"><span class="num">05</span>Boolean &amp; Reporter Inputs</h2>
        <p>Boolean blocks (hexagonal) and reporter blocks (rounded) are placed as real <code>&lt;block&gt;</code> elements inside a <code>&lt;value&gt;</code> — not as shadows:</p>

        <div class="code-block">
          <div class="code-block-header"><span class="code-block-lang">XML — Boolean input</span><button class="copy-btn">Copy</button></div>
          <pre><code><span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"control_if"</span><span class="t-tag">&gt;</span>
  <span class="t-tag">&lt;value</span> <span class="t-attr">name</span>=<span class="t-val">"CONDITION"</span><span class="t-tag">&gt;</span>
    <span class="t-cm">&lt;!-- Boolean block — use &lt;block&gt;, not &lt;shadow&gt; --&gt;</span>
    <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"sensing_keypressed"</span><span class="t-tag">&gt;</span>
      <span class="t-tag">&lt;value</span> <span class="t-attr">name</span>=<span class="t-val">"KEY_OPTION"</span><span class="t-tag">&gt;</span>
        <span class="t-tag">&lt;shadow</span> <span class="t-attr">type</span>=<span class="t-val">"sensing_keyoptions"</span><span class="t-tag">&gt;</span>
          <span class="t-tag">&lt;field</span> <span class="t-attr">name</span>=<span class="t-val">"KEY_OPTION"</span><span class="t-tag">&gt;</span>space<span class="t-tag">&lt;/field&gt;</span>
        <span class="t-tag">&lt;/shadow&gt;</span>
      <span class="t-tag">&lt;/value&gt;</span>
    <span class="t-tag">&lt;/block&gt;</span>
  <span class="t-tag">&lt;/value&gt;</span>
  <span class="t-tag">&lt;statement</span> <span class="t-attr">name</span>=<span class="t-val">"SUBSTACK"</span><span class="t-tag">&gt;</span>
    <span class="t-cm">&lt;!-- blocks to run when condition is true --&gt;</span>
  <span class="t-tag">&lt;/statement&gt;</span>
<span class="t-tag">&lt;/block&gt;</span></code></pre>
        </div>
      </div>

      <div class="doc-footer">
        <div class="footer-note">Last updated · v6.3</div>
        <div class="doc-nav-btns">
          <a class="doc-nav-btn prev" href="getting-started.html"><span class="nav-label">Previous</span><span class="nav-title">Getting Started</span></a>
          <a class="doc-nav-btn next" href="inputs-fields.html"><span class="nav-label">Next</span><span class="nav-title">Inputs &amp; Fields</span></a>
        </div>
      </div>

    </main>
  </div>
</div>
<script src="../assets/js/wiki.js"></script>
</body>
</html>
