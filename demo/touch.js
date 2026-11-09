// Dead zone removes thumb jitter; outer ring clamps diagonal speed to walking speed.
export function stickVector(dx, dy, radius) {
  const distance = Math.hypot(dx, dy);
  const strength = Math.min(1, Math.max(0, (distance / radius - .12) / .88));
  return {right: distance ? dx / distance * strength : 0, forward: distance ? -dy / distance * strength : 0};
}

export function bindTouchControls({canvas, enabled, onLook, onJump, onEdit}) {
  const joystick = document.querySelector('#joystick');
  const stick = document.querySelector('#stick');
  const sprint = document.querySelector('#sprint');
  const state = {right:0, forward:0, sprinting:false};
  let moveId = null, lookId = null, lastX = 0, lastY = 0;
  function clearMove() {
    const id = moveId; moveId = null;
    state.right = state.forward = 0;
    stick.style.transform = '';
    joystick.classList.remove('engaged');
    if (id !== null && joystick.hasPointerCapture(id)) joystick.releasePointerCapture(id);
  }
  function clearLook() {
    const id = lookId; lookId = null;
    if (id !== null && canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }
  function move(e) {
    const rect = joystick.getBoundingClientRect(), radius = rect.width * .32;
    const dx = e.clientX - rect.left - rect.width / 2, dy = e.clientY - rect.top - rect.height / 2;
    Object.assign(state, stickVector(dx, dy, radius));
    const scale = Math.min(1, radius / (Math.hypot(dx, dy) || 1));
    stick.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
  }
  joystick.addEventListener('pointerdown', e => {
    if (!enabled() || moveId !== null) return;
    e.preventDefault(); moveId = e.pointerId;
    joystick.setPointerCapture(moveId); joystick.classList.add('engaged'); move(e);
  });
  joystick.addEventListener('pointermove', e => {if (e.pointerId === moveId) move(e);});
  for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    joystick.addEventListener(event, e => {if (e.pointerId === moveId) clearMove();});
    canvas.addEventListener(event, e => {if (e.pointerId === lookId) clearLook();});
  }
  canvas.addEventListener('pointerdown', e => {
    if (!enabled() || e.pointerType !== 'touch' || lookId !== null) return;
    e.preventDefault(); lookId = e.pointerId; lastX = e.clientX; lastY = e.clientY;
    canvas.setPointerCapture(lookId);
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerId !== lookId) return;
    onLook(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX; lastY = e.clientY;
  });
  sprint.onclick = () => {
    if (!enabled()) return;
    state.sprinting = !state.sprinting;
    sprint.setAttribute('aria-pressed', String(state.sprinting));
    sprint.querySelector('span').textContent = state.sprinting ? 'ON' : 'OFF';
  };
  for (const [id, action] of [['jump', onJump], ['break-block', () => onEdit(0)], ['place-block', () => onEdit(2)]]) {
    const button = document.getElementById(id);
    button.addEventListener('pointerdown', e => {
      if (!enabled()) return;
      e.preventDefault(); action();
    });
    // Keep native keyboard/assistive activation without double-firing touch clicks.
    button.addEventListener('click', e => {if (e.detail === 0 && enabled()) action();});
  }
  return {state, reset() {
    clearMove(); clearLook(); state.sprinting = false;
    sprint.setAttribute('aria-pressed','false'); sprint.querySelector('span').textContent = 'OFF';
  }};
}
