<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Project XML — Scratch XML Injector Docs</title>
  <link rel="stylesheet" href="../assets/css/main.css"/>
</head>
<body>
<div id="scroll-bar"></div>
<header class="topbar">
  <a class="topbar-logo" href="../index.html"><div class="logo-mark">S</div><span class="logo-name">SXI <span class="logo-sub">Docs</span></span></a>
  <nav class="topbar-nav">
    <a href="../index.html">Home</a>
    <a href="getting-started.html">Guide</a>
    <a href="blocks-xml.html">Blocks XML</a>
    <a href="project-xml.html" class="active">Project XML</a>
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
    <a class="sidebar-link" href="blocks-xml.html"><span class="icon">~</span>Blocks XML</a>
    <a class="sidebar-link" href="opcodes.html"><span class="icon">≡</span>Opcode Reference</a>
    <a class="sidebar-link" href="inputs-fields.html"><span class="icon">⌥</span>Inputs &amp; Fields</a>
    <a class="sidebar-link active" href="project-xml.html"><span class="icon">#</span>Project XML</a>
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
        <div class="breadcrumb"><a href="../index.html">docs</a><span class="sep">/</span><span>project-xml</span></div>
        <h1>Project XML</h1>
        <p class="lead">Bootstrap entire Scratch projects — multiple sprites, auto-rendered costumes, and complete block scripts — from a single XML document.</p>
        <div class="meta">
          <span class="meta-tag yellow">⚠ Wipes project</span>
          <span class="meta-tag blue">~8 min read</span>
        </div>
      </div>

      <div class="callout danger">
        <div class="callout-icon">⚠</div>
        <div><strong>Destructive operation.</strong> Project XML mode <em>completely replaces</em> the current project. All existing sprites, costumes, sounds, and variables will be lost. Save your project via File → Save to your computer before using this mode.</div>
      </div>

      <div class="doc-section" id="structure">
        <h2 class="section-title"><span class="num">01</span>Document Structure</h2>
        <div class="code-block">
          <div class="code-block-header"><span class="code-block-lang">XML — Full skeleton</span><button class="copy-btn">Copy</button></div>
          <pre><code><span class="t-tag">&lt;project&gt;</span>

  <span class="t-cm">&lt;!-- Optional: backdrop tint colour --&gt;</span>
  <span class="t-tag">&lt;stage</span> <span class="t-attr">color</span>=<span class="t-val">"#0a0a1a"</span><span class="t-tag">/&gt;</span>

  <span class="t-cm">&lt;!-- One or more sprites --&gt;</span>
  <span class="t-tag">&lt;sprite</span> <span class="t-attr">name</span>=<span class="t-val">"Player"</span> <span class="t-attr">x</span>=<span class="t-val">"0"</span> <span class="t-attr">y</span>=<span class="t-val">"0"</span> <span class="t-attr">visible</span>=<span class="t-val">"true"</span><span class="t-tag">&gt;</span>

    <span class="t-cm">&lt;!-- One or more costume descriptors --&gt;</span>
    <span class="t-tag">&lt;costume</span> <span class="t-attr">type</span>=<span class="t-val">"circle"</span> <span class="t-attr">color</span>=<span class="t-val">"#4c8fff"</span>
             <span class="t-attr">stroke</span>=<span class="t-val">"#88bbff"</span> <span class="t-attr">stroke-width</span>=<span class="t-val">"3"</span>
             <span class="t-attr">size</span>=<span class="t-val">"40"</span><span class="t-tag">/&gt;</span>

    <span class="t-cm">&lt;!-- Block scripts for this sprite --&gt;</span>
    <span class="t-tag">&lt;blocks&gt;</span>
      <span class="t-tag">&lt;xml</span> <span class="t-attr">xmlns</span>=<span class="t-val">"https://developers.google.com/blockly/xml"</span><span class="t-tag">&gt;</span>
        <span class="t-cm">&lt;!-- standard Blockly XML goes here --&gt;</span>
      <span class="t-tag">&lt;/xml&gt;</span>
    <span class="t-tag">&lt;/blocks&gt;</span>

  <span class="t-tag">&lt;/sprite&gt;</span>

  <span class="t-cm">&lt;!-- Add as many &lt;sprite&gt; elements as you need --&gt;</span>

<span class="t-tag">&lt;/project&gt;</span></code></pre>
        </div>
      </div>

      <div class="doc-section" id="stage">
        <h2 class="section-title"><span class="num">02</span>&lt;stage&gt; Element</h2>
        <p>Controls the stage backdrop. Currently supports a single <code>color</code> attribute which is applied as a tint to the blank white SVG backdrop.</p>
        <div class="attr-grid">
          <div class="attr-card">
            <div class="attr-name">color</div>
            <div class="attr-type">string (CSS hex)</div>
            <div class="attr-desc">Background fill colour for the stage backdrop.</div>
            <div class="attr-default">Default: white (#ffffff)</div>
          </div>
        </div>
      </div>

      <div class="doc-section" id="sprite">
        <h2 class="section-title"><span class="num">03</span>&lt;sprite&gt; Element</h2>
        <p>Each <code>&lt;sprite&gt;</code> creates one sprite in the project. Sprites are added in document order, with the first one on the bottom layer.</p>
        <div class="attr-grid">
          <div class="attr-card">
            <div class="attr-name">name</div>
            <div class="attr-type">string</div>
            <div class="attr-desc">The sprite's display name in the editor.</div>
            <div class="attr-default">Default: "Sprite"</div>
          </div>
          <div class="attr-card">
            <div class="attr-name">x</div>
            <div class="attr-type">number (−240 to 240)</div>
            <div class="attr-desc">Starting X position on the stage.</div>
            <div class="attr-default">Default: 0</div>
          </div>
          <div class="attr-card">
            <div class="attr-name">y</div>
            <div class="attr-type">number (−180 to 180)</div>
            <div class="attr-desc">Starting Y position on the stage.</div>
            <div class="attr-default">Default: 0</div>
          </div>
          <div class="attr-card">
            <div class="attr-name">visible</div>
            <div class="attr-type">boolean</div>
            <div class="attr-desc">Whether the sprite is shown when the project starts.</div>
            <div class="attr-default">Default: true</div>
          </div>
        </div>
      </div>

      <div class="doc-section" id="costumes">
        <h2 class="section-title"><span class="num">04</span>&lt;costume&gt; Elements</h2>
        <p>The injector auto-generates PNG costumes from shape descriptors — no image files required. Each <code>&lt;sprite&gt;</code> must have at least one <code>&lt;costume&gt;</code> element.</p>
        <p>See the full <a href="costumes.html">Costume Shapes reference →</a> for all attributes and visual examples.</p>

        <h3 class="sub-title">Multiple costumes</h3>
        <p>List multiple <code>&lt;costume&gt;</code> elements to give a sprite several costumes. Use <code>looks_switchcostumeto</code> to switch between them.</p>
        <div class="code-block">
          <div class="code-block-header"><span class="code-block-lang">XML — Two costumes</span><button class="copy-btn">Copy</button></div>
          <pre><code><span class="t-tag">&lt;sprite</span> <span class="t-attr">name</span>=<span class="t-val">"Blinker"</span> <span class="t-attr">x</span>=<span class="t-val">"0"</span> <span class="t-attr">y</span>=<span class="t-val">"0"</span><span class="t-tag">&gt;</span>
  <span class="t-tag">&lt;costume</span> <span class="t-attr">name</span>=<span class="t-val">"on"</span>  <span class="t-attr">type</span>=<span class="t-val">"circle"</span> <span class="t-attr">color</span>=<span class="t-val">"#ffee00"</span> <span class="t-attr">size</span>=<span class="t-val">"40"</span><span class="t-tag">/&gt;</span>
  <span class="t-tag">&lt;costume</span> <span class="t-attr">name</span>=<span class="t-val">"off"</span> <span class="t-attr">type</span>=<span class="t-val">"circle"</span> <span class="t-attr">color</span>=<span class="t-val">"#333333"</span> <span class="t-attr">size</span>=<span class="t-val">"40"</span><span class="t-tag">/&gt;</span>
  <span class="t-tag">&lt;blocks&gt;</span>
    <span class="t-tag">&lt;xml</span> <span class="t-attr">xmlns</span>=<span class="t-val">"https://developers.google.com/blockly/xml"</span><span class="t-tag">&gt;</span>
      <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"event_whenflagclicked"</span> <span class="t-attr">x</span>=<span class="t-val">"40"</span> <span class="t-attr">y</span>=<span class="t-val">"40"</span><span class="t-tag">&gt;</span>
        <span class="t-tag">&lt;next&gt;</span>
          <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"control_forever"</span><span class="t-tag">&gt;</span>
            <span class="t-tag">&lt;statement</span> <span class="t-attr">name</span>=<span class="t-val">"SUBSTACK"</span><span class="t-tag">&gt;</span>
              <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"looks_nextcostume"</span><span class="t-tag">&gt;</span>
                <span class="t-tag">&lt;next&gt;</span>
                  <span class="t-tag">&lt;block</span> <span class="t-attr">type</span>=<span class="t-val">"control_wait"</span><span class="t-tag">&gt;</span>
                    <span class="t-tag">&lt;value</span> <span class="t-attr">name</span>=<span class="t-val">"DURATION"</span><span class="t-tag">&gt;</span>
                      <span class="t-tag">&lt;shadow</span> <span class="t-attr">type</span>=<span class="t-val">"math_positive_number"</span><span class="t-tag">&gt;</span>
                        <span class="t-tag">&lt;field</span> <span class="t-attr">name</span>=<span class="t-val">"NUM"</span><span class="t-tag">&gt;</span>0.5<span class="t-tag">&lt;/field&gt;</span>
                      <span class="t-tag">&lt;/shadow&gt;</span>
                    <span class="t-tag">&lt;/value&gt;</span>
                  <span class="t-tag">&lt;/block&gt;</span>
                <span class="t-tag">&lt;/next&gt;</span>
              <span class="t-tag">&lt;/block&gt;</span>
            <span class="t-tag">&lt;/statement&gt;</span>
          <span class="t-tag">&lt;/block&gt;</span>
        <span class="t-tag">&lt;/next&gt;</span>
      <span class="t-tag">&lt;/block&gt;</span>
    <span class="t-tag">&lt;/xml&gt;</span>
    <span class="t-tag">&lt;/blocks&gt;</span>
<span class="t-tag">&lt;/sprite&gt;</span></code></pre>
        </div>
      </div>

      <div class="doc-section" id="blocks">
        <h2 class="section-title"><span class="num">05</span>&lt;blocks&gt; Element</h2>
        <p>Contains the sprite's block scripts, wrapped in a standard <code>&lt;xml&gt;</code> Blockly document. This is identical to the Blocks XML format described in the <a href="blocks-xml.html">Blocks XML guide</a>.</p>
        <p>If a sprite has no blocks, you can omit the <code>&lt;blocks&gt;</code> element entirely.</p>
      </div>

      <div class="doc-footer">
        <div class="footer-note">Last updated · v6.3</div>
        <div class="doc-nav-btns">
          <a class="doc-nav-btn prev" href="inputs-fields.html"><span class="nav-label">Previous</span><span class="nav-title">Inputs &amp; Fields</span></a>
          <a class="doc-nav-btn next" href="costumes.html"><span class="nav-label">Next</span><span class="nav-title">Costume Shapes</span></a>
        </div>
      </div>
    </main>
  </div>
</div>
<script src="../assets/js/wiki.js"></script>
</body>
</html>
