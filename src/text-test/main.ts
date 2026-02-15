import * as THREE from 'three';
import { vertexShader } from '../splash/blob';

const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying float vDisplacement;
  varying vec3 vPosition;

  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.6, 0.6, 0.6);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.0, 0.33, 0.67);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    float colorMix = vDisplacement * 2.0 + vPosition.y * 0.3 + sin(uTime * 0.5) * 0.2;
    vec3 color = palette(colorMix + 0.3);
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);
    color += fresnel * vec3(0.4, 0.2, 0.6) * 0.8;
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDirection), 0.0), 32.0);
    color += spec * 0.3;
    gl_FragColor = vec4(color, 1.0);
  }
`;

(function () {
  const container = document.getElementById('canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a12, 1);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1.2, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uNoiseStrength: { value: 0.35 },
      uNoiseFrequency: { value: 1.5 },
    },
  });

  const blob = new THREE.Mesh(geometry, material);
  scene.add(blob);

  function animate(t: number) {
    material.uniforms.uTime.value = t * 0.001;
    blob.rotation.y = t * 0.0003;
    blob.rotation.x = Math.sin(t * 0.0002) * 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  requestAnimationFrame(animate);
})();
