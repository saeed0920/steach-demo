import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, heightAt, key, collides, movePlayer, traceBlock } from './world.js';
import { stickVector } from './touch.js';

test('touch joystick dead zone, analog movement and diagonal speed cap', () => {
  assert.deepEqual(stickVector(0,0,40),{right:0,forward:0});
  assert.equal(Math.hypot(...Object.values(stickVector(2,2,40))),0);
  assert.ok(Math.abs(stickVector(0,-22.4,40).forward - .5) < 1e-10);
  const diagonal = stickVector(80,-80,40);
  assert.ok(Math.abs(Math.hypot(diagonal.right,diagonal.forward) - 1) < 1e-10);
  assert.ok(diagonal.right > 0 && diagonal.forward > 0);
  assert.equal(stickVector(0,80,40).forward,-1);
});

test('deterministic terrain, clear spawn, ground collision, wall collision and edits', () => {
  const world = createWorld();
  assert.deepEqual(world,createWorld());
  const p={x:-7.5,y:heightAt(-8,19)+1.02,z:19.5};
  assert.equal(collides(world,p),false);
  assert.equal(collides(world,{...p,y:p.y-1}),true);
  const velocity={x:0,y:-20,z:0};
  assert.equal(movePlayer(world,p,velocity,.1),true);
  assert.equal(collides(world,p),false);
  const wall=new Map([[key(1,0,0),'stone'],[key(1,1,0),'stone']]);
  assert.deepEqual(traceBlock(wall,{x:0,y:.5,z:.5},{x:1,y:0,z:0}),{position:[1,0,0],normal:[-1,0,0]});
  assert.equal(traceBlock(wall,{x:0,y:.5,z:.5},{x:-1,y:0,z:0}),null);
  assert.equal(traceBlock(wall,{x:-8,y:.5,z:.5},{x:1,y:0,z:0}),null);
  assert.equal(traceBlock(wall,{x:0,y:.5,z:.5},{x:0,y:0,z:0}),null);
  const walker={x:.5,y:0,z:.5};
  movePlayer(wall,walker,{x:20,y:0,z:0},.1);
  assert.ok(walker.x<.73,'cannot tunnel through a wall');
  assert.equal(collides(wall,walker),false);
  world.set(key(-8,Math.floor(p.y),19),'stone');
  assert.equal(collides(world,p),true);
  world.delete(key(-8,Math.floor(p.y),19));
  assert.equal(collides(world,p),false);
});
