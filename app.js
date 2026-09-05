// Tomato Timer -- pomodoro clock, mode switching, variety theming, and chime.
// Loaded with `defer`, so the DOM is ready by the time this runs.

(function(){
  'use strict';

  const MODES = {
    focus: { min:25, label:"Focus" },
    short: { min:5,  label:"Short break" },
    long:  { min:15, label:"Long break" }
  };

  const stage    = document.getElementById('stage');
  const timeEl   = document.getElementById('time');
  const phaseEl  = document.getElementById('phase');
  const toggleBtn= document.getElementById('toggle');
  const resetBtn = document.getElementById('reset');
  const progress = document.getElementById('progress');
  const handEl   = document.getElementById('hand');
  const ticksEl  = document.getElementById('ticks');
  const harvestEl= document.getElementById('harvest');
  const modeBtns = Array.from(document.querySelectorAll('.modes button'));
  const varietyBtns = Array.from(document.querySelectorAll('.varieties button'));

  const R = 128;
  const CIRC = 2 * Math.PI * R;
  progress.style.strokeDasharray = CIRC;

  // build 60 tick marks, longer every 5th
  for (let i = 0; i < 60; i++){
    const major = i % 5 === 0;
    const a = (i / 60) * Math.PI * 2 - Math.PI/2;
    const outer = 138, inner = major ? 126 : 132;
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', 150 + Math.cos(a)*inner);
    line.setAttribute('y1', 150 + Math.sin(a)*inner);
    line.setAttribute('x2', 150 + Math.cos(a)*outer);
    line.setAttribute('y2', 150 + Math.sin(a)*outer);
    line.setAttribute('class', major ? 'tick major' : 'tick');
    ticksEl.appendChild(line);
  }

  let mode = 'focus';
  let total = MODES[mode].min * 60 * 1000;   // ms
  let remaining = total;                      // ms
  let running = false;
  let endAt = 0;                              // timestamp when it hits zero
  let rafId = null;
  let completedFocus = 0;

  function fmt(ms){
    const s = Math.max(0, Math.ceil(ms/1000));
    const m = Math.floor(s/60);
    const r = s % 60;
    return m + ':' + String(r).padStart(2,'0');
  }

  function render(){
    timeEl.textContent = fmt(remaining);
    const elapsed = total - remaining;
    const frac = total > 0 ? elapsed/total : 0;
    // drain the ring as time elapses
    progress.style.strokeDashoffset = CIRC * frac;
    // sweep the hand once around per session
    handEl.style.transform = 'rotate(' + (frac * 360) + 'deg)';
  }

  function tick(){
    remaining = endAt - Date.now();
    if (remaining <= 0){
      remaining = 0;
      render();
      finish();
      return;
    }
    render();
    rafId = requestAnimationFrame(tick);
  }

  function start(){
    if (running || remaining <= 0) return;
    running = true;
    endAt = Date.now() + remaining;
    toggleBtn.textContent = 'Pause';
    stage.classList.remove('done');
    rafId = requestAnimationFrame(tick);
  }

  function pause(){
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    remaining = endAt - Date.now();
    toggleBtn.textContent = 'Resume';
    render();
  }

  function reset(){
    running = false;
    cancelAnimationFrame(rafId);
    total = MODES[mode].min * 60 * 1000;
    remaining = total;
    toggleBtn.textContent = 'Start';
    stage.classList.remove('done');
    render();
  }

  function finish(){
    running = false;
    cancelAnimationFrame(rafId);
    toggleBtn.textContent = 'Start';
    stage.classList.add('done');
    chime();
    if (mode === 'focus'){
      completedFocus++;
      drawHarvest();
    }
    // reset back to full so it's ready to go again
    remaining = total;
    setTimeout(() => { if(!running) render(); }, 650);
  }

  function setMode(next){
    mode = next;
    modeBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    phaseEl.textContent = MODES[mode].label;
    reset();
  }

  function drawHarvest(){
    // keep the label, refresh pips
    harvestEl.querySelectorAll('.pip').forEach(p => p.remove());
    const shown = Math.min(completedFocus, 8);
    for (let i = 0; i < Math.max(shown, 4); i++){
      const pip = document.createElement('span');
      pip.className = 'pip' + (i < completedFocus ? ' on' : '');
      harvestEl.appendChild(pip);
    }
  }

  // gentle three-note chime, no audio files
  let audioCtx = null;
  function chime(){
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [880, 1108, 1318].forEach((f, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        const t = now + i * 0.18;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.42);
      });
    }catch(e){/* audio not available, fine */}
  }

  // events
  toggleBtn.addEventListener('click', () => running ? pause() : start());
  resetBtn.addEventListener('click', reset);
  modeBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

  function setVariety(next){
    document.body.dataset.variety = next;
    varietyBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.variety === next)));
  }
  varietyBtns.forEach(b => b.addEventListener('click', () => setVariety(b.dataset.variety)));

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space'){ e.preventDefault(); running ? pause() : start(); }
    else if (e.key.toLowerCase() === 'r'){ reset(); }
  });

  drawHarvest();
  render();
})();
