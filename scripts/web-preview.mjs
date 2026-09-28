// Bundles the web export (`npx expo export -p web`) into one self-contained
// HTML file for quick phone testing: JS and assets are inlined as data URIs.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';

const dist = 'dist';
const out = join(dist, 'gymmy-preview.html');
const jsDir = join(dist, '_expo/static/js/web');
const entry = readdirSync(jsDir).find((f) => f.startsWith('entry-') && f.endsWith('.js'));
let js = readFileSync(join(jsDir, entry), 'utf8');

const MIME = { '.png': 'image/png', '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff2': 'font/woff2' };
js = js.replace(/"(\/assets\/[^"]+)"/g, (match, path) => {
  const mime = MIME[extname(path)];
  if (!mime) return match;
  return `"data:${mime};base64,${readFileSync(join(dist, path)).toString('base64')}"`;
});

// Keep the inline <script> from being closed or escaped early by bundle contents.
js = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');

const html = `<title>Gymmy</title>
<style>
  html, body { height: 100%; }
  body { overflow: hidden; background: #09090B; color: #FAFAFA; }
  #root { display: flex; height: 100%; flex: 1; }
</style>
<div id="root"></div>
<script>
  // Expo Router matches routes on the path; start every session at the app root.
  try { if (location.pathname !== '/') history.replaceState(null, '', '/'); } catch (e) {}
</script>
<script>${js}</script>
`;

writeFileSync(out, html);
console.log(`Wrote ${out} (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
