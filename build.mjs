// CT68.A6.Doll: build dolls_midi.html, one file that works offline straight from the disk.
// It packs lib/ (three.js r180, OrbitControls), src/doll_rig.js, src/ass_export.js, src/mp4_record.js and every doll's
// doll.json and textures (as data URLs) into src/viewer.html.
//
//   node build.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOLL_ORDER, VERSION } from './src/doll_rig.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = p => fs.readFileSync(path.join(here, p), 'utf8');
const mime = { '.jpg': 'image/jpeg', '.png': 'image/png' };
const dolls = DOLL_ORDER.map(n => {
  const dir = path.join(here, 'dolls', n);
  const doll = JSON.parse(fs.readFileSync(path.join(dir, 'doll.json'), 'utf8'));
  const data = {};
  for (const [k, f] of Object.entries(doll.textures)) {
    data[k] = `data:${mime[path.extname(f)]};base64,` + fs.readFileSync(path.join(dir, f)).toString('base64');
  }
  return { doll, data };
});
const parts = {
  __THREE_CORE__: read('lib/three.core.js'),
  __THREE_MODULE__: read('lib/three.module.js'),
  __ORBIT__: read('lib/OrbitControls.js'),
  __RIG__: read('src/doll_rig.js'),
  __ASS__: read('src/ass_export.js'),
  __REC__: read('src/mp4_record.js'),
  __DOLLS__: JSON.stringify(dolls),
  __VERSION__: VERSION,   // A6: the page title (the label is set from VERSION when the page runs)
};
let html = read('src/viewer.html');
for (const [k, v] of Object.entries(parts)) {
  if (v.includes('</script')) throw new Error(`${k} contains </script and cannot be embedded`);
  html = html.split(k).join(v);
}
const out = path.join(here, 'dolls_midi.html');
fs.writeFileSync(out, html);
console.log(`${out} (${(html.length / 1e6).toFixed(1)} MB)`);
