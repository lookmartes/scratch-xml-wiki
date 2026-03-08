// ==UserScript==
// @name         Scratch XML Injector
// @namespace    https://scratch.mit.edu/
// @version      7.0
// @description  Inject, export, merge, and manage Blockly/Project XML in the Scratch editor
// @match        https://scratch.mit.edu/projects/*
// @match        https://turbowarp.org/*
// @grant        none
// ==/UserScript==

(function () {
  if (document.getElementById('__sxi_panel')) {
    document.getElementById('__sxi_panel').remove();
    document.getElementById('__sxi_style')?.remove();
    return;
  }

  /* ======================================================
     FIND VM
  ====================================================== */
  function findVM() {
    if (window._vm?.runtime) return window._vm;
    const crawl = (node, d = 0) => {
      if (!node || d > 500) return null;
      try {
        const p = node.memoizedProps || node.pendingProps || {};
        if (p.vm?.runtime) return p.vm;
        if (node.stateNode?.props?.vm?.runtime) return node.stateNode.props.vm;
        if (node.stateNode?.state?.vm?.runtime) return node.stateNode.state.vm;
      } catch (_) {}
      return crawl(node.child, d + 1) || crawl(node.sibling, d + 1);
    };
    for (const el of document.querySelectorAll('*')) {
      const fKey = Object.keys(el).find(k => k.startsWith('__react'));
      if (!fKey) continue;
      let root = el[fKey];
      if (fKey.startsWith('__reactContainer')) {
        root = root?._internalRoot?.current || root?.current || root;
      }
      const vm = crawl(root);
      if (vm) { window._vm = vm; return vm; }
    }
    return null;
  }

  /* ======================================================
     SANITIZE: strip non-ASCII characters
  ====================================================== */
  function sanitizeXML(str) {
    return str.replace(/[^\x00-\x7F]/g, '');
  }

  /* ======================================================
     SVG SHAPE -> base64 PNG via Canvas
  ====================================================== */
  function shapeToDataURI(shape) {
    const {
      type = 'circle', color = '#4c4fff',
      stroke = 'none', strokeWidth = 0,
      size = 80, width, height,
    } = shape;
    const W = width || size;
    const H = height || size;
    const pad = strokeWidth * 2 + 4;
    const canvas = document.createElement('canvas');
    canvas.width = W + pad;
    canvas.height = H + pad;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.fillStyle = color;
    if (strokeWidth > 0 && stroke !== 'none') {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
    }
    if (type === 'circle') {
      const r = Math.min(W, H) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      if (strokeWidth > 0 && stroke !== 'none') ctx.stroke();
    } else {
      const rx = shape.radius || 0;
      const x0 = cx - W / 2, y0 = cy - H / 2;
      if (rx > 0) {
        ctx.beginPath();
        ctx.moveTo(x0 + rx, y0);
        ctx.lineTo(x0 + W - rx, y0);
        ctx.quadraticCurveTo(x0 + W, y0, x0 + W, y0 + rx);
        ctx.lineTo(x0 + W, y0 + H - rx);
        ctx.quadraticCurveTo(x0 + W, y0 + H, x0 + W - rx, y0 + H);
        ctx.lineTo(x0 + rx, y0 + H);
        ctx.quadraticCurveTo(x0, y0 + H, x0, y0 + H - rx);
        ctx.lineTo(x0, y0 + rx);
        ctx.quadraticCurveTo(x0, y0, x0 + rx, y0);
        ctx.closePath();
        ctx.fill();
        if (strokeWidth > 0 && stroke !== 'none') ctx.stroke();
      } else {
        ctx.fillRect(x0, y0, W, H);
        if (strokeWidth > 0 && stroke !== 'none') ctx.strokeRect(x0, y0, W, H);
      }
    }
    return canvas.toDataURL('image/png');
  }

  function dataURItoUint8(dataURI) {
    const bin = atob(dataURI.split(',')[1]);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  /* ======================================================
     MD5 (pure JS, RFC 1321)
     scratch-vm validates assetId as a true 32-char MD5 hex.
  ====================================================== */
  function md5(input) {
    function safeAdd(x, y) { const lsw = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff); }
    function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function md5ff(a,b,c,d,x,s,t){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function md5gg(a,b,c,d,x,s,t){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
    function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
    function calcMD5(str) {
      const bytes = str instanceof Uint8Array ? str : new TextEncoder().encode(str);
      const len8 = bytes.length * 8;
      const words = [];
      for (let i = 0; i < bytes.length; i++) words[i >> 2] |= bytes[i] << ((i % 4) * 8);
      words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
      words[(((bytes.length + 8) >> 6) << 4) + 14] = len8 & 0xffffffff;
      words[(((bytes.length + 8) >> 6) << 4) + 15] = 0;
      let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (let i = 0; i < words.length; i += 16) {
        const [A,B,C,D] = [a,b,c,d];
        a=md5ff(a,b,c,d,words[i+0],7,-680876936);d=md5ff(d,a,b,c,words[i+1],12,-389564586);c=md5ff(c,d,a,b,words[i+2],17,606105819);b=md5ff(b,c,d,a,words[i+3],22,-1044525330);
        a=md5ff(a,b,c,d,words[i+4],7,-176418897);d=md5ff(d,a,b,c,words[i+5],12,1200080426);c=md5ff(c,d,a,b,words[i+6],17,-1473231341);b=md5ff(b,c,d,a,words[i+7],22,-45705983);
        a=md5ff(a,b,c,d,words[i+8],7,1770035416);d=md5ff(d,a,b,c,words[i+9],12,-1958414417);c=md5ff(c,d,a,b,words[i+10],17,-42063);b=md5ff(b,c,d,a,words[i+11],22,-1990404162);
        a=md5ff(a,b,c,d,words[i+12],7,1804603682);d=md5ff(d,a,b,c,words[i+13],12,-40341101);c=md5ff(c,d,a,b,words[i+14],17,-1502002290);b=md5ff(b,c,d,a,words[i+15],22,1236535329);
        a=md5gg(a,b,c,d,words[i+1],5,-165796510);d=md5gg(d,a,b,c,words[i+6],9,-1069501632);c=md5gg(c,d,a,b,words[i+11],14,643717713);b=md5gg(b,c,d,a,words[i+0],20,-373897302);
        a=md5gg(a,b,c,d,words[i+5],5,-701558691);d=md5gg(d,a,b,c,words[i+10],9,38016083);c=md5gg(c,d,a,b,words[i+15],14,-660478335);b=md5gg(b,c,d,a,words[i+4],20,-405537848);
        a=md5gg(a,b,c,d,words[i+9],5,568446438);d=md5gg(d,a,b,c,words[i+14],9,-1019803690);c=md5gg(c,d,a,b,words[i+3],14,-187363961);b=md5gg(b,c,d,a,words[i+8],20,1163531501);
        a=md5gg(a,b,c,d,words[i+13],5,-1444681467);d=md5gg(d,a,b,c,words[i+2],9,-51403784);c=md5gg(c,d,a,b,words[i+7],14,1735328473);b=md5gg(b,c,d,a,words[i+12],20,-1926607734);
        a=md5hh(a,b,c,d,words[i+5],4,-378558);d=md5hh(d,a,b,c,words[i+8],11,-2022574463);c=md5hh(c,d,a,b,words[i+11],16,1839030562);b=md5hh(b,c,d,a,words[i+14],23,-35309556);
        a=md5hh(a,b,c,d,words[i+1],4,-1530992060);d=md5hh(d,a,b,c,words[i+4],11,1272893353);c=md5hh(c,d,a,b,words[i+7],16,-155497632);b=md5hh(b,c,d,a,words[i+10],23,-1094730640);
        a=md5hh(a,b,c,d,words[i+13],4,681279174);d=md5hh(d,a,b,c,words[i+0],11,-358537222);c=md5hh(c,d,a,b,words[i+3],16,-722521979);b=md5hh(b,c,d,a,words[i+6],23,76029189);
        a=md5hh(a,b,c,d,words[i+9],4,-640364487);d=md5hh(d,a,b,c,words[i+12],11,-421815835);c=md5hh(c,d,a,b,words[i+15],16,530742520);b=md5hh(b,c,d,a,words[i+2],23,-995338651);
        a=md5ii(a,b,c,d,words[i+0],6,-198630844);d=md5ii(d,a,b,c,words[i+7],10,1126891415);c=md5ii(c,d,a,b,words[i+14],15,-1416354905);b=md5ii(b,c,d,a,words[i+5],21,-57434055);
        a=md5ii(a,b,c,d,words[i+12],6,1700485571);d=md5ii(d,a,b,c,words[i+3],10,-1894986606);c=md5ii(c,d,a,b,words[i+10],15,-1051523);b=md5ii(b,c,d,a,words[i+1],21,-2054922799);
        a=md5ii(a,b,c,d,words[i+8],6,1873313359);d=md5ii(d,a,b,c,words[i+15],10,-30611744);c=md5ii(c,d,a,b,words[i+6],15,-1560198380);b=md5ii(b,c,d,a,words[i+13],21,1309151649);
        a=md5ii(a,b,c,d,words[i+4],6,-145523070);d=md5ii(d,a,b,c,words[i+11],10,-1120210379);c=md5ii(c,d,a,b,words[i+2],15,718787259);b=md5ii(b,c,d,a,words[i+9],21,-343485551);
        a=safeAdd(a,A); b=safeAdd(b,B); c=safeAdd(c,C); d=safeAdd(d,D);
      }
      return [a,b,c,d].map(n => { let s=''; for(let j=0;j<4;j++) s+=('0'+((n>>(j*8))&0xff).toString(16)).slice(-2); return s; }).join('');
    }
    return calcMD5(input);
  }

  async function uint8ToMD5(buf) { return md5(buf); }

  /* ======================================================
     XML -> Scratch sb3 block JSON
  ====================================================== */
  function xmlToBlocks(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
    const blocks = {};
    const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const PRIMITIVE_SHADOWS = {
      math_number: 4, math_positive_number: 5, math_whole_number: 6,
      math_integer: 7, math_angle: 8, colour_picker: 9,
      text: 10, event_broadcast_menu: 11,
      data_variable: 12, data_listcontents: 13,
    };
    function processBlock(el, parentId) {
      const id = el.getAttribute('id') || uid();
      const opcode = el.getAttribute('type');
      if (!opcode) return null;
      const isShadow = el.tagName === 'shadow';
      const isTop = !parentId;
      const block = { opcode, next: null, parent: parentId || null, inputs: {}, fields: {}, shadow: isShadow, topLevel: isTop };
      if (isTop) { block.x = parseFloat(el.getAttribute('x')) || 0; block.y = parseFloat(el.getAttribute('y')) || 0; }
      for (const child of el.children) {
        const tag = child.tagName;
        if (tag === 'field') {
          const name = child.getAttribute('name');
          if (name) block.fields[name] = [child.textContent, null];
        } else if (tag === 'value') {
          const name = child.getAttribute('name');
          if (!name) continue;
          const blockEl = child.querySelector(':scope > block');
          const shadowEl = child.querySelector(':scope > shadow');
          if (blockEl && shadowEl) {
            const bId = processBlock(blockEl, id), sId = processBlock(shadowEl, id);
            if (bId && sId) block.inputs[name] = [3, bId, sId];
            else if (bId) block.inputs[name] = [2, bId];
          } else if (blockEl) {
            const bId = processBlock(blockEl, id);
            if (bId) block.inputs[name] = [2, bId];
          } else if (shadowEl) {
            const shadowOpcode = shadowEl.getAttribute('type');
            const primType = PRIMITIVE_SHADOWS[shadowOpcode];
            if (primType !== undefined) {
              const fieldEl = shadowEl.querySelector('field');
              block.inputs[name] = [1, [primType, fieldEl ? fieldEl.textContent : '']];
            } else {
              const sId = processBlock(shadowEl, id);
              if (sId) block.inputs[name] = [1, sId];
            }
          }
        } else if (tag === 'statement') {
          const name = child.getAttribute('name');
          if (!name) continue;
          const inner = child.querySelector(':scope > block');
          if (inner) { const bId = processBlock(inner, id); if (bId) block.inputs[name] = [2, bId]; }
        } else if (tag === 'next') {
          const next = child.querySelector(':scope > block');
          if (next) block.next = processBlock(next, id);
        } else if (tag === 'mutation') {
          block.mutation = child.outerHTML;
        }
      }
      blocks[id] = block;
      return id;
    }
    for (const el of doc.querySelectorAll('xml > block')) processBlock(el, null);
    return blocks;
  }

  /* ======================================================
     PARSE PROJECT XML
  ====================================================== */
  async function parseProjectXML(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
    if (doc.querySelector('parseerror, parsererror')) throw new Error('XML parse error');
    if (doc.documentElement.tagName !== 'project') return null;
    const sprites = [];
    for (const spriteEl of doc.documentElement.querySelectorAll('sprite')) {
      const name = spriteEl.getAttribute('name') || 'Sprite';
      const x = parseFloat(spriteEl.getAttribute('x')) || 0;
      const y = parseFloat(spriteEl.getAttribute('y')) || 0;
      const visible = spriteEl.getAttribute('visible') !== 'false';
      const costumes = [];
      for (const cosEl of spriteEl.querySelectorAll('costume')) {
        costumes.push({
          name: cosEl.getAttribute('name') || cosEl.getAttribute('type') || 'costume1',
          shape: {
            type: cosEl.getAttribute('type') || 'circle',
            color: cosEl.getAttribute('color') || '#4c4fff',
            stroke: cosEl.getAttribute('stroke') || 'none',
            strokeWidth: parseFloat(cosEl.getAttribute('stroke-width')) || 0,
            size: parseFloat(cosEl.getAttribute('size')) || 80,
            width: parseFloat(cosEl.getAttribute('width')) || 0,
            height: parseFloat(cosEl.getAttribute('height')) || 0,
            radius: parseFloat(cosEl.getAttribute('radius')) || 0,
          },
        });
      }
      if (!costumes.length) costumes.push({ name: 'costume1', shape: { type: 'circle', color: '#ffffff', size: 60 } });
      let blocks = {};
      const xmlEl = spriteEl.querySelector('blocks > xml');
      if (xmlEl) blocks = xmlToBlocks(new XMLSerializer().serializeToString(xmlEl));
      sprites.push({ name, x, y, visible, costumes, blocks });
    }
    return { sprites };
  }

  /* ======================================================
     BUILD SPRITE TARGET (shared helper)
  ====================================================== */
  async function buildSpriteTarget(sp, layerOrder, assetMap) {
    const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const costumeDefs = [];
    for (const { shape, name: cosName } of sp.costumes) {
      const dataURI = shapeToDataURI(shape);
      const bytes = dataURItoUint8(dataURI);
      const assetId = await uint8ToMD5(bytes);
      assetMap.set(assetId, bytes);
      const W = shape.width || shape.size || 80;
      const H = shape.height || shape.size || 80;
      const sw = shape.strokeWidth || 0;
      costumeDefs.push({
        name: cosName, dataFormat: 'png', assetId,
        md5ext: assetId + '.png',
        rotationCenterX: W / 2 + sw + 2,
        rotationCenterY: H / 2 + sw + 2,
      });
    }
    return {
      isStage: false, name: sp.name,
      variables: {}, lists: {}, broadcasts: {},
      blocks: sp.blocks, comments: {},
      currentCostume: 0, costumes: costumeDefs, sounds: [],
      id: uid(), x: sp.x, y: sp.y,
      size: 100, direction: 90, draggable: false,
      rotationStyle: 'all around', visible: sp.visible,
      layerOrder, volume: 100,
    };
  }

  /* ======================================================
     BUILD + LOAD FULL PROJECT (WIPE mode)
  ====================================================== */
  async function buildAndLoadProject(parsed, vm) {
    const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const storage = vm.runtime.storage;
    const assetMap = new Map();
    const project = {
      targets: [], monitors: [], extensions: [],
      meta: { semver: '3.0.0', vm: '0.2.0', agent: 'scratch-xml-injector' },
    };
    project.targets.push({
      isStage: true, name: 'Stage',
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: [{ name: 'backdrop1', dataFormat: 'svg', assetId: 'cd21514d0531fdffb22204e0ec5ed84a', md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg', rotationCenterX: 240, rotationCenterY: 180 }],
      sounds: [], id: uid(), layerOrder: 0,
      tempo: 60, volume: 100, videoTransparency: 50, videoState: 'on', textToSpeechLanguage: null,
    });
    for (let si = 0; si < parsed.sprites.length; si++) {
      const target = await buildSpriteTarget(parsed.sprites[si], si + 1, assetMap);
      project.targets.push(target);
    }
    await patchStorageAndLoad(vm, storage, assetMap, JSON.stringify(project));
    vm.runtime.emit('PROJECT_CHANGED');
  }

  /* ======================================================
     MERGE PROJECT XML — add sprites WITHOUT wiping existing ones
  ====================================================== */
  async function mergeProjectXML(parsed, vm) {
    const storage = vm.runtime.storage;
    const assetMap = new Map();

    // Read current project state
    const proj = JSON.parse(vm.toJSON());
    const maxLayer = proj.targets.reduce((m, t) => Math.max(m, t.layerOrder || 0), 0);

    for (let si = 0; si < parsed.sprites.length; si++) {
      const sp = parsed.sprites[si];
      // If a sprite with this name already exists, update its blocks & costumes
      const existing = proj.targets.find(t => !t.isStage && t.name === sp.name);
      if (existing) {
        // Replace blocks only
        existing.blocks = sp.blocks;
        // Update costumes if the sprite XML has any
        const newCostumes = [];
        for (const { shape, name: cosName } of sp.costumes) {
          const dataURI = shapeToDataURI(shape);
          const bytes = dataURItoUint8(dataURI);
          const assetId = await uint8ToMD5(bytes);
          assetMap.set(assetId, bytes);
          const W = shape.width || shape.size || 80;
          const H = shape.height || shape.size || 80;
          const sw = shape.strokeWidth || 0;
          newCostumes.push({ name: cosName, dataFormat: 'png', assetId, md5ext: assetId + '.png', rotationCenterX: W / 2 + sw + 2, rotationCenterY: H / 2 + sw + 2 });
        }
        if (newCostumes.length) existing.costumes = newCostumes;
      } else {
        // Add as a brand new sprite
        const target = await buildSpriteTarget(sp, maxLayer + si + 1, assetMap);
        proj.targets.push(target);
      }
    }

    await patchStorageAndLoad(vm, storage, assetMap, JSON.stringify(proj));
    vm.runtime.emit('PROJECT_CHANGED');
  }

  /* ======================================================
     PATCH STORAGE + LOAD (shared helper)
  ====================================================== */
  async function patchStorageAndLoad(vm, storage, assetMap, projectJSON) {
    let origLoad = null;
    if (storage?.load) {
      origLoad = storage.load.bind(storage);
      storage.load = async (assetType, id, fmt) => {
        if (assetMap.has(id)) {
          try { return storage.createAsset(assetType, fmt || 'png', assetMap.get(id), id, true); } catch (_) {}
        }
        return origLoad(assetType, id, fmt);
      };
    }
    try { await vm.loadProject(projectJSON); }
    finally { if (storage && origLoad) storage.load = origLoad; }
  }

  /* ======================================================
     INJECT BLOCKS XML — REPLACE (wipe sprite blocks)
  ====================================================== */
  async function injectBlocksXML(xmlString, vm) {
    const B = window.Blockly;
    const ws = B?.getMainWorkspace?.() || B?.mainWorkspace;
    if (ws && B?.Xml?.domToWorkspace) {
      const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      ws.clear();
      B.Xml.domToWorkspace(doc.documentElement, ws);
      ws.scrollCenter?.();
      try { vm.runtime.emit('PROJECT_CHANGED'); } catch (_) {}
      return 'workspace';
    }
    const proj = JSON.parse(vm.toJSON());
    const target = vm.editingTarget;
    if (!target) throw new Error('No active sprite.');
    const td = proj.targets.find(t => t.id === target.id);
    if (!td) throw new Error('Target not found in project JSON.');
    td.blocks = xmlToBlocks(xmlString);
    await vm.loadProject(JSON.stringify(proj));
    return 'reload';
  }

  /* ======================================================
     INJECT BLOCKS XML — APPEND (merge new blocks on top of existing)
  ====================================================== */
  async function appendBlocksXML(xmlString, vm) {
    const B = window.Blockly;
    const ws = B?.getMainWorkspace?.() || B?.mainWorkspace;
    if (ws && B?.Xml?.domToWorkspace) {
      // Blockly workspace: just add without clearing
      const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      B.Xml.domToWorkspace(doc.documentElement, ws);
      ws.scrollCenter?.();
      try { vm.runtime.emit('PROJECT_CHANGED'); } catch (_) {}
      return 'workspace-append';
    }
    // VM path: merge block maps
    const proj = JSON.parse(vm.toJSON());
    const target = vm.editingTarget;
    if (!target) throw new Error('No active sprite.');
    const td = proj.targets.find(t => t.id === target.id);
    if (!td) throw new Error('Target not found in project JSON.');
    const newBlocks = xmlToBlocks(xmlString);
    td.blocks = Object.assign({}, td.blocks, newBlocks);
    await vm.loadProject(JSON.stringify(proj));
    return 'reload-append';
  }

  /* ======================================================
     EXPORT — Sprite blocks XML (current sprite)
  ====================================================== */
  function exportSpriteXML(vm) {
    const B = window.Blockly;
    const ws = B?.getMainWorkspace?.() || B?.mainWorkspace;
    if (ws && B?.Xml?.workspaceToDom) {
      return new XMLSerializer().serializeToString(B.Xml.workspaceToDom(ws));
    }
    const xml = vm?.editingTarget?.blocks?.toXML?.();
    if (xml) return xml;
    throw new Error('Cannot export sprite XML.');
  }

  /* ======================================================
     EXPORT — Full project as XML <project> document
  ====================================================== */
  function exportProjectXML(vm) {
    const proj = JSON.parse(vm.toJSON());
    const sprites = proj.targets.filter(t => !t.isStage);
    if (!sprites.length) throw new Error('No sprites in project.');

    let xml = '<project>\n';

    for (const sp of sprites) {
      xml += `  <sprite name="${escXML(sp.name)}" x="${sp.x}" y="${sp.y}" visible="${sp.visible}">\n`;

      // Export costumes as shape hints (best-effort reverse)
      for (const cos of sp.costumes) {
        xml += `    <!-- costume: ${escXML(cos.name)} (${cos.dataFormat}) -->\n`;
      }

      // Export blocks
      if (Object.keys(sp.blocks).length > 0) {
        const blockXML = blocksToXML(sp.blocks);
        xml += `    <blocks>\n${blockXML}\n    </blocks>\n`;
      }

      xml += '  </sprite>\n';
    }

    xml += '</project>';
    return xml;
  }

  /* ======================================================
     CONVERT sb3 blocks JSON -> Blockly XML string
     (reverse of xmlToBlocks — for full project export)
  ====================================================== */
  function blocksToXML(blocks) {
    // Find top-level blocks
    const topBlocks = Object.entries(blocks).filter(([, b]) => b.topLevel);

    const PRIMITIVE_TYPES = { 4:'math_number', 5:'math_positive_number', 6:'math_whole_number', 7:'math_integer', 8:'math_angle', 9:'colour_picker', 10:'text', 11:'event_broadcast_menu', 12:'data_variable', 13:'data_listcontents' };
    const PRIMITIVE_FIELDS = { 4:'NUM', 5:'NUM', 6:'NUM', 7:'NUM', 8:'NUM', 9:'COLOUR', 10:'TEXT', 11:'BROADCAST_OPTION', 12:'VARIABLE', 13:'LIST' };

    function blockToXML(id, indent) {
      const b = blocks[id];
      if (!b) return '';
      const pad = ' '.repeat(indent);
      const tag = b.shadow ? 'shadow' : 'block';
      const pos = b.topLevel ? ` x="${b.x || 0}" y="${b.y || 0}"` : '';
      let out = `${pad}<${tag} type="${escXML(b.opcode)}"${pos}>\n`;

      // Fields
      for (const [name, val] of Object.entries(b.fields || {})) {
        out += `${pad}  <field name="${escXML(name)}">${escXML(String(val[0]))}</field>\n`;
      }

      // Inputs
      for (const [name, inp] of Object.entries(b.inputs || {})) {
        const [inputType, primary, secondary] = inp;
        // Check if primary is a primitive array [type, value]
        if (Array.isArray(primary) && typeof primary[0] === 'number') {
          const primType = primary[0];
          const primVal = primary[1] ?? '';
          const shadowType = PRIMITIVE_TYPES[primType] || 'text';
          const fieldName = PRIMITIVE_FIELDS[primType] || 'TEXT';
          out += `${pad}  <value name="${escXML(name)}">\n`;
          out += `${pad}    <shadow type="${shadowType}">\n`;
          out += `${pad}      <field name="${fieldName}">${escXML(String(primVal))}</field>\n`;
          out += `${pad}    </shadow>\n`;
          out += `${pad}  </value>\n`;
        } else if (typeof primary === 'string') {
          const innerBlock = blocks[primary];
          // Determine if this is a statement (C-block) or value
          const isStatement = innerBlock && innerBlock.opcode && !innerBlock.shadow &&
            (name === 'SUBSTACK' || name === 'SUBSTACK2');
          if (isStatement) {
            out += `${pad}  <statement name="${escXML(name)}">\n`;
            out += blockToXML(primary, indent + 4);
            out += `${pad}  </statement>\n`;
          } else {
            out += `${pad}  <value name="${escXML(name)}">\n`;
            if (inputType === 3 && typeof secondary === 'string') {
              // block + shadow
              out += blockToXML(primary, indent + 4);
              out += blockToXML(secondary, indent + 4);
            } else {
              out += blockToXML(primary, indent + 4);
            }
            out += `${pad}  </value>\n`;
          }
        }
      }

      // Next
      if (b.next) {
        out += `${pad}  <next>\n`;
        out += blockToXML(b.next, indent + 4);
        out += `${pad}  </next>\n`;
      }

      out += `${pad}</${tag}>\n`;
      return out;
    }

    let xmlOut = `      <xml xmlns="https://developers.google.com/blockly/xml">\n`;
    for (const [id] of topBlocks) {
      xmlOut += blockToXML(id, 8);
    }
    xmlOut += `      </xml>`;
    return xmlOut;
  }

  function escXML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ======================================================
     PRETTY-PRINT XML
  ====================================================== */
  function prettyXML(raw) {
    return raw.replace(/></g, '>\n<').replace(/\n\n+/g, '\n');
  }

  /* ======================================================
     COPY TO CLIPBOARD
  ====================================================== */
  function copyText(text) {
    return navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    });
  }

  /* ======================================================
     STYLES
  ====================================================== */
  const style = document.createElement('style');
  style.id = '__sxi_style';
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');
    #__sxi_panel {
      position:fixed; top:58px; right:18px; width:420px;
      background:#09090f; border:1.5px solid #5253ff44; border-radius:14px;
      box-shadow:0 0 60px #4c4fff14, 0 16px 48px #00000099;
      z-index:999999; font-family:'JetBrains Mono',monospace;
      overflow:hidden; animation:__sxi_pop .22s cubic-bezier(.34,1.56,.64,1);
      resize:both; min-width:340px; min-height:300px;
    }
    @keyframes __sxi_pop {
      from{opacity:0;transform:scale(.88) translateY(-10px)}
      to  {opacity:1;transform:scale(1) translateY(0)}
    }
    #__sxi_hdr {
      background:linear-gradient(90deg,#0f0f24,#131330);
      padding:10px 14px; display:flex; align-items:center;
      justify-content:space-between; cursor:move;
      border-bottom:1px solid #ffffff08; user-select:none;
    }
    #__sxi_ttl {
      font-family:'Syne',sans-serif; font-weight:800; font-size:12px;
      color:#a5b4fc; letter-spacing:.06em; display:flex; align-items:center; gap:7px;
    }
    #__sxi_ttl em { color:#818cf8; font-style:normal; font-size:15px }
    #__sxi_badge {
      font-size:8px; background:#6366f118; color:#818cf8;
      border:1px solid #6366f130; border-radius:4px; padding:1px 6px; letter-spacing:.07em;
    }
    #__sxi_x {
      background:#ff4f4f18; border:none; color:#f87171; font-size:13px;
      cursor:pointer; border-radius:5px; width:22px; height:22px;
      display:grid; place-items:center; transition:background .15s;
    }
    #__sxi_x:hover { background:#ff4f4f40 }
    #__sxi_tabs { display:flex; background:#07070e; border-bottom:1px solid #ffffff08; overflow-x:auto }
    .sxi_tab {
      flex:1; padding:8px 4px; font-family:'Syne',sans-serif; font-size:9px;
      font-weight:700; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap;
      background:none; border:none; border-bottom:2px solid transparent;
      color:#3a3d60; cursor:pointer; transition:color .15s; min-width:0;
    }
    .sxi_tab:hover  { color:#818cf8 }
    .sxi_tab.active { color:#a5b4fc; border-bottom:2px solid #6366f1 }
    .sxi_pane { padding:13px 14px; display:flex; flex-direction:column; gap:10px }
    .sxi_pane.hidden { display:none }
    .sxi_lbl {
      font-size:9px; color:#6366f155; text-transform:uppercase;
      letter-spacing:.15em; display:flex; align-items:center; gap:6px;
    }
    .sxi_lbl span {
      background:#6366f118; color:#6366f1aa; border:1px solid #6366f128;
      border-radius:3px; padding:1px 5px; font-size:8px; letter-spacing:.04em;
    }
    .sxi_ta {
      width:100%; height:140px; background:#050509;
      border:1px solid #4c4fff28; border-radius:8px; color:#c7d2fe;
      font-family:'JetBrains Mono',monospace; font-size:10.5px;
      padding:10px; resize:vertical; outline:none;
      transition:border-color .2s; box-sizing:border-box; line-height:1.6; tab-size:2;
    }
    .sxi_ta:focus { border-color:#6366f1; box-shadow:0 0 0 2px #6366f118 }
    .sxi_ta::placeholder { color:#2a2d48 }
    .sxi_ta[readonly] { color:#94a3b8; cursor:default }
    .sxi_st { font-size:9.5px; min-height:14px; color:#818cf8; padding:1px 0; transition:color .2s }
    .sxi_st.err  { color:#f87171 }
    .sxi_st.ok   { color:#34d399 }
    .sxi_st.warn { color:#fbbf24 }
    .sxi_row { display:flex; gap:8px }
    .sxi_row > * { flex:1 }
    .sxi_btn {
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      border:none; color:#fff; font-family:'Syne',sans-serif;
      font-weight:700; font-size:10px; letter-spacing:.05em;
      padding:8px 6px; border-radius:8px; cursor:pointer;
      transition:opacity .15s, transform .1s; text-transform:uppercase;
    }
    .sxi_btn:hover    { opacity:.85 }
    .sxi_btn:active   { transform:scale(.97) }
    .sxi_btn:disabled { opacity:.3; cursor:default }
    .sxi_btn.danger  { background:linear-gradient(135deg,#ef4444,#dc2626) }
    .sxi_btn.emerald { background:linear-gradient(135deg,#10b981,#059669) }
    .sxi_btn.amber   { background:linear-gradient(135deg,#f59e0b,#d97706) }
    .sxi_ghost {
      background:none; border:1px solid #4c4fff40; color:#818cf8;
      font-family:'JetBrains Mono',monospace; font-size:9.5px;
      padding:5px 9px; border-radius:6px; cursor:pointer;
      transition:background .15s; letter-spacing:.04em;
    }
    .sxi_ghost:hover { background:#4c4fff18 }
    .sxi_progress { height:2px; background:#6366f120; border-radius:2px; overflow:hidden }
    .sxi_progress_bar {
      height:100%; width:0%;
      background:linear-gradient(90deg,#6366f1,#a78bfa);
      border-radius:2px; transition:width .3s ease;
    }
    .sxi_mode_row { display:flex; gap:5px }
    .sxi_mode_btn {
      flex:1; padding:6px 4px; font-family:'Syne',sans-serif; font-size:8px;
      font-weight:700; letter-spacing:.05em; text-transform:uppercase;
      border-radius:6px; border:1px solid #4c4fff30; background:none;
      color:#4c4f7a; cursor:pointer; transition:all .15s;
    }
    .sxi_mode_btn.active { background:#6366f122; border-color:#6366f1; color:#a5b4fc }
    .sxi_mode_btn.active.danger  { background:#ef444422; border-color:#ef4444; color:#fca5a5 }
    .sxi_mode_btn.active.emerald { background:#10b98122; border-color:#10b981; color:#6ee7b7 }
    .sxi_mode_btn.active.amber   { background:#f59e0b22; border-color:#f59e0b; color:#fcd34d }
    .sxi_mode_btn:hover { color:#818cf8 }
    .sxi_sprite_badge { font-size:9px; color:#6366f188; font-style:italic; min-height:12px }
    @keyframes __sxi_flash {
      0%   { background:linear-gradient(135deg,#34d399,#059669) }
      100% { background:linear-gradient(135deg,#6366f1,#8b5cf6) }
    }
    .flash { animation:__sxi_flash .4s ease }
    .sxi_divider { border:none; border-top:1px solid #ffffff08; margin:2px 0 }
    .sxi_hint {
      font-size:8.5px; color:#3a3d5a; line-height:1.6;
      background:#050509; border:1px solid #4c4fff18;
      border-radius:6px; padding:7px 9px;
    }
    .sxi_hint code { color:#818cf8 }
    .sxi_sanitize_row { display:flex; align-items:center; gap:8px }
    .sxi_sanitize_badge {
      font-size:8px; color:#fbbf24; background:#fbbf2412;
      border:1px solid #fbbf2430; border-radius:4px;
      padding:2px 7px; letter-spacing:.05em; display:none;
    }
    .sxi_sanitize_badge.visible { display:inline-block }
    .sxi_section_title {
      font-size:8px; text-transform:uppercase; letter-spacing:.14em;
      color:#3a3d60; font-family:'Syne',sans-serif; font-weight:700;
      border-top:1px solid #ffffff08; padding-top:8px; margin-top:2px;
    }
    /* Script tab */
    #__sxi_p_script .sxi_script_box {
      background:#050509; border:1px solid #4c4fff28; border-radius:8px;
      padding:10px; font-size:9.5px; color:#c7d2fe; line-height:1.7;
      max-height:180px; overflow-y:auto; user-select:all;
      font-family:'JetBrains Mono',monospace; word-break:break-all;
    }
  `;
  document.head.appendChild(style);

  /* ======================================================
     EXAMPLES
  ====================================================== */
  const EXAMPLE_PROJECT = `<project>
  <stage color="#0a0a1a"/>
  <sprite name="Player" x="0" y="-100">
    <costume type="circle" color="#4c8fff" stroke="#88bbff" stroke-width="3" size="40"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="40" y="40">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="motion_ifonedgebounce">
                  <next>
                    <block type="control_if">
                      <value name="CONDITION">
                        <block type="sensing_keypressed">
                          <value name="KEY_OPTION">
                            <shadow type="sensing_keyoptions">
                              <field name="KEY_OPTION">right arrow</field>
                            </shadow>
                          </value>
                        </block>
                      </value>
                      <statement name="SUBSTACK">
                        <block type="motion_changexby">
                          <value name="DX">
                            <shadow type="math_number"><field name="NUM">5</field></shadow>
                          </value>
                        </block>
                      </statement>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>
  <sprite name="Enemy" x="80" y="60">
    <costume type="rectangle" color="#ff4455" width="50" height="50" radius="8"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="40" y="40">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="motion_turnright">
                  <value name="DEGREES">
                    <shadow type="math_number"><field name="NUM">3</field></shadow>
                  </value>
                  <next>
                    <block type="motion_movesteps">
                      <value name="STEPS">
                        <shadow type="math_number"><field name="NUM">2</field></shadow>
                      </value>
                      <next><block type="motion_ifonedgebounce"/></next>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>
</project>`;

  const EXAMPLE_BLOCKS = `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="event_whenflagclicked" x="60" y="60">
    <next>
      <block type="control_forever">
        <statement name="SUBSTACK">
          <block type="motion_turnright">
            <value name="DEGREES">
              <shadow type="math_number"><field name="NUM">5</field></shadow>
            </value>
            <next>
              <block type="motion_movesteps">
                <value name="STEPS">
                  <shadow type="math_number"><field name="NUM">3</field></shadow>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </next>
  </block>
</xml>`;

  /* ======================================================
     HTML PANEL
  ====================================================== */
  const panel = document.createElement('div');
  panel.id = '__sxi_panel';
  panel.innerHTML = `
    <div id="__sxi_hdr">
      <div id="__sxi_ttl">
        <em>[#]</em> Scratch XML Injector
        <span id="__sxi_badge">v7.0</span>
      </div>
      <button id="__sxi_x" title="Close">x</button>
    </div>
    <div id="__sxi_tabs">
      <button class="sxi_tab active" data-tab="inject">~&gt; Inject</button>
      <button class="sxi_tab" data-tab="export">[cp] Export</button>
      <button class="sxi_tab" data-tab="script">&lt;/&gt; Script</button>
      <button class="sxi_tab" data-tab="ref">? Ref</button>
    </div>

    <!-- ── INJECT PANE ── -->
    <div class="sxi_pane" id="__sxi_p_inject">
      <div class="sxi_section_title">Inject mode</div>
      <div class="sxi_mode_row">
        <button class="sxi_mode_btn danger" id="__sxi_m_project">[#] New Project</button>
        <button class="sxi_mode_btn emerald" id="__sxi_m_merge">[+] Add to Project</button>
        <button class="sxi_mode_btn active amber" id="__sxi_m_replace">~ Replace Blocks</button>
        <button class="sxi_mode_btn" id="__sxi_m_append">[+] Append Blocks</button>
      </div>
      <div class="sxi_lbl" id="__sxi_inject_lbl">
        Blocks XML <span>replaces current sprite blocks</span>
      </div>
      <textarea id="__sxi_input" class="sxi_ta" spellcheck="false"
        placeholder="Paste &lt;xml&gt; or &lt;project&gt; XML here..."></textarea>
      <div class="sxi_sanitize_row">
        <button class="sxi_ghost" id="__sxi_sanitize">~ Strip Non-ASCII</button>
        <span class="sxi_sanitize_badge" id="__sxi_sanitize_badge">! non-ASCII detected</span>
      </div>
      <div class="sxi_progress"><div class="sxi_progress_bar" id="__sxi_prog"></div></div>
      <div class="sxi_st" id="__sxi_st_i">Ready.</div>
      <div class="sxi_sprite_badge" id="__sxi_sprite">-</div>
      <div class="sxi_row">
        <button class="sxi_ghost" id="__sxi_eg">! Example</button>
        <button class="sxi_btn amber" id="__sxi_run">~ Replace Blocks</button>
      </div>
    </div>

    <!-- ── EXPORT PANE ── -->
    <div class="sxi_pane hidden" id="__sxi_p_export">
      <div class="sxi_section_title">Export options</div>
      <div class="sxi_row" style="gap:6px">
        <button class="sxi_btn" id="__sxi_grab_sprite">Grab Sprite XML</button>
        <button class="sxi_btn emerald" id="__sxi_grab_project">Grab Project XML</button>
      </div>
      <div class="sxi_lbl" id="__sxi_export_lbl">Grabbed XML appears below</div>
      <textarea id="__sxi_out" class="sxi_ta" readonly
        placeholder="Click a Grab button above..."></textarea>
      <div class="sxi_st" id="__sxi_st_e">Choose what to export.</div>
      <div class="sxi_row">
        <button class="sxi_btn" id="__sxi_copy">[cp] Copy to Clipboard</button>
      </div>
    </div>

    <!-- ── SCRIPT PANE ── -->
    <div class="sxi_pane hidden" id="__sxi_p_script">
      <div class="sxi_lbl">Userscript source — select all &amp; copy</div>
      <div class="sxi_hint" style="margin-bottom:4px">
        Copy the script below into Tampermonkey to install or update.<br>
        <code>Dashboard → + → paste → Ctrl+S</code>
      </div>
      <div id="__sxi_script_box" class="sxi_script_box">Loading...</div>
      <div class="sxi_st" id="__sxi_st_s">Click copy to grab the full script.</div>
      <div class="sxi_row">
        <button class="sxi_ghost" id="__sxi_script_selall">Select All</button>
        <button class="sxi_btn" id="__sxi_script_copy">[cp] Copy Script</button>
      </div>
    </div>

    <!-- ── REFERENCE PANE ── -->
    <div class="sxi_pane hidden" id="__sxi_p_ref">
      <div class="sxi_lbl">Mode reference</div>
      <div class="sxi_hint">
        <b style="color:#fca5a5">[#] New Project</b> — wipes ALL sprites, builds fresh<br>
        <b style="color:#6ee7b7">[+] Add to Project</b> — merges sprites; matching names update in place<br>
        <b style="color:#fcd34d">~ Replace Blocks</b> — replaces active sprite blocks only<br>
        <b style="color:#a5b4fc">[+] Append Blocks</b> — adds blocks to sprite without deleting existing ones<br><br>
        <b style="color:#818cf8">Export:</b><br>
        <code>Grab Sprite XML</code> — current sprite Blockly XML<br>
        <code>Grab Project XML</code> — full project as &lt;project&gt; document<br><br>
        <b style="color:#fbbf24">Non-ASCII fix:</b> use "Strip Non-ASCII" or the auto-strip on inject<br>
        <b style="color:#818cf8">Wiki:</b> see full docs at your hosted GitHub Pages site
      </div>
      <div class="sxi_hint">
        <code>&lt;project&gt;</code> syntax:<br>
        <code>&lt;stage color="#rrggbb"/&gt;</code><br>
        <code>&lt;sprite name="X" x="0" y="0"&gt;</code><br>
        &nbsp;<code>&lt;costume type="circle" color="#ff4488" size="60"/&gt;</code><br>
        &nbsp;<code>&lt;costume type="rectangle" color="#44aaff" width="80" height="30" radius="8"/&gt;</code><br>
        &nbsp;<code>&lt;blocks&gt;&lt;xml&gt;...&lt;/xml&gt;&lt;/blocks&gt;</code><br>
        <code>&lt;/sprite&gt;</code>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  /* ======================================================
     SCRIPT TAB — self-embedded source for copy
     The full script source is stored here as a string so the
     Copy Script button always works, even in Tampermonkey.
  ====================================================== */
  const __SXI_SOURCE__ = `// ==UserScript==
// @name         Scratch XML Injector
// @namespace    https://scratch.mit.edu/
// @version      7.0
// @description  Inject, export, merge, and manage Blockly/Project XML in the Scratch editor
// @match        https://scratch.mit.edu/projects/*
// @match        https://turbowarp.org/*
// @grant        none
// ==/UserScript==

(function () {
  if (document.getElementById('__sxi_panel')) {
    document.getElementById('__sxi_panel').remove();
    document.getElementById('__sxi_style')?.remove();
    return;
  }

  /* ======================================================
     FIND VM
  ====================================================== */
  function findVM() {
    if (window._vm?.runtime) return window._vm;
    const crawl = (node, d = 0) => {
      if (!node || d > 500) return null;
      try {
        const p = node.memoizedProps || node.pendingProps || {};
        if (p.vm?.runtime) return p.vm;
        if (node.stateNode?.props?.vm?.runtime) return node.stateNode.props.vm;
        if (node.stateNode?.state?.vm?.runtime) return node.stateNode.state.vm;
      } catch (_) {}
      return crawl(node.child, d + 1) || crawl(node.sibling, d + 1);
    };
    for (const el of document.querySelectorAll('*')) {
      const fKey = Object.keys(el).find(k => k.startsWith('__react'));
      if (!fKey) continue;
      let root = el[fKey];
      if (fKey.startsWith('__reactContainer')) {
        root = root?._internalRoot?.current || root?.current || root;
      }
      const vm = crawl(root);
      if (vm) { window._vm = vm; return vm; }
    }
    return null;
  }

  /* ======================================================
     SANITIZE: strip non-ASCII characters
  ====================================================== */
  function sanitizeXML(str) {
    return str.replace(/[^\\x00-\\x7F]/g, '');
  }

  /* ======================================================
     SVG SHAPE -> base64 PNG via Canvas
  ====================================================== */
  function shapeToDataURI(shape) {
    const {
      type = 'circle', color = '#4c4fff',
      stroke = 'none', strokeWidth = 0,
      size = 80, width, height,
    } = shape;
    const W = width || size;
    const H = height || size;
    const pad = strokeWidth * 2 + 4;
    const canvas = document.createElement('canvas');
    canvas.width = W + pad;
    canvas.height = H + pad;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.fillStyle = color;
    if (strokeWidth > 0 && stroke !== 'none') {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
    }
    if (type === 'circle') {
      const r = Math.min(W, H) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      if (strokeWidth > 0 && stroke !== 'none') ctx.stroke();
    } else {
      const rx = shape.radius || 0;
      const x0 = cx - W / 2, y0 = cy - H / 2;
      if (rx > 0) {
        ctx.beginPath();
        ctx.moveTo(x0 + rx, y0);
        ctx.lineTo(x0 + W - rx, y0);
        ctx.quadraticCurveTo(x0 + W, y0, x0 + W, y0 + rx);
        ctx.lineTo(x0 + W, y0 + H - rx);
        ctx.quadraticCurveTo(x0 + W, y0 + H, x0 + W - rx, y0 + H);
        ctx.lineTo(x0 + rx, y0 + H);
        ctx.quadraticCurveTo(x0, y0 + H, x0, y0 + H - rx);
        ctx.lineTo(x0, y0 + rx);
        ctx.quadraticCurveTo(x0, y0, x0 + rx, y0);
        ctx.closePath();
        ctx.fill();
        if (strokeWidth > 0 && stroke !== 'none') ctx.stroke();
      } else {
        ctx.fillRect(x0, y0, W, H);
        if (strokeWidth > 0 && stroke !== 'none') ctx.strokeRect(x0, y0, W, H);
      }
    }
    return canvas.toDataURL('image/png');
  }

  function dataURItoUint8(dataURI) {
    const bin = atob(dataURI.split(',')[1]);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  /* ======================================================
     MD5 (pure JS, RFC 1321)
     scratch-vm validates assetId as a true 32-char MD5 hex.
  ====================================================== */
  function md5(input) {
    function safeAdd(x, y) { const lsw = (x & 0xffff) + (y & 0xffff); return (((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xffff); }
    function bitRotateLeft(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }
    function md5cmn(q, a, b, x, s, t) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
    function md5ff(a,b,c,d,x,s,t){return md5cmn((b&c)|((~b)&d),a,b,x,s,t);}
    function md5gg(a,b,c,d,x,s,t){return md5cmn((b&d)|(c&(~d)),a,b,x,s,t);}
    function md5hh(a,b,c,d,x,s,t){return md5cmn(b^c^d,a,b,x,s,t);}
    function md5ii(a,b,c,d,x,s,t){return md5cmn(c^(b|(~d)),a,b,x,s,t);}
    function calcMD5(str) {
      const bytes = str instanceof Uint8Array ? str : new TextEncoder().encode(str);
      const len8 = bytes.length * 8;
      const words = [];
      for (let i = 0; i < bytes.length; i++) words[i >> 2] |= bytes[i] << ((i % 4) * 8);
      words[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
      words[(((bytes.length + 8) >> 6) << 4) + 14] = len8 & 0xffffffff;
      words[(((bytes.length + 8) >> 6) << 4) + 15] = 0;
      let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
      for (let i = 0; i < words.length; i += 16) {
        const [A,B,C,D] = [a,b,c,d];
        a=md5ff(a,b,c,d,words[i+0],7,-680876936);d=md5ff(d,a,b,c,words[i+1],12,-389564586);c=md5ff(c,d,a,b,words[i+2],17,606105819);b=md5ff(b,c,d,a,words[i+3],22,-1044525330);
        a=md5ff(a,b,c,d,words[i+4],7,-176418897);d=md5ff(d,a,b,c,words[i+5],12,1200080426);c=md5ff(c,d,a,b,words[i+6],17,-1473231341);b=md5ff(b,c,d,a,words[i+7],22,-45705983);
        a=md5ff(a,b,c,d,words[i+8],7,1770035416);d=md5ff(d,a,b,c,words[i+9],12,-1958414417);c=md5ff(c,d,a,b,words[i+10],17,-42063);b=md5ff(b,c,d,a,words[i+11],22,-1990404162);
        a=md5ff(a,b,c,d,words[i+12],7,1804603682);d=md5ff(d,a,b,c,words[i+13],12,-40341101);c=md5ff(c,d,a,b,words[i+14],17,-1502002290);b=md5ff(b,c,d,a,words[i+15],22,1236535329);
        a=md5gg(a,b,c,d,words[i+1],5,-165796510);d=md5gg(d,a,b,c,words[i+6],9,-1069501632);c=md5gg(c,d,a,b,words[i+11],14,643717713);b=md5gg(b,c,d,a,words[i+0],20,-373897302);
        a=md5gg(a,b,c,d,words[i+5],5,-701558691);d=md5gg(d,a,b,c,words[i+10],9,38016083);c=md5gg(c,d,a,b,words[i+15],14,-660478335);b=md5gg(b,c,d,a,words[i+4],20,-405537848);
        a=md5gg(a,b,c,d,words[i+9],5,568446438);d=md5gg(d,a,b,c,words[i+14],9,-1019803690);c=md5gg(c,d,a,b,words[i+3],14,-187363961);b=md5gg(b,c,d,a,words[i+8],20,1163531501);
        a=md5gg(a,b,c,d,words[i+13],5,-1444681467);d=md5gg(d,a,b,c,words[i+2],9,-51403784);c=md5gg(c,d,a,b,words[i+7],14,1735328473);b=md5gg(b,c,d,a,words[i+12],20,-1926607734);
        a=md5hh(a,b,c,d,words[i+5],4,-378558);d=md5hh(d,a,b,c,words[i+8],11,-2022574463);c=md5hh(c,d,a,b,words[i+11],16,1839030562);b=md5hh(b,c,d,a,words[i+14],23,-35309556);
        a=md5hh(a,b,c,d,words[i+1],4,-1530992060);d=md5hh(d,a,b,c,words[i+4],11,1272893353);c=md5hh(c,d,a,b,words[i+7],16,-155497632);b=md5hh(b,c,d,a,words[i+10],23,-1094730640);
        a=md5hh(a,b,c,d,words[i+13],4,681279174);d=md5hh(d,a,b,c,words[i+0],11,-358537222);c=md5hh(c,d,a,b,words[i+3],16,-722521979);b=md5hh(b,c,d,a,words[i+6],23,76029189);
        a=md5hh(a,b,c,d,words[i+9],4,-640364487);d=md5hh(d,a,b,c,words[i+12],11,-421815835);c=md5hh(c,d,a,b,words[i+15],16,530742520);b=md5hh(b,c,d,a,words[i+2],23,-995338651);
        a=md5ii(a,b,c,d,words[i+0],6,-198630844);d=md5ii(d,a,b,c,words[i+7],10,1126891415);c=md5ii(c,d,a,b,words[i+14],15,-1416354905);b=md5ii(b,c,d,a,words[i+5],21,-57434055);
        a=md5ii(a,b,c,d,words[i+12],6,1700485571);d=md5ii(d,a,b,c,words[i+3],10,-1894986606);c=md5ii(c,d,a,b,words[i+10],15,-1051523);b=md5ii(b,c,d,a,words[i+1],21,-2054922799);
        a=md5ii(a,b,c,d,words[i+8],6,1873313359);d=md5ii(d,a,b,c,words[i+15],10,-30611744);c=md5ii(c,d,a,b,words[i+6],15,-1560198380);b=md5ii(b,c,d,a,words[i+13],21,1309151649);
        a=md5ii(a,b,c,d,words[i+4],6,-145523070);d=md5ii(d,a,b,c,words[i+11],10,-1120210379);c=md5ii(c,d,a,b,words[i+2],15,718787259);b=md5ii(b,c,d,a,words[i+9],21,-343485551);
        a=safeAdd(a,A); b=safeAdd(b,B); c=safeAdd(c,C); d=safeAdd(d,D);
      }
      return [a,b,c,d].map(n => { let s=''; for(let j=0;j<4;j++) s+=('0'+((n>>(j*8))&0xff).toString(16)).slice(-2); return s; }).join('');
    }
    return calcMD5(input);
  }

  async function uint8ToMD5(buf) { return md5(buf); }

  /* ======================================================
     XML -> Scratch sb3 block JSON
  ====================================================== */
  function xmlToBlocks(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
    const blocks = {};
    const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const PRIMITIVE_SHADOWS = {
      math_number: 4, math_positive_number: 5, math_whole_number: 6,
      math_integer: 7, math_angle: 8, colour_picker: 9,
      text: 10, event_broadcast_menu: 11,
      data_variable: 12, data_listcontents: 13,
    };
    function processBlock(el, parentId) {
      const id = el.getAttribute('id') || uid();
      const opcode = el.getAttribute('type');
      if (!opcode) return null;
      const isShadow = el.tagName === 'shadow';
      const isTop = !parentId;
      const block = { opcode, next: null, parent: parentId || null, inputs: {}, fields: {}, shadow: isShadow, topLevel: isTop };
      if (isTop) { block.x = parseFloat(el.getAttribute('x')) || 0; block.y = parseFloat(el.getAttribute('y')) || 0; }
      for (const child of el.children) {
        const tag = child.tagName;
        if (tag === 'field') {
          const name = child.getAttribute('name');
          if (name) block.fields[name] = [child.textContent, null];
        } else if (tag === 'value') {
          const name = child.getAttribute('name');
          if (!name) continue;
          const blockEl = child.querySelector(':scope > block');
          const shadowEl = child.querySelector(':scope > shadow');
          if (blockEl && shadowEl) {
            const bId = processBlock(blockEl, id), sId = processBlock(shadowEl, id);
            if (bId && sId) block.inputs[name] = [3, bId, sId];
            else if (bId) block.inputs[name] = [2, bId];
          } else if (blockEl) {
            const bId = processBlock(blockEl, id);
            if (bId) block.inputs[name] = [2, bId];
          } else if (shadowEl) {
            const shadowOpcode = shadowEl.getAttribute('type');
            const primType = PRIMITIVE_SHADOWS[shadowOpcode];
            if (primType !== undefined) {
              const fieldEl = shadowEl.querySelector('field');
              block.inputs[name] = [1, [primType, fieldEl ? fieldEl.textContent : '']];
            } else {
              const sId = processBlock(shadowEl, id);
              if (sId) block.inputs[name] = [1, sId];
            }
          }
        } else if (tag === 'statement') {
          const name = child.getAttribute('name');
          if (!name) continue;
          const inner = child.querySelector(':scope > block');
          if (inner) { const bId = processBlock(inner, id); if (bId) block.inputs[name] = [2, bId]; }
        } else if (tag === 'next') {
          const next = child.querySelector(':scope > block');
          if (next) block.next = processBlock(next, id);
        } else if (tag === 'mutation') {
          block.mutation = child.outerHTML;
        }
      }
      blocks[id] = block;
      return id;
    }
    for (const el of doc.querySelectorAll('xml > block')) processBlock(el, null);
    return blocks;
  }

  /* ======================================================
     PARSE PROJECT XML
  ====================================================== */
  async function parseProjectXML(xmlString) {
    const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
    if (doc.querySelector('parseerror, parsererror')) throw new Error('XML parse error');
    if (doc.documentElement.tagName !== 'project') return null;
    const sprites = [];
    for (const spriteEl of doc.documentElement.querySelectorAll('sprite')) {
      const name = spriteEl.getAttribute('name') || 'Sprite';
      const x = parseFloat(spriteEl.getAttribute('x')) || 0;
      const y = parseFloat(spriteEl.getAttribute('y')) || 0;
      const visible = spriteEl.getAttribute('visible') !== 'false';
      const costumes = [];
      for (const cosEl of spriteEl.querySelectorAll('costume')) {
        costumes.push({
          name: cosEl.getAttribute('name') || cosEl.getAttribute('type') || 'costume1',
          shape: {
            type: cosEl.getAttribute('type') || 'circle',
            color: cosEl.getAttribute('color') || '#4c4fff',
            stroke: cosEl.getAttribute('stroke') || 'none',
            strokeWidth: parseFloat(cosEl.getAttribute('stroke-width')) || 0,
            size: parseFloat(cosEl.getAttribute('size')) || 80,
            width: parseFloat(cosEl.getAttribute('width')) || 0,
            height: parseFloat(cosEl.getAttribute('height')) || 0,
            radius: parseFloat(cosEl.getAttribute('radius')) || 0,
          },
        });
      }
      if (!costumes.length) costumes.push({ name: 'costume1', shape: { type: 'circle', color: '#ffffff', size: 60 } });
      let blocks = {};
      const xmlEl = spriteEl.querySelector('blocks > xml');
      if (xmlEl) blocks = xmlToBlocks(new XMLSerializer().serializeToString(xmlEl));
      sprites.push({ name, x, y, visible, costumes, blocks });
    }
    return { sprites };
  }

  /* ======================================================
     BUILD SPRITE TARGET (shared helper)
  ====================================================== */
  async function buildSpriteTarget(sp, layerOrder, assetMap) {
    const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const costumeDefs = [];
    for (const { shape, name: cosName } of sp.costumes) {
      const dataURI = shapeToDataURI(shape);
      const bytes = dataURItoUint8(dataURI);
      const assetId = await uint8ToMD5(bytes);
      assetMap.set(assetId, bytes);
      const W = shape.width || shape.size || 80;
      const H = shape.height || shape.size || 80;
      const sw = shape.strokeWidth || 0;
      costumeDefs.push({
        name: cosName, dataFormat: 'png', assetId,
        md5ext: assetId + '.png',
        rotationCenterX: W / 2 + sw + 2,
        rotationCenterY: H / 2 + sw + 2,
      });
    }
    return {
      isStage: false, name: sp.name,
      variables: {}, lists: {}, broadcasts: {},
      blocks: sp.blocks, comments: {},
      currentCostume: 0, costumes: costumeDefs, sounds: [],
      id: uid(), x: sp.x, y: sp.y,
      size: 100, direction: 90, draggable: false,
      rotationStyle: 'all around', visible: sp.visible,
      layerOrder, volume: 100,
    };
  }

  /* ======================================================
     BUILD + LOAD FULL PROJECT (WIPE mode)
  ====================================================== */
  async function buildAndLoadProject(parsed, vm) {
    const uid = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);
    const storage = vm.runtime.storage;
    const assetMap = new Map();
    const project = {
      targets: [], monitors: [], extensions: [],
      meta: { semver: '3.0.0', vm: '0.2.0', agent: 'scratch-xml-injector' },
    };
    project.targets.push({
      isStage: true, name: 'Stage',
      variables: {}, lists: {}, broadcasts: {}, blocks: {}, comments: {},
      currentCostume: 0,
      costumes: [{ name: 'backdrop1', dataFormat: 'svg', assetId: 'cd21514d0531fdffb22204e0ec5ed84a', md5ext: 'cd21514d0531fdffb22204e0ec5ed84a.svg', rotationCenterX: 240, rotationCenterY: 180 }],
      sounds: [], id: uid(), layerOrder: 0,
      tempo: 60, volume: 100, videoTransparency: 50, videoState: 'on', textToSpeechLanguage: null,
    });
    for (let si = 0; si < parsed.sprites.length; si++) {
      const target = await buildSpriteTarget(parsed.sprites[si], si + 1, assetMap);
      project.targets.push(target);
    }
    await patchStorageAndLoad(vm, storage, assetMap, JSON.stringify(project));
    vm.runtime.emit('PROJECT_CHANGED');
  }

  /* ======================================================
     MERGE PROJECT XML — add sprites WITHOUT wiping existing ones
  ====================================================== */
  async function mergeProjectXML(parsed, vm) {
    const storage = vm.runtime.storage;
    const assetMap = new Map();

    // Read current project state
    const proj = JSON.parse(vm.toJSON());
    const maxLayer = proj.targets.reduce((m, t) => Math.max(m, t.layerOrder || 0), 0);

    for (let si = 0; si < parsed.sprites.length; si++) {
      const sp = parsed.sprites[si];
      // If a sprite with this name already exists, update its blocks & costumes
      const existing = proj.targets.find(t => !t.isStage && t.name === sp.name);
      if (existing) {
        // Replace blocks only
        existing.blocks = sp.blocks;
        // Update costumes if the sprite XML has any
        const newCostumes = [];
        for (const { shape, name: cosName } of sp.costumes) {
          const dataURI = shapeToDataURI(shape);
          const bytes = dataURItoUint8(dataURI);
          const assetId = await uint8ToMD5(bytes);
          assetMap.set(assetId, bytes);
          const W = shape.width || shape.size || 80;
          const H = shape.height || shape.size || 80;
          const sw = shape.strokeWidth || 0;
          newCostumes.push({ name: cosName, dataFormat: 'png', assetId, md5ext: assetId + '.png', rotationCenterX: W / 2 + sw + 2, rotationCenterY: H / 2 + sw + 2 });
        }
        if (newCostumes.length) existing.costumes = newCostumes;
      } else {
        // Add as a brand new sprite
        const target = await buildSpriteTarget(sp, maxLayer + si + 1, assetMap);
        proj.targets.push(target);
      }
    }

    await patchStorageAndLoad(vm, storage, assetMap, JSON.stringify(proj));
    vm.runtime.emit('PROJECT_CHANGED');
  }

  /* ======================================================
     PATCH STORAGE + LOAD (shared helper)
  ====================================================== */
  async function patchStorageAndLoad(vm, storage, assetMap, projectJSON) {
    let origLoad = null;
    if (storage?.load) {
      origLoad = storage.load.bind(storage);
      storage.load = async (assetType, id, fmt) => {
        if (assetMap.has(id)) {
          try { return storage.createAsset(assetType, fmt || 'png', assetMap.get(id), id, true); } catch (_) {}
        }
        return origLoad(assetType, id, fmt);
      };
    }
    try { await vm.loadProject(projectJSON); }
    finally { if (storage && origLoad) storage.load = origLoad; }
  }

  /* ======================================================
     INJECT BLOCKS XML — REPLACE (wipe sprite blocks)
  ====================================================== */
  async function injectBlocksXML(xmlString, vm) {
    const B = window.Blockly;
    const ws = B?.getMainWorkspace?.() || B?.mainWorkspace;
    if (ws && B?.Xml?.domToWorkspace) {
      const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      ws.clear();
      B.Xml.domToWorkspace(doc.documentElement, ws);
      ws.scrollCenter?.();
      try { vm.runtime.emit('PROJECT_CHANGED'); } catch (_) {}
      return 'workspace';
    }
    const proj = JSON.parse(vm.toJSON());
    const target = vm.editingTarget;
    if (!target) throw new Error('No active sprite.');
    const td = proj.targets.find(t => t.id === target.id);
    if (!td) throw new Error('Target not found in project JSON.');
    td.blocks = xmlToBlocks(xmlString);
    await vm.loadProject(JSON.stringify(proj));
    return 'reload';
  }

  /* ======================================================
     INJECT BLOCKS XML — APPEND (merge new blocks on top of existing)
  ====================================================== */
  async function appendBlocksXML(xmlString, vm) {
    const B = window.Blockly;
    const ws = B?.getMainWorkspace?.() || B?.mainWorkspace;
    if (ws && B?.Xml?.domToWorkspace) {
      // Blockly workspace: just add without clearing
      const doc = new DOMParser().parseFromString(xmlString, 'text/xml');
      B.Xml.domToWorkspace(doc.documentElement, ws);
      ws.scrollCenter?.();
      try { vm.runtime.emit('PROJECT_CHANGED'); } catch (_) {}
      return 'workspace-append';
    }
    // VM path: merge block maps
    const proj = JSON.parse(vm.toJSON());
    const target = vm.editingTarget;
    if (!target) throw new Error('No active sprite.');
    const td = proj.targets.find(t => t.id === target.id);
    if (!td) throw new Error('Target not found in project JSON.');
    const newBlocks = xmlToBlocks(xmlString);
    td.blocks = Object.assign({}, td.blocks, newBlocks);
    await vm.loadProject(JSON.stringify(proj));
    return 'reload-append';
  }

  /* ======================================================
     EXPORT — Sprite blocks XML (current sprite)
  ====================================================== */
  function exportSpriteXML(vm) {
    const B = window.Blockly;
    const ws = B?.getMainWorkspace?.() || B?.mainWorkspace;
    if (ws && B?.Xml?.workspaceToDom) {
      return new XMLSerializer().serializeToString(B.Xml.workspaceToDom(ws));
    }
    const xml = vm?.editingTarget?.blocks?.toXML?.();
    if (xml) return xml;
    throw new Error('Cannot export sprite XML.');
  }

  /* ======================================================
     EXPORT — Full project as XML <project> document
  ====================================================== */
  function exportProjectXML(vm) {
    const proj = JSON.parse(vm.toJSON());
    const sprites = proj.targets.filter(t => !t.isStage);
    if (!sprites.length) throw new Error('No sprites in project.');

    let xml = '<project>\\n';

    for (const sp of sprites) {
      xml += \`  <sprite name="\${escXML(sp.name)}" x="\${sp.x}" y="\${sp.y}" visible="\${sp.visible}">\\n\`;

      // Export costumes as shape hints (best-effort reverse)
      for (const cos of sp.costumes) {
        xml += \`    <!-- costume: \${escXML(cos.name)} (\${cos.dataFormat}) -->\\n\`;
      }

      // Export blocks
      if (Object.keys(sp.blocks).length > 0) {
        const blockXML = blocksToXML(sp.blocks);
        xml += \`    <blocks>\\n\${blockXML}\\n    </blocks>\\n\`;
      }

      xml += '  </sprite>\\n';
    }

    xml += '</project>';
    return xml;
  }

  /* ======================================================
     CONVERT sb3 blocks JSON -> Blockly XML string
     (reverse of xmlToBlocks — for full project export)
  ====================================================== */
  function blocksToXML(blocks) {
    // Find top-level blocks
    const topBlocks = Object.entries(blocks).filter(([, b]) => b.topLevel);

    const PRIMITIVE_TYPES = { 4:'math_number', 5:'math_positive_number', 6:'math_whole_number', 7:'math_integer', 8:'math_angle', 9:'colour_picker', 10:'text', 11:'event_broadcast_menu', 12:'data_variable', 13:'data_listcontents' };
    const PRIMITIVE_FIELDS = { 4:'NUM', 5:'NUM', 6:'NUM', 7:'NUM', 8:'NUM', 9:'COLOUR', 10:'TEXT', 11:'BROADCAST_OPTION', 12:'VARIABLE', 13:'LIST' };

    function blockToXML(id, indent) {
      const b = blocks[id];
      if (!b) return '';
      const pad = ' '.repeat(indent);
      const tag = b.shadow ? 'shadow' : 'block';
      const pos = b.topLevel ? \` x="\${b.x || 0}" y="\${b.y || 0}"\` : '';
      let out = \`\${pad}<\${tag} type="\${escXML(b.opcode)}"\${pos}>\\n\`;

      // Fields
      for (const [name, val] of Object.entries(b.fields || {})) {
        out += \`\${pad}  <field name="\${escXML(name)}">\${escXML(String(val[0]))}</field>\\n\`;
      }

      // Inputs
      for (const [name, inp] of Object.entries(b.inputs || {})) {
        const [inputType, primary, secondary] = inp;
        // Check if primary is a primitive array [type, value]
        if (Array.isArray(primary) && typeof primary[0] === 'number') {
          const primType = primary[0];
          const primVal = primary[1] ?? '';
          const shadowType = PRIMITIVE_TYPES[primType] || 'text';
          const fieldName = PRIMITIVE_FIELDS[primType] || 'TEXT';
          out += \`\${pad}  <value name="\${escXML(name)}">\\n\`;
          out += \`\${pad}    <shadow type="\${shadowType}">\\n\`;
          out += \`\${pad}      <field name="\${fieldName}">\${escXML(String(primVal))}</field>\\n\`;
          out += \`\${pad}    </shadow>\\n\`;
          out += \`\${pad}  </value>\\n\`;
        } else if (typeof primary === 'string') {
          const innerBlock = blocks[primary];
          // Determine if this is a statement (C-block) or value
          const isStatement = innerBlock && innerBlock.opcode && !innerBlock.shadow &&
            (name === 'SUBSTACK' || name === 'SUBSTACK2');
          if (isStatement) {
            out += \`\${pad}  <statement name="\${escXML(name)}">\\n\`;
            out += blockToXML(primary, indent + 4);
            out += \`\${pad}  </statement>\\n\`;
          } else {
            out += \`\${pad}  <value name="\${escXML(name)}">\\n\`;
            if (inputType === 3 && typeof secondary === 'string') {
              // block + shadow
              out += blockToXML(primary, indent + 4);
              out += blockToXML(secondary, indent + 4);
            } else {
              out += blockToXML(primary, indent + 4);
            }
            out += \`\${pad}  </value>\\n\`;
          }
        }
      }

      // Next
      if (b.next) {
        out += \`\${pad}  <next>\\n\`;
        out += blockToXML(b.next, indent + 4);
        out += \`\${pad}  </next>\\n\`;
      }

      out += \`\${pad}</\${tag}>\\n\`;
      return out;
    }

    let xmlOut = \`      <xml xmlns="https://developers.google.com/blockly/xml">\\n\`;
    for (const [id] of topBlocks) {
      xmlOut += blockToXML(id, 8);
    }
    xmlOut += \`      </xml>\`;
    return xmlOut;
  }

  function escXML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ======================================================
     PRETTY-PRINT XML
  ====================================================== */
  function prettyXML(raw) {
    return raw.replace(/></g, '>\\n<').replace(/\\n\\n+/g, '\\n');
  }

  /* ======================================================
     COPY TO CLIPBOARD
  ====================================================== */
  function copyText(text) {
    return navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    });
  }

  /* ======================================================
     STYLES
  ====================================================== */
  const style = document.createElement('style');
  style.id = '__sxi_style';
  style.textContent = \`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Syne:wght@700;800&display=swap');
    #__sxi_panel {
      position:fixed; top:58px; right:18px; width:420px;
      background:#09090f; border:1.5px solid #5253ff44; border-radius:14px;
      box-shadow:0 0 60px #4c4fff14, 0 16px 48px #00000099;
      z-index:999999; font-family:'JetBrains Mono',monospace;
      overflow:hidden; animation:__sxi_pop .22s cubic-bezier(.34,1.56,.64,1);
      resize:both; min-width:340px; min-height:300px;
    }
    @keyframes __sxi_pop {
      from{opacity:0;transform:scale(.88) translateY(-10px)}
      to  {opacity:1;transform:scale(1) translateY(0)}
    }
    #__sxi_hdr {
      background:linear-gradient(90deg,#0f0f24,#131330);
      padding:10px 14px; display:flex; align-items:center;
      justify-content:space-between; cursor:move;
      border-bottom:1px solid #ffffff08; user-select:none;
    }
    #__sxi_ttl {
      font-family:'Syne',sans-serif; font-weight:800; font-size:12px;
      color:#a5b4fc; letter-spacing:.06em; display:flex; align-items:center; gap:7px;
    }
    #__sxi_ttl em { color:#818cf8; font-style:normal; font-size:15px }
    #__sxi_badge {
      font-size:8px; background:#6366f118; color:#818cf8;
      border:1px solid #6366f130; border-radius:4px; padding:1px 6px; letter-spacing:.07em;
    }
    #__sxi_x {
      background:#ff4f4f18; border:none; color:#f87171; font-size:13px;
      cursor:pointer; border-radius:5px; width:22px; height:22px;
      display:grid; place-items:center; transition:background .15s;
    }
    #__sxi_x:hover { background:#ff4f4f40 }
    #__sxi_tabs { display:flex; background:#07070e; border-bottom:1px solid #ffffff08; overflow-x:auto }
    .sxi_tab {
      flex:1; padding:8px 4px; font-family:'Syne',sans-serif; font-size:9px;
      font-weight:700; letter-spacing:.06em; text-transform:uppercase; white-space:nowrap;
      background:none; border:none; border-bottom:2px solid transparent;
      color:#3a3d60; cursor:pointer; transition:color .15s; min-width:0;
    }
    .sxi_tab:hover  { color:#818cf8 }
    .sxi_tab.active { color:#a5b4fc; border-bottom:2px solid #6366f1 }
    .sxi_pane { padding:13px 14px; display:flex; flex-direction:column; gap:10px }
    .sxi_pane.hidden { display:none }
    .sxi_lbl {
      font-size:9px; color:#6366f155; text-transform:uppercase;
      letter-spacing:.15em; display:flex; align-items:center; gap:6px;
    }
    .sxi_lbl span {
      background:#6366f118; color:#6366f1aa; border:1px solid #6366f128;
      border-radius:3px; padding:1px 5px; font-size:8px; letter-spacing:.04em;
    }
    .sxi_ta {
      width:100%; height:140px; background:#050509;
      border:1px solid #4c4fff28; border-radius:8px; color:#c7d2fe;
      font-family:'JetBrains Mono',monospace; font-size:10.5px;
      padding:10px; resize:vertical; outline:none;
      transition:border-color .2s; box-sizing:border-box; line-height:1.6; tab-size:2;
    }
    .sxi_ta:focus { border-color:#6366f1; box-shadow:0 0 0 2px #6366f118 }
    .sxi_ta::placeholder { color:#2a2d48 }
    .sxi_ta[readonly] { color:#94a3b8; cursor:default }
    .sxi_st { font-size:9.5px; min-height:14px; color:#818cf8; padding:1px 0; transition:color .2s }
    .sxi_st.err  { color:#f87171 }
    .sxi_st.ok   { color:#34d399 }
    .sxi_st.warn { color:#fbbf24 }
    .sxi_row { display:flex; gap:8px }
    .sxi_row > * { flex:1 }
    .sxi_btn {
      background:linear-gradient(135deg,#6366f1,#8b5cf6);
      border:none; color:#fff; font-family:'Syne',sans-serif;
      font-weight:700; font-size:10px; letter-spacing:.05em;
      padding:8px 6px; border-radius:8px; cursor:pointer;
      transition:opacity .15s, transform .1s; text-transform:uppercase;
    }
    .sxi_btn:hover    { opacity:.85 }
    .sxi_btn:active   { transform:scale(.97) }
    .sxi_btn:disabled { opacity:.3; cursor:default }
    .sxi_btn.danger  { background:linear-gradient(135deg,#ef4444,#dc2626) }
    .sxi_btn.emerald { background:linear-gradient(135deg,#10b981,#059669) }
    .sxi_btn.amber   { background:linear-gradient(135deg,#f59e0b,#d97706) }
    .sxi_ghost {
      background:none; border:1px solid #4c4fff40; color:#818cf8;
      font-family:'JetBrains Mono',monospace; font-size:9.5px;
      padding:5px 9px; border-radius:6px; cursor:pointer;
      transition:background .15s; letter-spacing:.04em;
    }
    .sxi_ghost:hover { background:#4c4fff18 }
    .sxi_progress { height:2px; background:#6366f120; border-radius:2px; overflow:hidden }
    .sxi_progress_bar {
      height:100%; width:0%;
      background:linear-gradient(90deg,#6366f1,#a78bfa);
      border-radius:2px; transition:width .3s ease;
    }
    .sxi_mode_row { display:flex; gap:5px }
    .sxi_mode_btn {
      flex:1; padding:6px 4px; font-family:'Syne',sans-serif; font-size:8px;
      font-weight:700; letter-spacing:.05em; text-transform:uppercase;
      border-radius:6px; border:1px solid #4c4fff30; background:none;
      color:#4c4f7a; cursor:pointer; transition:all .15s;
    }
    .sxi_mode_btn.active { background:#6366f122; border-color:#6366f1; color:#a5b4fc }
    .sxi_mode_btn.active.danger  { background:#ef444422; border-color:#ef4444; color:#fca5a5 }
    .sxi_mode_btn.active.emerald { background:#10b98122; border-color:#10b981; color:#6ee7b7 }
    .sxi_mode_btn.active.amber   { background:#f59e0b22; border-color:#f59e0b; color:#fcd34d }
    .sxi_mode_btn:hover { color:#818cf8 }
    .sxi_sprite_badge { font-size:9px; color:#6366f188; font-style:italic; min-height:12px }
    @keyframes __sxi_flash {
      0%   { background:linear-gradient(135deg,#34d399,#059669) }
      100% { background:linear-gradient(135deg,#6366f1,#8b5cf6) }
    }
    .flash { animation:__sxi_flash .4s ease }
    .sxi_divider { border:none; border-top:1px solid #ffffff08; margin:2px 0 }
    .sxi_hint {
      font-size:8.5px; color:#3a3d5a; line-height:1.6;
      background:#050509; border:1px solid #4c4fff18;
      border-radius:6px; padding:7px 9px;
    }
    .sxi_hint code { color:#818cf8 }
    .sxi_sanitize_row { display:flex; align-items:center; gap:8px }
    .sxi_sanitize_badge {
      font-size:8px; color:#fbbf24; background:#fbbf2412;
      border:1px solid #fbbf2430; border-radius:4px;
      padding:2px 7px; letter-spacing:.05em; display:none;
    }
    .sxi_sanitize_badge.visible { display:inline-block }
    .sxi_section_title {
      font-size:8px; text-transform:uppercase; letter-spacing:.14em;
      color:#3a3d60; font-family:'Syne',sans-serif; font-weight:700;
      border-top:1px solid #ffffff08; padding-top:8px; margin-top:2px;
    }
    /* Script tab */
    #__sxi_p_script .sxi_script_box {
      background:#050509; border:1px solid #4c4fff28; border-radius:8px;
      padding:10px; font-size:9.5px; color:#c7d2fe; line-height:1.7;
      max-height:180px; overflow-y:auto; user-select:all;
      font-family:'JetBrains Mono',monospace; word-break:break-all;
    }
  \`;
  document.head.appendChild(style);

  /* ======================================================
     EXAMPLES
  ====================================================== */
  const EXAMPLE_PROJECT = \`<project>
  <stage color="#0a0a1a"/>
  <sprite name="Player" x="0" y="-100">
    <costume type="circle" color="#4c8fff" stroke="#88bbff" stroke-width="3" size="40"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="40" y="40">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="motion_ifonedgebounce">
                  <next>
                    <block type="control_if">
                      <value name="CONDITION">
                        <block type="sensing_keypressed">
                          <value name="KEY_OPTION">
                            <shadow type="sensing_keyoptions">
                              <field name="KEY_OPTION">right arrow</field>
                            </shadow>
                          </value>
                        </block>
                      </value>
                      <statement name="SUBSTACK">
                        <block type="motion_changexby">
                          <value name="DX">
                            <shadow type="math_number"><field name="NUM">5</field></shadow>
                          </value>
                        </block>
                      </statement>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>
  <sprite name="Enemy" x="80" y="60">
    <costume type="rectangle" color="#ff4455" width="50" height="50" radius="8"/>
    <blocks>
      <xml xmlns="https://developers.google.com/blockly/xml">
        <block type="event_whenflagclicked" x="40" y="40">
          <next>
            <block type="control_forever">
              <statement name="SUBSTACK">
                <block type="motion_turnright">
                  <value name="DEGREES">
                    <shadow type="math_number"><field name="NUM">3</field></shadow>
                  </value>
                  <next>
                    <block type="motion_movesteps">
                      <value name="STEPS">
                        <shadow type="math_number"><field name="NUM">2</field></shadow>
                      </value>
                      <next><block type="motion_ifonedgebounce"/></next>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>
    </blocks>
  </sprite>
</project>\`;

  const EXAMPLE_BLOCKS = \`<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="event_whenflagclicked" x="60" y="60">
    <next>
      <block type="control_forever">
        <statement name="SUBSTACK">
          <block type="motion_turnright">
            <value name="DEGREES">
              <shadow type="math_number"><field name="NUM">5</field></shadow>
            </value>
            <next>
              <block type="motion_movesteps">
                <value name="STEPS">
                  <shadow type="math_number"><field name="NUM">3</field></shadow>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </next>
  </block>
</xml>\`;

  /* ======================================================
     HTML PANEL
  ====================================================== */
  const panel = document.createElement('div');
  panel.id = '__sxi_panel';
  panel.innerHTML = \`
    <div id="__sxi_hdr">
      <div id="__sxi_ttl">
        <em>[#]</em> Scratch XML Injector
        <span id="__sxi_badge">v7.0</span>
      </div>
      <button id="__sxi_x" title="Close">x</button>
    </div>
    <div id="__sxi_tabs">
      <button class="sxi_tab active" data-tab="inject">~&gt; Inject</button>
      <button class="sxi_tab" data-tab="export">[cp] Export</button>
      <button class="sxi_tab" data-tab="script">&lt;/&gt; Script</button>
      <button class="sxi_tab" data-tab="ref">? Ref</button>
    </div>

    <!-- ── INJECT PANE ── -->
    <div class="sxi_pane" id="__sxi_p_inject">
      <div class="sxi_section_title">Inject mode</div>
      <div class="sxi_mode_row">
        <button class="sxi_mode_btn danger" id="__sxi_m_project">[#] New Project</button>
        <button class="sxi_mode_btn emerald" id="__sxi_m_merge">[+] Add to Project</button>
        <button class="sxi_mode_btn active amber" id="__sxi_m_replace">~ Replace Blocks</button>
        <button class="sxi_mode_btn" id="__sxi_m_append">[+] Append Blocks</button>
      </div>
      <div class="sxi_lbl" id="__sxi_inject_lbl">
        Blocks XML <span>replaces current sprite blocks</span>
      </div>
      <textarea id="__sxi_input" class="sxi_ta" spellcheck="false"
        placeholder="Paste &lt;xml&gt; or &lt;project&gt; XML here..."></textarea>
      <div class="sxi_sanitize_row">
        <button class="sxi_ghost" id="__sxi_sanitize">~ Strip Non-ASCII</button>
        <span class="sxi_sanitize_badge" id="__sxi_sanitize_badge">! non-ASCII detected</span>
      </div>
      <div class="sxi_progress"><div class="sxi_progress_bar" id="__sxi_prog"></div></div>
      <div class="sxi_st" id="__sxi_st_i">Ready.</div>
      <div class="sxi_sprite_badge" id="__sxi_sprite">-</div>
      <div class="sxi_row">
        <button class="sxi_ghost" id="__sxi_eg">! Example</button>
        <button class="sxi_btn amber" id="__sxi_run">~ Replace Blocks</button>
      </div>
    </div>

    <!-- ── EXPORT PANE ── -->
    <div class="sxi_pane hidden" id="__sxi_p_export">
      <div class="sxi_section_title">Export options</div>
      <div class="sxi_row" style="gap:6px">
        <button class="sxi_btn" id="__sxi_grab_sprite">Grab Sprite XML</button>
        <button class="sxi_btn emerald" id="__sxi_grab_project">Grab Project XML</button>
      </div>
      <div class="sxi_lbl" id="__sxi_export_lbl">Grabbed XML appears below</div>
      <textarea id="__sxi_out" class="sxi_ta" readonly
        placeholder="Click a Grab button above..."></textarea>
      <div class="sxi_st" id="__sxi_st_e">Choose what to export.</div>
      <div class="sxi_row">
        <button class="sxi_btn" id="__sxi_copy">[cp] Copy to Clipboard</button>
      </div>
    </div>

    <!-- ── SCRIPT PANE ── -->
    <div class="sxi_pane hidden" id="__sxi_p_script">
      <div class="sxi_lbl">Userscript source — select all &amp; copy</div>
      <div class="sxi_hint" style="margin-bottom:4px">
        Copy the script below into Tampermonkey to install or update.<br>
        <code>Dashboard → + → paste → Ctrl+S</code>
      </div>
      <div id="__sxi_script_box" class="sxi_script_box">Loading...</div>
      <div class="sxi_st" id="__sxi_st_s">Click copy to grab the full script.</div>
      <div class="sxi_row">
        <button class="sxi_ghost" id="__sxi_script_selall">Select All</button>
        <button class="sxi_btn" id="__sxi_script_copy">[cp] Copy Script</button>
      </div>
    </div>

    <!-- ── REFERENCE PANE ── -->
    <div class="sxi_pane hidden" id="__sxi_p_ref">
      <div class="sxi_lbl">Mode reference</div>
      <div class="sxi_hint">
        <b style="color:#fca5a5">[#] New Project</b> — wipes ALL sprites, builds fresh<br>
        <b style="color:#6ee7b7">[+] Add to Project</b> — merges sprites; matching names update in place<br>
        <b style="color:#fcd34d">~ Replace Blocks</b> — replaces active sprite blocks only<br>
        <b style="color:#a5b4fc">[+] Append Blocks</b> — adds blocks to sprite without deleting existing ones<br><br>
        <b style="color:#818cf8">Export:</b><br>
        <code>Grab Sprite XML</code> — current sprite Blockly XML<br>
        <code>Grab Project XML</code> — full project as &lt;project&gt; document<br><br>
        <b style="color:#fbbf24">Non-ASCII fix:</b> use "Strip Non-ASCII" or the auto-strip on inject<br>
        <b style="color:#818cf8">Wiki:</b> see full docs at your hosted GitHub Pages site
      </div>
      <div class="sxi_hint">
        <code>&lt;project&gt;</code> syntax:<br>
        <code>&lt;stage color="#rrggbb"/&gt;</code><br>
        <code>&lt;sprite name="X" x="0" y="0"&gt;</code><br>
        &nbsp;<code>&lt;costume type="circle" color="#ff4488" size="60"/&gt;</code><br>
        &nbsp;<code>&lt;costume type="rectangle" color="#44aaff" width="80" height="30" radius="8"/&gt;</code><br>
        &nbsp;<code>&lt;blocks&gt;&lt;xml&gt;...&lt;/xml&gt;&lt;/blocks&gt;</code><br>
        <code>&lt;/sprite&gt;</code>
      </div>
    </div>
  \`;
  document.body.appendChild(panel);

  /* ======================================================
     SCRIPT TAB — embed own source
  ====================================================== */
  // We grab the script source from the DOM (the userscript manager injects it)
  // Fallback: display a message pointing to the source file
  (function loadScriptSource() {
    const box = document.getElementById('__sxi_script_box');
    // Try to read from Tampermonkey's GM_getResourceText or just serialize self
    // Since we don't have GM_getResourceText, we'll embed a truncated self-reference note
    // and provide the canonical way to get it
    try {
      // Walk script tags looking for our own source
      const scripts = document.querySelectorAll('script');
      for (const s of scripts) {
        if (s.textContent.includes('Scratch XML Injector') && s.textContent.length > 5000) {
          box.textContent = s.textContent.trim();
          return;
        }
      }
      // If running as userscript (injected), source won't be in a <script> tag.
      // Show instructions instead.
      box.textContent = '// To copy this script:\\n// 1. Open Tampermonkey Dashboard\\n// 2. Click the script name "Scratch XML Injector"\\n// 3. Click the Edit (pencil) icon\\n// 4. Select All (Ctrl+A) and Copy (Ctrl+C)\\n//\\n// Or right-click the Tampermonkey icon\\n// → Dashboard → Edit → Copy all\\n\\n// @name    Scratch XML Injector\\n// @version 7.0';
    } catch(_) {
      box.textContent = '// Open Tampermonkey Dashboard to copy this script.';
    }
  })();

  document.getElementById('__sxi_script_selall').onclick = () => {
    const box = document.getElementById('__sxi_script_box');
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(box);
    sel.removeAllRanges();
    sel.addRange(range);
    ss('Text selected — press Ctrl+C to copy.', '');
  };

  document.getElementById('__sxi_script_copy').onclick = () => {
    const text = document.getElementById('__sxi_script_box').textContent;
    copyText(text).then(() => {
      const btn = document.getElementById('__sxi_script_copy');
      btn.textContent = '[ok] Copied!'; btn.classList.add('flash');
      ss('[OK] Script copied to clipboard!', 'ok');
      setTimeout(() => { btn.textContent = '[cp] Copy Script'; btn.classList.remove('flash'); }, 2000);
    });
  };

  function ss(m, c='') { const s=document.getElementById('__sxi_st_s'); s.textContent=m; s.className='sxi_st '+c; }

  /* ======================================================
     NON-ASCII DETECTION
  ====================================================== */
  const inputTA = document.getElementById('__sxi_input');
  const sanitizeBadge = document.getElementById('__sxi_sanitize_badge');
  function checkNonASCII(str) { return /[^\\x00-\\x7F]/.test(str); }
  inputTA.addEventListener('input', () => {
    sanitizeBadge.classList.toggle('visible', checkNonASCII(inputTA.value));
  });
  document.getElementById('__sxi_sanitize').onclick = () => {
    const before = inputTA.value;
    const after = sanitizeXML(before);
    const removed = [...before].filter(c => c.charCodeAt(0) > 127).length;
    inputTA.value = after;
    sanitizeBadge.classList.remove('visible');
    si(removed > 0 ? \`[ok] Stripped \${removed} non-ASCII character(s).\` : 'No non-ASCII found.', removed > 0 ? 'ok' : '');
  };

  /* ======================================================
     MODE TOGGLE
  ====================================================== */
  let mode = 'replace'; // 'project' | 'merge' | 'replace' | 'append'
  const lbl = document.getElementById('__sxi_inject_lbl');
  const runBtn = document.getElementById('__sxi_run');

  const MODES = {
    project: { label: '[#] New Project',   run: '[#] Build Project',  btnClass: 'danger',   lbl: '(!) Project XML <span>WIPES all sprites &amp; rebuilds</span>',      modeId: '__sxi_m_project' },
    merge:   { label: '[+] Add to Project',run: '[+] Add to Project', btnClass: 'emerald',  lbl: 'Project XML <span>merges sprites, keeps existing ones</span>',         modeId: '__sxi_m_merge'   },
    replace: { label: '~ Replace Blocks',  run: '~ Replace Blocks',   btnClass: 'amber',    lbl: 'Blocks XML <span>replaces current sprite blocks</span>',               modeId: '__sxi_m_replace' },
    append:  { label: '[+] Append Blocks', run: '[+] Append Blocks',  btnClass: '',         lbl: 'Blocks XML <span>adds to current sprite without deleting</span>',      modeId: '__sxi_m_append'  },
  };

  function setMode(m) {
    mode = m;
    const cfg = MODES[m];
    // Update all mode buttons
    Object.entries(MODES).forEach(([key, c]) => {
      const btn = document.getElementById(c.modeId);
      btn.classList.toggle('active', key === m);
      // Remove all color classes then add the right one
      btn.classList.remove('danger','emerald','amber');
      if (key === m) { btn.classList.add('active'); if(c.btnClass) btn.classList.add(c.btnClass); }
    });
    lbl.innerHTML = cfg.lbl;
    runBtn.textContent = cfg.run;
    runBtn.className = 'sxi_btn' + (cfg.btnClass ? ' ' + cfg.btnClass : '');
    si(cfg.label + ' mode selected.');
  }

  document.getElementById('__sxi_m_project').onclick = () => setMode('project');
  document.getElementById('__sxi_m_merge').onclick   = () => setMode('merge');
  document.getElementById('__sxi_m_replace').onclick = () => setMode('replace');
  document.getElementById('__sxi_m_append').onclick  = () => setMode('append');
  setMode('replace'); // default

  /* ======================================================
     DRAG
  ====================================================== */
  let ox = 0, oy = 0, dragging = false;
  document.getElementById('__sxi_hdr').addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - panel.getBoundingClientRect().left;
    oy = e.clientY - panel.getBoundingClientRect().top;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    panel.style.right = 'auto';
    panel.style.left = (e.clientX - ox) + 'px';
    panel.style.top  = (e.clientY - oy) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  /* ======================================================
     TABS
  ====================================================== */
  document.querySelectorAll('.sxi_tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sxi_tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.tab;
      ['inject','export','script','ref'].forEach(id => {
        document.getElementById('__sxi_p_' + id).classList.toggle('hidden', id !== t);
      });
    });
  });

  /* ======================================================
     STATUS HELPERS
  ====================================================== */
  const si = (m, c='') => { const s=document.getElementById('__sxi_st_i'); s.textContent=m; s.className='sxi_st '+c; };
  const se = (m, c='') => { const s=document.getElementById('__sxi_st_e'); s.textContent=m; s.className='sxi_st '+c; };
  const prog = p => { document.getElementById('__sxi_prog').style.width = p + '%'; };

  /* ======================================================
     CLOSE
  ====================================================== */
  document.getElementById('__sxi_x').onclick = () => {
    panel.remove();
    document.getElementById('__sxi_style')?.remove();
  };

  /* ======================================================
     EXAMPLE BUTTON
  ====================================================== */
  document.getElementById('__sxi_eg').onclick = () => {
    const useProject = mode === 'project' || mode === 'merge';
    inputTA.value = useProject ? EXAMPLE_PROJECT : EXAMPLE_BLOCKS;
    sanitizeBadge.classList.toggle('visible', checkNonASCII(inputTA.value));
    si(useProject ? 'Project example loaded.' : 'Blocks example loaded.', 'warn');
  };

  /* ======================================================
     INJECT BUTTON
  ====================================================== */
  document.getElementById('__sxi_run').onclick = async function () {
    let raw = inputTA.value.trim();
    if (!raw) { si('(!) No XML entered.', 'err'); return; }

    // Auto-sanitize
    if (checkNonASCII(raw)) {
      raw = sanitizeXML(raw);
      inputTA.value = raw;
      sanitizeBadge.classList.remove('visible');
      si('Non-ASCII stripped. Proceeding...');
      await new Promise(r => setTimeout(r, 200));
    }

    this.disabled = true;
    prog(20); si('Validating XML...');

    const testDoc = new DOMParser().parseFromString(raw, 'text/xml');
    if (testDoc.querySelector('parseerror, parsererror')) {
      si('x Invalid XML - check syntax.', 'err'); prog(0); this.disabled = false; return;
    }

    prog(40); si('Finding VM...');
    const vm = findVM();
    if (!vm) {
      si('x VM not found - reload editor tab.', 'err'); prog(0); this.disabled = false; return;
    }
    document.getElementById('__sxi_sprite').textContent = '> ' + (vm.editingTarget?.getName?.() || 'unknown');

    try {
      if (mode === 'project') {
        prog(55); si('Parsing project XML...');
        const parsed = await parseProjectXML(raw);
        if (!parsed) { si('x Not a <project> XML.', 'err'); prog(0); this.disabled = false; return; }
        prog(70); si('Wiping & building project...');
        await buildAndLoadProject(parsed, vm);
        prog(100);
        si(\`[OK] Built! \${parsed.sprites.length} sprite(s) created.\`, 'ok');

      } else if (mode === 'merge') {
        prog(55); si('Parsing project XML...');
        const parsed = await parseProjectXML(raw);
        if (!parsed) { si('x Not a <project> XML.', 'err'); prog(0); this.disabled = false; return; }
        prog(70); si('Merging sprites...');
        await mergeProjectXML(parsed, vm);
        prog(100);
        si(\`[OK] Merged! \${parsed.sprites.length} sprite(s) added/updated.\`, 'ok');

      } else if (mode === 'replace') {
        prog(60); si('Replacing sprite blocks...');
        const method = await injectBlocksXML(raw, vm);
        prog(100);
        si('[OK] Blocks replaced (' + method + ')!', 'ok');

      } else if (mode === 'append') {
        prog(60); si('Appending blocks to sprite...');
        const method = await appendBlocksXML(raw, vm);
        prog(100);
        si('[OK] Blocks appended (' + method + ')!', 'ok');
      }
    } catch (e) {
      si('x ' + e.message.slice(0, 140), 'err');
      console.error('[SXI v7.0] Error:', e);
      prog(0);
    }

    setTimeout(() => prog(0), 1500);
    this.disabled = false;
  };

  /* ======================================================
     EXPORT — GRAB SPRITE XML
  ====================================================== */
  document.getElementById('__sxi_grab_sprite').onclick = () => {
    se('Reading sprite workspace...');
    const vm = findVM();
    if (!vm) { se('x VM not found.', 'err'); return; }
    try {
      const raw = exportSpriteXML(vm);
      document.getElementById('__sxi_out').value = prettyXML(raw);
      document.getElementById('__sxi_export_lbl').innerHTML = 'Sprite XML <span>current sprite blocks</span>';
      se('[ok] Sprite XML grabbed!', 'ok');
    } catch (e) { se('x ' + e.message, 'err'); }
  };

  /* ======================================================
     EXPORT — GRAB PROJECT XML
  ====================================================== */
  document.getElementById('__sxi_grab_project').onclick = () => {
    se('Exporting full project...');
    const vm = findVM();
    if (!vm) { se('x VM not found.', 'err'); return; }
    try {
      const raw = exportProjectXML(vm);
      document.getElementById('__sxi_out').value = prettyXML(raw);
      document.getElementById('__sxi_export_lbl').innerHTML = 'Project XML <span>full project, all sprites</span>';
      se('[ok] Project XML grabbed!', 'ok');
    } catch (e) { se('x ' + e.message, 'err'); }
  };

  /* ======================================================
     EXPORT — COPY
  ====================================================== */
  document.getElementById('__sxi_copy').onclick = function () {
    const txt = document.getElementById('__sxi_out').value.trim();
    if (!txt) { se('(!) Grab XML first.', 'err'); return; }
    copyText(txt).then(() => {
      this.textContent = '[ok] Copied!'; this.classList.add('flash');
      se('[OK] Copied to clipboard!', 'ok');
      setTimeout(() => { this.textContent = '[cp] Copy to Clipboard'; this.classList.remove('flash'); }, 1800);
    });
  };

  /* ======================================================
     INIT
  ====================================================== */
  const vm0 = findVM();
  if (vm0) {
    document.getElementById('__sxi_sprite').textContent = '> ' + (vm0.editingTarget?.getName?.() || 'unknown');
  }

  console.log('%c[SXI v7.0] Ready. Modes: New Project | Merge | Replace Blocks | Append Blocks. Export: Sprite XML + Project XML.', 'color:#818cf8;font-weight:bold;font-size:13px');
})();
`;

  (function loadScriptSource() {
    const box = document.getElementById('__sxi_script_box');
    box.textContent = __SXI_SOURCE__;
  })();

  function ss(m, c='') { const s=document.getElementById('__sxi_st_s'); s.textContent=m; s.className='sxi_st '+c; }

  /* ======================================================
     NON-ASCII DETECTION
  ====================================================== */
  const inputTA = document.getElementById('__sxi_input');
  const sanitizeBadge = document.getElementById('__sxi_sanitize_badge');
  function checkNonASCII(str) { return /[^\x00-\x7F]/.test(str); }
  inputTA.addEventListener('input', () => {
    sanitizeBadge.classList.toggle('visible', checkNonASCII(inputTA.value));
  });
  document.getElementById('__sxi_sanitize').onclick = () => {
    const before = inputTA.value;
    const after = sanitizeXML(before);
    const removed = [...before].filter(c => c.charCodeAt(0) > 127).length;
    inputTA.value = after;
    sanitizeBadge.classList.remove('visible');
    si(removed > 0 ? `[ok] Stripped ${removed} non-ASCII character(s).` : 'No non-ASCII found.', removed > 0 ? 'ok' : '');
  };

  /* ======================================================
     MODE TOGGLE
  ====================================================== */
  let mode = 'replace'; // 'project' | 'merge' | 'replace' | 'append'
  const lbl = document.getElementById('__sxi_inject_lbl');
  const runBtn = document.getElementById('__sxi_run');

  const MODES = {
    project: { label: '[#] New Project',   run: '[#] Build Project',  btnClass: 'danger',   lbl: '(!) Project XML <span>WIPES all sprites &amp; rebuilds</span>',      modeId: '__sxi_m_project' },
    merge:   { label: '[+] Add to Project',run: '[+] Add to Project', btnClass: 'emerald',  lbl: 'Project XML <span>merges sprites, keeps existing ones</span>',         modeId: '__sxi_m_merge'   },
    replace: { label: '~ Replace Blocks',  run: '~ Replace Blocks',   btnClass: 'amber',    lbl: 'Blocks XML <span>replaces current sprite blocks</span>',               modeId: '__sxi_m_replace' },
    append:  { label: '[+] Append Blocks', run: '[+] Append Blocks',  btnClass: '',         lbl: 'Blocks XML <span>adds to current sprite without deleting</span>',      modeId: '__sxi_m_append'  },
  };

  function setMode(m) {
    mode = m;
    const cfg = MODES[m];
    // Update all mode buttons
    Object.entries(MODES).forEach(([key, c]) => {
      const btn = document.getElementById(c.modeId);
      btn.classList.toggle('active', key === m);
      // Remove all color classes then add the right one
      btn.classList.remove('danger','emerald','amber');
      if (key === m) { btn.classList.add('active'); if(c.btnClass) btn.classList.add(c.btnClass); }
    });
    lbl.innerHTML = cfg.lbl;
    runBtn.textContent = cfg.run;
    runBtn.className = 'sxi_btn' + (cfg.btnClass ? ' ' + cfg.btnClass : '');
    si(cfg.label + ' mode selected.');
  }

  document.getElementById('__sxi_m_project').onclick = () => setMode('project');
  document.getElementById('__sxi_m_merge').onclick   = () => setMode('merge');
  document.getElementById('__sxi_m_replace').onclick = () => setMode('replace');
  document.getElementById('__sxi_m_append').onclick  = () => setMode('append');
  setMode('replace'); // default

  /* ======================================================
     DRAG
  ====================================================== */
  let ox = 0, oy = 0, dragging = false;
  document.getElementById('__sxi_hdr').addEventListener('mousedown', e => {
    dragging = true;
    ox = e.clientX - panel.getBoundingClientRect().left;
    oy = e.clientY - panel.getBoundingClientRect().top;
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    panel.style.right = 'auto';
    panel.style.left = (e.clientX - ox) + 'px';
    panel.style.top  = (e.clientY - oy) + 'px';
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  /* ======================================================
     TABS
  ====================================================== */
  document.querySelectorAll('.sxi_tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sxi_tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const t = btn.dataset.tab;
      ['inject','export','script','ref'].forEach(id => {
        document.getElementById('__sxi_p_' + id).classList.toggle('hidden', id !== t);
      });
    });
  });

  /* ======================================================
     STATUS HELPERS
  ====================================================== */
  const si = (m, c='') => { const s=document.getElementById('__sxi_st_i'); s.textContent=m; s.className='sxi_st '+c; };
  const se = (m, c='') => { const s=document.getElementById('__sxi_st_e'); s.textContent=m; s.className='sxi_st '+c; };
  const prog = p => { document.getElementById('__sxi_prog').style.width = p + '%'; };

  /* ======================================================
     CLOSE
  ====================================================== */
  document.getElementById('__sxi_x').onclick = () => {
    panel.remove();
    document.getElementById('__sxi_style')?.remove();
  };

  /* ======================================================
     EXAMPLE BUTTON
  ====================================================== */
  document.getElementById('__sxi_eg').onclick = () => {
    const useProject = mode === 'project' || mode === 'merge';
    inputTA.value = useProject ? EXAMPLE_PROJECT : EXAMPLE_BLOCKS;
    sanitizeBadge.classList.toggle('visible', checkNonASCII(inputTA.value));
    si(useProject ? 'Project example loaded.' : 'Blocks example loaded.', 'warn');
  };

  /* ======================================================
     INJECT BUTTON
  ====================================================== */
  document.getElementById('__sxi_run').onclick = async function () {
    let raw = inputTA.value.trim();
    if (!raw) { si('(!) No XML entered.', 'err'); return; }

    // Auto-sanitize
    if (checkNonASCII(raw)) {
      raw = sanitizeXML(raw);
      inputTA.value = raw;
      sanitizeBadge.classList.remove('visible');
      si('Non-ASCII stripped. Proceeding...');
      await new Promise(r => setTimeout(r, 200));
    }

    this.disabled = true;
    prog(20); si('Validating XML...');

    const testDoc = new DOMParser().parseFromString(raw, 'text/xml');
    if (testDoc.querySelector('parseerror, parsererror')) {
      si('x Invalid XML - check syntax.', 'err'); prog(0); this.disabled = false; return;
    }

    prog(40); si('Finding VM...');
    const vm = findVM();
    if (!vm) {
      si('x VM not found - reload editor tab.', 'err'); prog(0); this.disabled = false; return;
    }
    document.getElementById('__sxi_sprite').textContent = '> ' + (vm.editingTarget?.getName?.() || 'unknown');

    try {
      if (mode === 'project') {
        prog(55); si('Parsing project XML...');
        const parsed = await parseProjectXML(raw);
        if (!parsed) { si('x Not a <project> XML.', 'err'); prog(0); this.disabled = false; return; }
        prog(70); si('Wiping & building project...');
        await buildAndLoadProject(parsed, vm);
        prog(100);
        si(`[OK] Built! ${parsed.sprites.length} sprite(s) created.`, 'ok');

      } else if (mode === 'merge') {
        prog(55); si('Parsing project XML...');
        const parsed = await parseProjectXML(raw);
        if (!parsed) { si('x Not a <project> XML.', 'err'); prog(0); this.disabled = false; return; }
        prog(70); si('Merging sprites...');
        await mergeProjectXML(parsed, vm);
        prog(100);
        si(`[OK] Merged! ${parsed.sprites.length} sprite(s) added/updated.`, 'ok');

      } else if (mode === 'replace') {
        prog(60); si('Replacing sprite blocks...');
        const method = await injectBlocksXML(raw, vm);
        prog(100);
        si('[OK] Blocks replaced (' + method + ')!', 'ok');

      } else if (mode === 'append') {
        prog(60); si('Appending blocks to sprite...');
        const method = await appendBlocksXML(raw, vm);
        prog(100);
        si('[OK] Blocks appended (' + method + ')!', 'ok');
      }
    } catch (e) {
      si('x ' + e.message.slice(0, 140), 'err');
      console.error('[SXI v7.0] Error:', e);
      prog(0);
    }

    setTimeout(() => prog(0), 1500);
    this.disabled = false;
  };

  /* ======================================================
     EXPORT — GRAB SPRITE XML
  ====================================================== */
  document.getElementById('__sxi_grab_sprite').onclick = () => {
    se('Reading sprite workspace...');
    const vm = findVM();
    if (!vm) { se('x VM not found.', 'err'); return; }
    try {
      const raw = exportSpriteXML(vm);
      document.getElementById('__sxi_out').value = prettyXML(raw);
      document.getElementById('__sxi_export_lbl').innerHTML = 'Sprite XML <span>current sprite blocks</span>';
      se('[ok] Sprite XML grabbed!', 'ok');
    } catch (e) { se('x ' + e.message, 'err'); }
  };

  /* ======================================================
     EXPORT — GRAB PROJECT XML
  ====================================================== */
  document.getElementById('__sxi_grab_project').onclick = () => {
    se('Exporting full project...');
    const vm = findVM();
    if (!vm) { se('x VM not found.', 'err'); return; }
    try {
      const raw = exportProjectXML(vm);
      document.getElementById('__sxi_out').value = prettyXML(raw);
      document.getElementById('__sxi_export_lbl').innerHTML = 'Project XML <span>full project, all sprites</span>';
      se('[ok] Project XML grabbed!', 'ok');
    } catch (e) { se('x ' + e.message, 'err'); }
  };

  /* ======================================================
     EXPORT — COPY
  ====================================================== */
  document.getElementById('__sxi_copy').onclick = function () {
    const txt = document.getElementById('__sxi_out').value.trim();
    if (!txt) { se('(!) Grab XML first.', 'err'); return; }
    copyText(txt).then(() => {
      this.textContent = '[ok] Copied!'; this.classList.add('flash');
      se('[OK] Copied to clipboard!', 'ok');
      setTimeout(() => { this.textContent = '[cp] Copy to Clipboard'; this.classList.remove('flash'); }, 1800);
    });
  };

  /* ======================================================
     INIT
  ====================================================== */
  const vm0 = findVM();
  if (vm0) {
    document.getElementById('__sxi_sprite').textContent = '> ' + (vm0.editingTarget?.getName?.() || 'unknown');
  }

  console.log('%c[SXI v7.0] Ready. Modes: New Project | Merge | Replace Blocks | Append Blocks. Export: Sprite XML + Project XML.', 'color:#818cf8;font-weight:bold;font-size:13px');
})();
