const AudioEngine = (function() {
  let ctx;
  let isMuted = false;
  let hissNode = null;
  let hissGain = null;
  
  function init() {
    if (ctx) {
      if (ctx.state === 'suspended') ctx.resume();
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume(); // Attempt to resume immediately (works if called during a user gesture)
      const resumeContext = function() {
        if (ctx.state === 'suspended') ctx.resume();
        document.removeEventListener('click', resumeContext);
      };
      document.addEventListener('click', resumeContext);
    }
  }

  function toggleMute() {
    init();
    isMuted = !isMuted;
    if (isMuted && hissGain) {
      hissGain.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
    } else if (!isMuted && hissGain) {
      hissGain.gain.setTargetAtTime(0.05, ctx.currentTime, 0.1);
    }
    return isMuted;
  }

  function generateNoiseBuffer() {
    if (!ctx) return null;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  function playHiss() {
    if (!ctx) init();
    if (hissNode) return; 
    
    hissNode = ctx.createBufferSource();
    hissNode.buffer = generateNoiseBuffer();
    hissNode.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4000;
    filter.Q.value = 0.5;

    hissGain = ctx.createGain();
    hissGain.gain.value = isMuted ? 0 : 0.05;

    hissNode.connect(filter);
    filter.connect(hissGain);
    hissGain.connect(ctx.destination);
    
    hissNode.start();
  }

  function playClick() {
    init();
    if (!ctx || isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + 0.01;
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  function playShutter() {
    init();
    if (!ctx || isMuted) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime + 0.01;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      const noise = ctx.createBufferSource();
      noise.buffer = generateNoiseBuffer();
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 2000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.15);
    } catch (e) {}
  }

  return {
    init: init,
    toggleMute: toggleMute,
    playHiss: playHiss,
    playClick: playClick,
    playShutter: playShutter
  };
})();
