import anime from 'animejs';
import type { Timeline } from './main';

export function animateParticles() {
  anime({
    targets: '#vignette',
    opacity: [0, 0.7],
    duration: 1500,
    easing: 'easeOutQuad',
  });

  anime({
    targets: '.particle',
    translateY: () => [0, -window.innerHeight - 100],
    translateX: () => [anime.random(-30, 30), anime.random(-50, 50)],
    opacity: [0, 0.9, 0.8, 0.5, 0],
    scale: () => [0.5, anime.random(0.8, 1.3), 0.3],
    duration: () => 5000 + Math.random() * 2000,
    delay: () => Math.random() * 2000,
    easing: 'easeOutQuad',
    loop: true,
  });
}

export function animateBlobGlow() {
  anime({
    targets: '#blobGlow',
    scale: [0, 1.5],
    opacity: [0, 1],
    duration: 1200,
    delay: 600,
    easing: 'easeOutExpo',
  });

  anime({
    targets: '#blobGlow',
    scale: [1.5, 1.7, 1.5],
    opacity: [1, 0.85, 1],
    duration: 1200,
    delay: 1800,
    easing: 'easeInOutSine',
    loop: 2,
  });

  anime({
    targets: '#blobGlow',
    filter: ['blur(40px)', 'blur(50px)', 'blur(40px)'],
    duration: 2000,
    delay: 1800,
    easing: 'easeInOutSine',
    loop: 2,
  });
}

export function animateImplosion(T: Timeline) {
  setTimeout(() => {
    anime({
      targets: '#shockwave1',
      scale: [0, 4],
      opacity: [1, 0],
      duration: 800,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '#shockwave2',
      scale: [0, 3],
      opacity: [0.8, 0],
      duration: 700,
      delay: 100,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '#shockwave3',
      scale: [0, 2.5],
      opacity: [0.7, 0],
      duration: 600,
      delay: 180,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '#flash',
      opacity: [0, 0.85, 0],
      duration: 250,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '#canvas-container',
      translateX: [0, -5, 5, -4, 4, -2, 2, 0],
      translateY: [0, 3, -3, 2, -2, 1, 0],
      duration: 400,
      easing: 'easeOutExpo',
    });

    anime({
      targets: '#blobGlow',
      scale: [1.5, 0],
      opacity: [1, 0],
      duration: 600,
      easing: 'easeInExpo',
    });

    anime({
      targets: '#vignette',
      opacity: [0.7, 0.9, 0.6],
      duration: 600,
      easing: 'easeOutQuad',
    });
  }, T.implosionPeak);
}

export function animateTextReveal(T: Timeline) {
  setTimeout(() => {
    anime({
      targets: '#textGlow',
      opacity: [0, 0.9, 1],
      scale: [0.3, 1.2, 1],
      duration: 700,
      easing: 'easeOutElastic(1, 0.7)',
    });

    anime({
      targets: '.letter',
      opacity: [0, 1],
      translateY: [60, -8, 0],
      translateX: (_el: Element, i: number) => [(i - 5) * 25, 0],
      scale: [0.2, 1.15, 1],
      rotateZ: () => [anime.random(-25, 25), anime.random(-3, 3), 0],
      duration: 900,
      delay: anime.stagger(70, { start: 0 }),
      easing: 'easeOutElastic(1, 0.5)',
    });

    document.querySelectorAll('.letter').forEach((el, i) => {
      setTimeout(() => el.classList.add('animate'), i * 80);
    });
  }, T.textStart);
}

export function animateTextBreathing(T: Timeline) {
  setTimeout(() => {
    anime({
      targets: '.final-text',
      scale: [1, 1.02, 1],
      duration: 2000,
      easing: 'easeInOutSine',
      loop: true,
    });

    anime({
      targets: '#textGlow',
      opacity: [1, 0.7, 1],
      scale: [1, 1.1, 1],
      duration: 2500,
      easing: 'easeInOutSine',
      loop: true,
    });
  }, T.textEnd);
}

export function animateRedirect(T: Timeline) {
  setTimeout(() => {
    anime.remove('.final-text');
    anime.remove('#textGlow');

    anime({
      targets: ['.final-text', '#textGlow'],
      opacity: 0,
      scale: 0.95,
      duration: 400,
      easing: 'easeInQuad',
    });

    anime({
      targets: ['#vignette', '.particles-container'],
      opacity: 0,
      duration: 500,
      easing: 'easeInQuad',
    });

    anime({
      targets: 'body',
      backgroundColor: '#000',
      duration: 400,
      easing: 'easeInQuad',
      complete: () => {
        window.location.href = './terminal';
      },
    });
  }, T.redirect);
}
