import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {MarchingCubes} from './vendor/MarchingCubes.js';
const variants=[['Production','a23190a470543c751ad84176066316c93a38fd10'],['Design','798254cfa0dea63d8c1992c4798cf2ea5cfbab0f'],['Writing','374d3dc1882bb2d7023aa5d3ba855cfc17155ffa'],['Coding','445b95a23f2f378c5cd193ed9ad0cf6a08b77048']];
const stage=document.querySelector('#stage'),holder=document.querySelector('#canvas-holder'),flatImage=document.querySelector('#flat-image'),status=document.querySelector('#status');
let renderer,controls,mesh,active=0,flat=false,request=0,visible=true;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,50);camera.position.set(1.5,.2,8.6);
scene.add(new THREE.HemisphereLight(0xffffff,0x80786a,2.1));
const key=new THREE.DirectionalLight(0xfff8eb,3.2);key.position.set(-3,5,6);scene.add(key);
const fill=new THREE.DirectionalLight(0xe8efff,1.3);fill.position.set(4,-1,3);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,2.5);rim.position.set(-2,3,-4);scene.add(rim);
const source=i=>`../_assets/v11/${variants[i][1]}.png`;
function render(){if(renderer&&!flat&&visible)renderer.render(scene,camera);}
// The drawing remains the texture. A filled silhouette is used only to construct the relief geometry.
function silhouette(img,n=320){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=n;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,n,n);const pixels=ctx.getImageData(0,0,n,n).data;
 let ink=new Uint8Array(n*n),minY=n,maxY=0;
 for(let y=8;y<n-8;y++)for(let x=8;x<n-8;x++){const i=y*n+x,k=i*4;if((pixels[k]+pixels[k+1]+pixels[k+2])/3<160){ink[i]=1;minY=Math.min(minY,y);maxY=Math.max(maxY,y);}}
 // Close the open foreleg at the bottom of a drawing, leaving the toe gaps intact.
 for(let y=Math.floor(minY+(maxY-minY)*.66);y<=maxY;y++){let l=n,r=-1;for(let x=0;x<n;x++)if(ink[y*n+x]){l=Math.min(l,x);r=Math.max(r,x);}if(r>l)for(let x=l;x<=r;x++)ink[y*n+x]=1;}
 const dilated=new Uint8Array(n*n);
 for(let y=2;y<n-2;y++)for(let x=2;x<n-2;x++){let value=0;for(let dy=-2;dy<=2&&!value;dy++)for(let dx=-2;dx<=2;dx++)if(dx*dx+dy*dy<=5&&ink[(y+dy)*n+x+dx]){value=1;break;}dilated[y*n+x]=value;}
 const outside=new Uint8Array(n*n),queue=new Int32Array(n*n);let head=0,tail=1;queue[0]=0;outside[0]=1;
 while(head<tail){const p=queue[head++],x=p%n,y=Math.floor(p/n);for(const q of [x>0?p-1:-1,x<n-1?p+1:-1,y>0?p-n:-1,y<n-1?p+n:-1])if(q>=0&&!outside[q]&&!dilated[q]){outside[q]=1;queue[tail++]=q;}}
 const mask=new Uint8Array(n*n);for(let i=0;i<mask.length;i++)mask[i]=outside[i]?0:1;
 // Chamfer distance to each side of the contour provides a smooth rounded cross-section.
 function distance(target){const d=new Float32Array(n*n);for(let i=0;i<d.length;i++)d[i]=mask[i]===target?0:10000;
  const rt=Math.SQRT2;for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){const i=y*n+x;d[i]=Math.min(d[i],d[i-1]+1,d[i-n]+1,d[i-n-1]+rt,d[i-n+1]+rt);}
  for(let y=n-2;y>0;y--)for(let x=n-2;x>0;x--){const i=y*n+x;d[i]=Math.min(d[i],d[i+1]+1,d[i+n]+1,d[i+n+1]+rt,d[i+n-1]+rt);}return d;}
 const inside=distance(0),outsideD=distance(1),sdf=new Float32Array(n*n);for(let i=0;i<sdf.length;i++)sdf[i]=(inside[i]-outsideD[i]-1.5)/n*2;
 return{n,sdf};
}
function build(img){
 const {n,sdf}=silhouette(img),res=144,body=new MarchingCubes(res,new THREE.MeshStandardMaterial(),false,false,120000);body.isolation=0;
 const samples=new Float32Array(res*res);
 for(let y=0;y<res;y++)for(let x=0;x<res;x++){const u=x/(res-1),v=1-y/(res-1),px=Math.max(0,Math.min(n-2,u*(n-1))),py=Math.max(0,Math.min(n-2,v*(n-1))),ix=Math.floor(px),iy=Math.floor(py),fx=px-ix,fy=py-iy;const a=sdf[iy*n+ix]*(1-fx)+sdf[iy*n+ix+1]*fx,b=sdf[(iy+1)*n+ix]*(1-fx)+sdf[(iy+1)*n+ix+1]*fx;samples[y*res+x]=a*(1-fy)+b*fy;}
 for(let z=0;z<res;z++){const Z=(z/(res/2)-1);for(let y=0;y<res;y++)for(let x=0;x<res;x++){const d=samples[y*res+x],thickness=.135*Math.sqrt(1-Math.exp(-Math.max(0,d)*12));body.field[x+y*res+z*res*res]=Math.min(d,thickness-Math.abs(Z));}}
 body.update();const geometry=body.geometry.clone();body.geometry.dispose();body.material.dispose();const count=geometry.drawRange.count,positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal');
 const p=new Float32Array(count*3),normal=new Float32Array(count*3),uv=new Float32Array(count*2);
 for(let i=0;i<count;i++){p[i*3]=positions.getX(i)*2.7;p[i*3+1]=positions.getY(i)*2.7;p[i*3+2]=positions.getZ(i)*2.7;normal.set([normals.getX(i),normals.getY(i),normals.getZ(i)],i*3);uv[i*2]=(positions.getX(i)+1)/2;uv[i*2+1]=(positions.getY(i)+1)/2;}
 geometry.dispose();const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('normal',new THREE.BufferAttribute(normal,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.computeBoundingBox();const center=g.boundingBox.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);
 const texture=new THREE.Texture(img);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());texture.needsUpdate=true;
 const material=new THREE.MeshStandardMaterial({map:texture,color:0xffffff,roughness:.8,metalness:0});
 material.onBeforeCompile=shader=>{shader.vertexShader='varying float vReliefFacing;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvReliefFacing=objectNormal.z;');shader.fragmentShader='varying float vReliefFacing;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#ifdef USE_MAP
vec4 ink=texture2D(map,vMapUv);
float face=smoothstep(0.08,0.72,vReliefFacing);
diffuseColor*=mix(vec4(0.055,0.052,0.045,1.0),ink,face);
#endif`);};
 return new THREE.Mesh(g,material);
}
async function choose(i){const ticket=++request;active=i;document.querySelector('#name').textContent=variants[i][0];document.querySelector('#number').textContent=`0${i+1} / 04`;flatImage.src=source(i);flatImage.alt=`${variants[i][0]} ink cat front paw with four forward toes and a smaller side dewclaw`;document.querySelectorAll('[data-paw]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.paw===i)));status.textContent='Preparing the relief…';
 try{const img=new Image();img.src=source(i);await img.decode();await new Promise(resolve=>requestAnimationFrame(resolve));if(ticket!==request)return;const next=build(img);if(mesh){scene.remove(mesh);mesh.geometry.dispose();mesh.material.map.dispose();mesh.material.dispose();}mesh=next;scene.add(mesh);reset(false);status.textContent='Five toes: four forward, one smaller inner toe.';}catch(e){flat=true;holder.hidden=true;flatImage.hidden=false;status.textContent='The original drawing is shown. The 3D preview could not load.';console.error(e);}}
function reset(front=true){camera.position.set(front?0:1.5,front?0:.2,8.6);controls.target.set(0,0,0);controls.update();render();}
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;holder.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Rotatable relief of the original paw drawing. Drag or use arrow keys. Home resets.');controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=false;controls.rotateSpeed=.7;controls.addEventListener('change',render);new ResizeObserver(()=>{const w=holder.clientWidth,h=holder.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);render();}).observe(holder);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;render();}).observe(stage);renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Home'){reset();e.preventDefault();return;}const d={ArrowLeft:-.12,ArrowRight:.12,ArrowUp:-.12,ArrowDown:.12}[e.key];if(d===undefined)return;e.preventDefault();const s=new THREE.Spherical().setFromVector3(camera.position);if(e.key==='ArrowLeft'||e.key==='ArrowRight')s.theta+=d;else s.phi=Math.max(.08,Math.min(Math.PI-.08,s.phi+d));camera.position.setFromSpherical(s);controls.update();render();});choose(0);}catch(e){holder.hidden=true;flatImage.hidden=false;status.textContent='Your browser cannot display 3D. The original drawing is shown.';document.querySelector('#flat').disabled=true;document.querySelector('#front').disabled=true;console.error(e);}
document.querySelectorAll('[data-paw]').forEach(b=>b.addEventListener('click',()=>{if(renderer)choose(+b.dataset.paw);else{flatImage.src=source(+b.dataset.paw);document.querySelector('#name').textContent=variants[+b.dataset.paw][0];}}));document.querySelector('#front').addEventListener('click',()=>{if(flat)document.querySelector('#flat').click();reset();});document.querySelector('#flat').addEventListener('click',()=>{flat=!flat;holder.hidden=flat;flatImage.hidden=!flat;document.querySelector('#flat').setAttribute('aria-pressed',String(flat));document.querySelector('#hint').textContent=flat?'THE ORIGINAL DRAWING':'DRAG TO ROTATE · ARROW KEYS TO TURN';render();});
