// Creates AVIF versions and 800px variants of every WebP in public/assets. Originals are never modified.
//   npm i --no-save sharp && node scripts/optimize-images.mjs
import {readdir,access,stat} from 'node:fs/promises';
import path from 'node:path';
let sharp;
try{sharp=(await import('sharp')).default}catch{console.error('Install sharp first: npm i --no-save sharp');process.exit(1)}
const dir='public/assets';
const exists=f=>access(f).then(()=>true,()=>false);
let made=0;
for(const file of (await readdir(dir)).filter(f=>f.endsWith('.webp')&&!f.endsWith('-small.webp')&&!f.includes('poster'))){
  const base=file.replace(/\.webp$/,''),src=path.join(dir,file);
  const {width}=await sharp(src).metadata();
  const smallWebp=path.join(dir,base+'-small.webp');
  if(width>900&&!await exists(smallWebp)){await sharp(src).resize({width:800}).webp({quality:78}).toFile(smallWebp);made++;console.log('made',smallWebp)}
  for(const [from,out] of [[src,path.join(dir,base+'.avif')],[await exists(smallWebp)?smallWebp:null,path.join(dir,base+'-small.avif')]]){
    if(!from)continue;
    if(await exists(out)&&(await stat(out)).mtimeMs>(await stat(from)).mtimeMs)continue;
    await sharp(from).avif({quality:55,effort:6}).toFile(out);made++;
    const [a,b]=[(await stat(from)).size,(await stat(out)).size];
    console.log(`${path.basename(out)}: ${Math.round(a/1024)}KB webp -> ${Math.round(b/1024)}KB avif`);
  }
}
console.log('Done,',made,'files written.');
