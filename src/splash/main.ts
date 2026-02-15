import './splash.css';
import { createBlob } from './blob';
import { createParticles } from './particles';
import {
  animateParticles,
  animateBlobGlow,
  animateImplosion,
  animateTextReveal,
  animateTextBreathing,
  animateRedirect,
} from './animations';

export interface Timeline {
  openingEnd: number;
  blobEntranceEnd: number;
  blobPerformEnd: number;
  implosionStart: number;
  implosionPeak: number;
  implosionEnd: number;
  textStart: number;
  textEnd: number;
  holdEnd: number;
  redirect: number;
}

const T: Timeline = {
  openingEnd: 800,
  blobEntranceEnd: 1800,
  blobPerformEnd: 3200,
  implosionStart: 3200,
  implosionPeak: 3800,
  implosionEnd: 4200,
  textStart: 4400,
  textEnd: 5300,
  holdEnd: 6000,
  redirect: 6500,
};

(function () {
  const container = document.getElementById('canvas-container');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducedMotion) {
    document.querySelectorAll('.letter').forEach((l) => ((l as HTMLElement).style.opacity = '1'));
    setTimeout(() => (window.location.href = './terminal'), 2000);
    return;
  }

  if (!container) return;

  // Create particles
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    createParticles(particlesContainer);
  }

  // Create blob
  const { renderer, blob, material, uniforms, scene, camera } = createBlob(container);

  // Start animations
  animateParticles();
  animateBlobGlow();
  animateImplosion(T);
  animateTextReveal(T);
  animateTextBreathing(T);
  animateRedirect(T);

  // Three.js render loop
  let startTime: number | null = null;
  let animationId: number;

  function animate(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    uniforms.uTime.value = elapsed * 0.001;

    let scale = 0.1;
    let opacity = 0;
    let noiseStrength = 0.35;

    if (elapsed < T.openingEnd) {
      scale = 0.1;
      opacity = 0;
    } else if (elapsed < T.blobEntranceEnd) {
      const t = (elapsed - T.openingEnd) / (T.blobEntranceEnd - T.openingEnd);
      const eased = 1 - Math.pow(1 - t, 3);
      scale = 0.1 + eased * 0.9;
      opacity = eased;
      noiseStrength = 0.2 + eased * 0.15;
    } else if (elapsed < T.blobPerformEnd) {
      scale = 1;
      opacity = 1;
      noiseStrength = 0.35;
    } else if (elapsed < T.implosionEnd) {
      const t = (elapsed - T.implosionStart) / (T.implosionEnd - T.implosionStart);
      if (t < 0.2) {
        const expand = t / 0.2;
        scale = 1 + Math.sin(expand * Math.PI) * 0.15;
        opacity = 1;
      } else {
        const shrinkT = (t - 0.2) / 0.8;
        const eased = shrinkT * shrinkT * shrinkT;
        scale = 1.15 - eased * 1.13;
        opacity = shrinkT < 0.8 ? 1 : 1 - (shrinkT - 0.8) / 0.2;
      }
      noiseStrength = 0.35 - t * 0.25;
    } else {
      scale = 0.02;
      opacity = 0;
    }

    uniforms.uNoiseStrength.value = noiseStrength;
    uniforms.uOpacity.value = opacity;
    blob.scale.setScalar(Math.max(0.02, scale));
    blob.rotation.y = elapsed * 0.0004;
    blob.rotation.x = Math.sin(elapsed * 0.0002) * 0.15;

    renderer.render(scene, camera);

    if (elapsed < T.redirect + 1000) {
      animationId = requestAnimationFrame(animate);
    }
  }

  function start() {
    renderer.render(scene, camera);
    requestAnimationFrame(() => {
      animationId = requestAnimationFrame(animate);
    });
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(start);
  } else {
    setTimeout(start, 100);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && animationId) {
      cancelAnimationFrame(animationId);
    }
  });
})();
