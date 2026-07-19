'use strict';
const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const failures=[];
function assert(ok,msg){if(!ok)failures.push(msg);}
function scriptRefs(html){return [...html.matchAll(/<script\s+[^>]*src=["']([^"']+)["']/g)].map(m=>m[1].replace(/^\.\//,''));}
const indexRefs=scriptRefs(read('index.html'));
const errorRefs=scriptRefs(read('404.html'));
indexRefs.forEach(p=>assert(exists(p),`index.html references missing file: ${p}`));
errorRefs.forEach(p=>assert(exists(p),`404.html references missing file: ${p}`));
assert(JSON.stringify(indexRefs)===JSON.stringify(errorRefs),'index.html and 404.html load different JavaScript bundles');
const sw=read('service-worker.js');
const cached=[...sw.matchAll(/["']\.\/([^"']+)["']/g)].map(m=>m[1]).filter(Boolean);
cached.forEach(p=>assert(exists(p),`service-worker.js caches missing file: ${p}`));
const active=new Set([...indexRefs,...errorRefs]);
const cacheSet=new Set(cached);
active.forEach(p=>assert(cacheSet.has(p),`Active browser script is not precached: ${p}`));
const moduleDir=path.join(root,'src/modules');
const moduleFiles=fs.readdirSync(moduleDir).filter(x=>x.endsWith('.js')).map(x=>`src/modules/${x}`);
moduleFiles.forEach(p=>assert(active.has(p),`Unreferenced production module: ${p}`));
if(failures.length){console.error('Repository integrity failed:\n- '+failures.join('\n- '));process.exit(1);}console.log(`Repository integrity passed: ${indexRefs.length} scripts, ${cached.length} cached assets, ${moduleFiles.length} active modules.`);
