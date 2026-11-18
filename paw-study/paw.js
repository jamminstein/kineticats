import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { MarchingCubes } from './vendor/MarchingCubes.js';

const holder = document.querySelector('#canvas-holder');
const stage = document.querySelector('#stage');
const status = document.querySelector('#status');
const original = document.querySelector('#original');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const variants = [
  {name:'Production',image:'ddae170e13c1ddda4e61c20e40fcf39964cfbc0e',spread:1,turn:-.27},
  {name:'Design',image:'aeb9f1786124b7db27231f6d68b5cc27ea2778aa',spread:1.1,turn:.22},
  {name:'Writing',image:'7c5cececfea06501fee2dc672a66e886b28b8843',spread:.91,turn:-.14},
  {name:'Coding',image:'724ee73fa11a96e6f54a3ea62ffd9829538e256a',spread:1.03,turn:.32},
];
let renderer, controls, paw, body, fur, claws=[], pads=[], active=0, finish='graphite', is3d=true, spinning=false, visible=true;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34,1,.1,80);
camera.position.set(0,.05,8.5);
scene.add(new THREE.HemisphereLight(0xffffff,0xb5afa4,2.8));
const key=new THREE.DirectionalLight(0xffffff,4.7);key.position.set(-3,5,4);scene.add(key);
const fill=new THREE.DirectionalLight(0xffffff,1.5);fill.position.set(4,0,2);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffffff,4);rim.position.set(1,3,-4);scene.add(rim);

// Smooth unions of ellipsoids make one continuous, editable sculptural surface.
function ellipsoid(x,y,z,c,r){
  x-=c[0];y-=c[1];z-=c[2];
  const a=Math.hypot(x/r[0],y/r[1],z/r[2]);
  const b=Math.hypot(x/(r[0]*r[0]),y/(r[1]*r[1]),z/(r[2]*r[2]));
  return b<.00001?-Math.min(...r):a*(a-1)/b;
}
function union(a,b,k=.18){const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;}
function clawGeometry(x,y,z,side){
  const curve=new THREE.CubicBezierCurve3(new THREE.Vector3(x,y,z),new THREE.Vector3(x+side*.04,y+.18,z+.02),new THREE.Vector3(x+side*.08,y+.38,z+.12),new THREE.Vector3(x+side*.05,y+.48,z+.36));
  const frames=curve.computeFrenetFrames(20,false),vertices=[],normals=[],indices=[];
  for(let i=0;i<=20;i++){
    const t=i/20,p=curve.getPoint(t),r=.12*Math.pow(1-t,.78)+.001;
    for(let j=0;j<=12;j++){const a=j/12*Math.PI*2;const n=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));const v=p.clone().addScaledVector(n,r);vertices.push(v.x,v.y,v.z);normals.push(n.x,n.y,n.z);if(i<20&&j<12){const k=i*13+j;indices.push(k,k+13,k+1,k+1,k+13,k+14);}}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setIndex(indices);return g;
}
function makePaw(){
  if(paw){scene.remove(paw);paw.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});}
  claws=[];pads=[];paw=new THREE.Group();const v=variants[active],s=v.spread;
  const shapes=[[[0,-.8,0],[.51,1.13,.33]],[[0,.15,0],[.84,.92,.40]],
    [[-.79*s,.73,.01],[.30,.49,.33]],[[-.29*s,1.05,0],[.31,.56,.36]],[[.31*s,1.03,0],[.31,.55,.36]],[[.80*s,.68,.01],[.29,.47,.32]]];
  const res=58,extent=2.65;
  body=new MarchingCubes(res,new THREE.MeshStandardMaterial({color:0x333331,roughness:.67,metalness:.14}),false,false,45000);
  body.isolation=0;body.scale.setScalar(extent);
  for(let z=0;z<res;z++)for(let y=0;y<res;y++)for(let x=0;x<res;x++){
    const X=(x/(res/2)-1)*extent,Y=(y/(res/2)-1)*extent,Z=(z/(res/2)-1)*extent;
    let d=10;for(const [c,r] of shapes)d=union(d,ellipsoid(X,Y,Z,c,r));
    // Fine carving gives the silhouette a tactile illustrated surface.
    const grain=.004*Math.sin(Y*70+Math.sin(X*31)*2)*Math.sin(X*47+Z*23);
    body.field[x+y*res+z*res*res]=-d+grain;
  }
  body.update();paw.add(body);
  // Etched fur strokes bridge the original ink language and the sculpted volume.
  const furPoints=[];
  let seed=917+active*31;
  const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  const distance=(x,y,z)=>{let d=10;for(const [c,r] of shapes)d=union(d,ellipsoid(x,y,z,c,r));return d;};
  const surface=(x,y)=>{if(distance(x,y,0)>-.018)return null;let a=0,b=.7;for(let i=0;i<13;i++){const m=(a+b)/2;if(distance(x,y,m)<0)a=m;else b=m;}return(a+b)/2+.008;};
  for(let i=0;i<2200;i++){
    const x=(random()-.5)*2.3,y=random()*3.5-1.9,z=surface(x,y);if(z===null)continue;
    const length=.025+random()*.052,dx=x*.025+(random()-.5)*.014,z2=surface(x+dx,y+length);if(z2===null)continue;
    furPoints.push(x,y,z,x+dx,y+length,z2);
  }
  const furGeometry=new THREE.BufferGeometry();furGeometry.setAttribute('position',new THREE.Float32BufferAttribute(furPoints,3));
  fur=new THREE.LineSegments(furGeometry,new THREE.LineBasicMaterial({color:0xc1bdb3,transparent:true,opacity:.32}));paw.add(fur);
  shapes.slice(2).forEach(([c,r],i)=>{
    const claw=new THREE.Mesh(clawGeometry(c[0],c[1]+r[1]*.75,c[2],i<2?-1:1),new THREE.MeshStandardMaterial({color:0xe6e2d6,roughness:.34,metalness:.03}));claws.push(claw);paw.add(claw);
    const pad=new THREE.Mesh(new THREE.SphereGeometry(1,28,18),new THREE.MeshStandardMaterial({color:0x191918,roughness:.9}));pad.position.set(c[0],c[1],-.31);pad.scale.set(.19,.27,.12);pads.push(pad);paw.add(pad);
  });
  const pad=new THREE.Mesh(new THREE.SphereGeometry(1,32,24),new THREE.MeshStandardMaterial({color:0x191918,roughness:.9}));pad.position.set(0,.12,-.39);pad.scale.set(.47,.38,.13);pads.push(pad);paw.add(pad);
  // Small side dewclaw, separate from the four main digits.
  const dew=new THREE.Mesh(clawGeometry(-.65,-.29,0,-1),new THREE.MeshStandardMaterial({color:0xdcd7c9,roughness:.5}));dew.scale.setScalar(.48);dew.position.set(-.28,-.27,.05);paw.add(dew);claws.push(dew);
  paw.rotation.set(.04,v.turn,-.055);scene.add(paw);setFinish(finish);render();
}
function setFinish(name){
  finish=name;if(!body)return;
  const palette={graphite:{color:0x333331,roughness:.65,metalness:.13},porcelain:{color:0xe5e0d4,roughness:.27,metalness:0},ink:{color:0x080808,roughness:1,metalness:0}}[name];
  body.material.color.set(palette.color);body.material.roughness=palette.roughness;body.material.metalness=palette.metalness;
  claws.forEach(c=>{c.material.color.set(name==='ink'?0x171717:name==='porcelain'?0xa49b89:0x353531);});
  pads.forEach(p=>p.material.color.set(name==='porcelain'?0xb7b0a2:0x171716));
  if(fur){fur.material.color.set(name==='porcelain'?0x807a70:0xd1cabe);fur.material.opacity=name==='ink'?.55:.32;}
  document.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===name)));
  render();
}
function render(){if(renderer&&is3d&&visible)renderer.render(scene,camera);}
function stopSpin(){spinning=false;controls.autoRotate=false;document.querySelector('#spin').setAttribute('aria-pressed','false');document.querySelector('#spin span').textContent='Off';}
function reset(){stopSpin();camera.position.set(0,.05,8.5);controls.target.set(0,.05,0);controls.update();render();}
function setView(use3d){
  is3d=use3d;holder.hidden=!use3d;original.hidden=use3d;document.querySelector('#view-3d').setAttribute('aria-pressed',String(use3d));document.querySelector('#view-2d').setAttribute('aria-pressed',String(!use3d));document.querySelector('#stage-note').textContent=use3d?'DRAG TO ROTATE · ARROW KEYS TO TURN':'THE ORIGINAL ILLUSTRATION';
  document.querySelectorAll('[data-finish],#spin,#reset').forEach(b=>b.disabled=!use3d);
  if(!use3d)stopSpin();status.textContent=use3d?'Drag the paw, or focus it and use the arrow keys.':'Original ink illustration.';render();
}
try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;holder.appendChild(renderer.domElement);
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','3D cat paw. Drag to rotate; arrow keys turn the sculpture; Home resets.');
  controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=false;controls.rotateSpeed=.7;controls.autoRotateSpeed=.8;controls.target.set(0,.05,0);controls.addEventListener('change',render);
  controls.addEventListener('start',()=>{if(spinning)stopSpin();});
  renderer.domElement.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();stopSpin();
    if(event.key==='Home'){reset();return;}
    const off=camera.position.clone().sub(controls.target),spherical=new THREE.Spherical().setFromVector3(off);
    if(event.key==='ArrowLeft')spherical.theta-=.15;if(event.key==='ArrowRight')spherical.theta+=.15;if(event.key==='ArrowUp')spherical.phi-=.15;if(event.key==='ArrowDown')spherical.phi+=.15;spherical.phi=Math.max(.1,Math.min(Math.PI-.1,spherical.phi));camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();render();
  });
  new ResizeObserver(()=>{const {width,height}=stage.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();render();}).observe(stage);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;render();}).observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpin();});
  reduceMotion.addEventListener('change',()=>{if(reduceMotion.matches)stopSpin();});
  makePaw();controls.update();status.textContent='Drag the paw, or focus it and use the arrow keys.';
  let previous=0;renderer.setAnimationLoop(time=>{const delta=Math.min((time-previous)/1000,.05);previous=time;if(spinning&&visible&&!document.hidden&&is3d){controls.update(delta);render();}});
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();setView(false);status.textContent='3D view paused. The original illustration is available.';});
}catch(error){console.error('Paw viewer:',error);holder.hidden=true;original.hidden=false;is3d=false;document.querySelector('#fallback').hidden=false;document.querySelector('#view-3d').disabled=true;document.querySelectorAll('[data-finish],#spin,#reset').forEach(b=>b.disabled=true);status.textContent='Original illustration shown.';}

document.querySelectorAll('[data-paw]').forEach(button=>button.addEventListener('click',()=>{active=Number(button.dataset.paw);document.querySelectorAll('[data-paw]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelector('#paw-title').textContent=variants[active].name;document.querySelector('.index').textContent=`0${active+1} / 04`;original.src=`../_assets/v11/${variants[active].image}.png`;original.alt=`Original ${variants[active].name.toLowerCase()} cat paw illustration`;if(renderer){makePaw();reset();}status.textContent=`${variants[active].name} paw selected.`;}));
document.querySelectorAll('[data-finish]').forEach(button=>button.addEventListener('click',()=>setFinish(button.dataset.finish)));
document.querySelector('#reset').addEventListener('click',reset);
document.querySelector('#view-2d').addEventListener('click',()=>setView(false));
document.querySelector('#view-3d').addEventListener('click',()=>setView(true));
document.querySelector('#spin').addEventListener('click',()=>{spinning=!spinning;controls.autoRotate=spinning;document.querySelector('#spin').setAttribute('aria-pressed',String(spinning));document.querySelector('#spin span').textContent=spinning?'On':'Off';status.textContent=spinning?'Auto rotation on. Drag the paw to stop.':'Auto rotation off.';});
