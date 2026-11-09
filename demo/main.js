import * as THREE from 'three';
import './style.css';
import { bindTouchControls } from './touch.js';
import { createWorld, key, TYPES, SIZE, heightAt, collides, movePlayer, traceBlock } from './world.js';

const $ = s => document.querySelector(s);
const canvas = $('#world'), menu = $('#menu'), play = $('#play'), status = $('#status');
const blocks = createWorld();
let touchMode = matchMedia('(any-pointer: coarse)').matches || navigator.maxTouchPoints > 0;
let touchPlaying = false, renderNeeded = true;
document.body.classList.toggle('touch', touchMode);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({canvas, antialias:!touchMode, powerPreference:'high-performance'});
} catch {
  status.textContent = 'WebGL is unavailable. Try a browser with hardware acceleration enabled.';
  play.disabled = true;
  throw new Error('WebGL renderer unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio, touchMode ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0xa9d4e5);
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xa9d4e5, 34, 90);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .05, 130);
camera.rotation.order = 'YXZ';
scene.add(new THREE.HemisphereLight(0xd9efff, 0x636440, 2.1));
const sun = new THREE.DirectionalLight(0xffedc7, 2.5);
sun.position.set(-20, 40, 15);
scene.add(sun);

function texture(base, seed, side = false) {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base; ctx.fillRect(0,0,16,16);
  let state = seed;
  for (let y=0;y<16;y++) for (let x=0;x<16;x++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const noise = state >>> 16;
    ctx.fillStyle = noise % 2 ? `rgba(255,255,220,${(noise % 16) / 100})` : `rgba(0,0,0,${(noise % 19) / 100})`;
    ctx.fillRect(x,y,1,1);
  }
  if (side) {
    ctx.fillStyle='#719445';ctx.fillRect(0,0,16,3);
    for(let x=0;x<16;x+=2) ctx.fillRect(x,3,1,1+(x%3));
  }
  const t = new THREE.CanvasTexture(c);
  t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const colors = ['#7caa4c','#98704d','#8b9291','#795234','#548342'];
const material = (color, seed, side) => new THREE.MeshLambertMaterial({map:texture(color, seed, side)});
const dirt = material(colors[1],2), grassSide = material(colors[1],3,true);
const materials = [
  [grassSide,grassSide,material(colors[0],1),dirt,grassSide,grassSide],
  dirt, material(colors[2],4), material(colors[3],5), material(colors[4],6)
];
const geometry = new THREE.BoxGeometry(1,1,1);
const meshes = [], dummy = new THREE.Object3D();
const neighbors = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
function rebuild() {
  for(const mesh of meshes) {scene.remove(mesh); mesh.dispose();}
  meshes.length = 0;
  const groups = TYPES.map(()=>[]);
  for(const [k,type] of blocks) {
    const p = k.split(',').map(Number);
    if(neighbors.every(([x,y,z])=>blocks.has(key(p[0]+x,p[1]+y,p[2]+z)))) continue;
    groups[TYPES.indexOf(type)].push(p);
  }
  // ponytail: rebuild finite world after edits; chunk meshes if world size grows.
  groups.forEach((positions,i)=>{
    const mesh = new THREE.InstancedMesh(geometry,materials[i],positions.length);
    mesh.userData.positions = positions;
    positions.forEach(([x,y,z],index)=>{
      dummy.position.set(x+.5,y+.5,z+.5);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);
    });
    mesh.computeBoundingSphere(); meshes.push(mesh);scene.add(mesh);
  });
}
rebuild();
const water = new THREE.Mesh(new THREE.PlaneGeometry(SIZE*2,SIZE*2),new THREE.MeshPhongMaterial({color:0x459fbc,transparent:true,opacity:.72,shininess:90,depthWrite:false}));
water.rotation.x = -Math.PI/2;water.position.y = 1.3; scene.add(water);
const cloudMat = new THREE.MeshLambertMaterial({color:0xffffff});
for(let i=0;i<13;i++) {
  const cloud = new THREE.Mesh(new THREE.BoxGeometry(7+(i%3)*3,1.2,3+(i%2)*2),cloudMat);
  cloud.position.set(Math.sin(i*12.3)*48,22+(i%3)*2,Math.cos(i*8.7)*45);
  scene.add(cloud);
}
const outline = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.007,1.007,1.007)),new THREE.LineBasicMaterial({color:0x263521}));
outline.visible=false;scene.add(outline);
const player = new THREE.Vector3();
const velocity = new THREE.Vector3();
let yaw = 0, pitch = -.12, grounded = false, selected=0, target=null;
function respawn() {
  player.set(-7.5,heightAt(-8,19)+1.02,19.5);
  velocity.set(0,0,0);yaw=.12;pitch=-.10;
}
respawn();
const keys = new Set();
const lookDirection = new THREE.Vector3();
const locked = () => document.pointerLockElement === canvas;
const active = () => touchPlaying || locked();
const touch = bindTouchControls({canvas, enabled: () => touchPlaying,
  onLook: (dx,dy) => {yaw -= dx * .004; pitch = THREE.MathUtils.clamp(pitch - dy * .004,-1.5,1.5);},
  onJump: jump, onEdit: editBlock
});
function jump() {
  if (active() && grounded) {velocity.y = 8; grounded = false;}
}
function setPlaying(playing) {
  document.body.classList.toggle('playing',playing);
  menu.inert = playing;
  $('#touch-controls').inert = !playing || !touchMode;
  renderNeeded = true;
  if (!playing) {
    keys.clear(); touch.reset();
    play.innerHTML = 'Back to the world <span aria-hidden="true">↗</span>';
    status.textContent = 'Your world is right where you left it.';
    $('#respawn').hidden = false; play.focus({preventScroll:true});
  }
}
function pause() {
  touchPlaying = false;
  if (locked()) document.exitPointerLock();
  setPlaying(false);
}
$('#pause').onclick = pause;
$('#respawn').onclick = () => {respawn(); renderNeeded = true; status.textContent = 'Back at spawn. Ready when you are.';};
TYPES.forEach((type,i)=>{
  const btn=document.createElement('button');btn.className='slot';btn.title=`${type} (${i+1})`;btn.setAttribute('aria-label',`Select ${type}`);
  btn.innerHTML=`<small>${i+1}</small><span class="cube" style="--block:${colors[i]}" aria-hidden="true"></span>`;
  btn.onclick=()=>select(i);$('#hotbar').append(btn);
});
function select(i) {
  selected=i;
  $('#touch-hint').textContent=`${TYPES[i]} selected · Aim + tap Break or Place`;
  [...$('#hotbar').children].forEach((el,n)=>{el.classList.toggle('active',n===i);el.setAttribute('aria-pressed',String(n===i));});
}
select(0);
async function start() {
  if (touchMode) {
    touchPlaying = true; setPlaying(true);
    $('#touch-hint').textContent=`${TYPES[selected]} selected · Drag to look, aim + build`;
    return;
  }
  try { await canvas.requestPointerLock(); }
  catch {status.textContent='Mouse capture was blocked. Click Enter the world to try again.';}
}
play.addEventListener('pointerdown', e => {
  // Hybrid tablets can switch between a finger and an attached mouse on resume.
  touchMode = e.pointerType !== 'mouse';
  document.body.classList.toggle('touch', touchMode);
  renderer.setPixelRatio(Math.min(devicePixelRatio,touchMode ? 1.25 : 1.75));
});
play.onclick=start;
document.addEventListener('pointerlockchange',()=>setPlaying(active()));
document.addEventListener('pointerlockerror',()=>{status.textContent='Mouse capture unavailable. Try opening this page directly in a desktop browser.';});
document.addEventListener('mousemove',e=>{
  if(!locked())return;
  yaw-=e.movementX*.002;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.002,-1.5,1.5);
});
document.addEventListener('keydown',e=>{
  if(!active())return;
  if(e.code==='Escape'){pause();return;}
  if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
  keys.add(e.code);
  if(/^Digit[1-5]$/.test(e.code))select(Number(e.code.slice(-1))-1);
  if(e.code==='Space'&&!e.repeat)jump();
  if(e.code==='KeyR')respawn();
});
document.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{if(active())pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden && active())pause();});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
canvas.addEventListener('wheel',e=>{if(locked()){e.preventDefault();select((selected+(e.deltaY>0?1:4))%5);}}, {passive:false});
canvas.addEventListener('mousedown',e=>{if(locked() && [0,2].includes(e.button))editBlock(e.button);});
function editBlock(button) {
  if(!active())return;
  camera.position.copy(player);camera.position.y+=1.62;camera.rotation.set(pitch,yaw,0);
  camera.getWorldDirection(lookDirection);
  target=traceBlock(blocks,camera.position,lookDirection);
  if(!target){$('#touch-hint').textContent='Too far away. Aim at a closer block.';return;}
  const p=target.position;
  if(button===0) {
    if(p[1]<=-3){$('#touch-hint').textContent='This is the bottom of your world.';return;}
    blocks.delete(key(...p));
  } else {
    const q=p.map((value,i)=>value+target.normal[i]);
    if(Math.abs(q[0])>=SIZE||Math.abs(q[2])>=SIZE||q[1]>24||q[1]<-3)return;
    const k=key(...q);if(blocks.has(k))return;
    blocks.set(k,TYPES[selected]);
    if(collides(blocks,player)){blocks.delete(k);$('#touch-hint').textContent='Step back to place a block here.';return;}
  }
  $('#touch-hint').textContent=button===0 ? 'Block removed. Make room for something new.' : `${TYPES[selected]} placed. Keep creating.`;
  target=null;outline.visible=false;rebuild();
}
if(touchMode) status.textContent='Touch to explore. No download. No rules.';
let last=performance.now();
function frame(now) {
  requestAnimationFrame(frame);
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(!active() && !renderNeeded)return;
  renderNeeded = false;
  if(active()) {
    const forward=Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')) + touch.state.forward;
    const right=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')) + touch.state.right;
    const scale=(keys.has('ShiftLeft')||keys.has('ShiftRight')||touch.state.sprinting?7:4.3)/Math.max(1,Math.hypot(forward,right));
    velocity.x=(right*Math.cos(yaw)-forward*Math.sin(yaw))*scale;
    velocity.z=(-forward*Math.cos(yaw)-right*Math.sin(yaw))*scale;
    velocity.y=Math.max(-22,velocity.y-23*dt);
    grounded=movePlayer(blocks,player,velocity,dt);
    if(player.y<-12)respawn();
  }
  camera.position.copy(player);camera.position.y+=1.62;camera.rotation.set(pitch,yaw,0);
  if(active()) {
    camera.getWorldDirection(lookDirection);
    target=traceBlock(blocks,camera.position,lookDirection);
    outline.visible=!!target;
    if(target) {
      const p=target.position;outline.position.set(p[0]+.5,p[1]+.5,p[2]+.5);
    }
  }else{outline.visible=false;}
  $('#coords').textContent=[player.x,player.y,player.z].map(n=>Math.floor(n).toString().padStart(2,'0')).join(' / ');
  renderer.render(scene,camera);
}
requestAnimationFrame(frame);
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
  touch.reset(); renderNeeded = true;
});
window.addEventListener('orientationchange',()=>{if(active())pause();});
