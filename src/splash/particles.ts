export function createParticles(container: HTMLElement, count = 30): HTMLDivElement[] {
  const particles: HTMLDivElement[] = [];
  const hueOptions = ['280', '174', '25'];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = 2 + Math.random() * 5;
    const hue = hueOptions[Math.floor(Math.random() * hueOptions.length)];
    const saturation = 60 + Math.random() * 20;
    const lightness = 55 + Math.random() * 15;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      top: ${100 + Math.random() * 20}%;
      background: radial-gradient(circle, hsla(${hue}, ${saturation}%, ${lightness}%, 0.9), transparent);
      box-shadow: 0 0 ${size * 2.5}px hsla(${hue}, ${saturation}%, ${lightness}%, 0.6);
    `;
    container.appendChild(p);
    particles.push(p);
  }

  return particles;
}
