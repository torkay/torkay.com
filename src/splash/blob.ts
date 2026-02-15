import * as THREE from 'three';

export const vertexShader = `
  uniform float uTime;
  uniform float uNoiseStrength;
  uniform float uNoiseFrequency;
  varying vec3 vNormal;
  varying float vDisplacement;
  varying vec3 vPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    float noise1 = snoise(position * uNoiseFrequency + uTime * 0.3);
    float noise2 = snoise(position * uNoiseFrequency * 2.0 + uTime * 0.5) * 0.5;
    float noise3 = snoise(position * uNoiseFrequency * 4.0 + uTime * 0.7) * 0.25;
    float totalNoise = (noise1 + noise2 + noise3) * uNoiseStrength;
    vDisplacement = totalNoise;
    vec3 newPosition = position + normal * totalNoise;
    float twist = sin(position.y * 2.0 + uTime) * 0.1;
    newPosition.x += twist;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const fragmentShader = `
  uniform float uTime;
  uniform float uOpacity;
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
    float colorMix = vDisplacement * 2.0 + vPosition.y * 0.3;
    colorMix += sin(uTime * 0.5) * 0.2;
    vec3 color = palette(colorMix + 0.3);
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(dot(viewDirection, vNormal), 0.0), 3.0);
    color += fresnel * vec3(0.4, 0.2, 0.6) * 0.8;
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float spec = pow(max(dot(reflect(-lightDir, vNormal), viewDirection), 0.0), 32.0);
    color += spec * 0.3;
    gl_FragColor = vec4(color, uOpacity);
  }
`;

export interface BlobUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uNoiseStrength: { value: number };
  uNoiseFrequency: { value: number };
  uOpacity: { value: number };
}

export function createBlob(container: HTMLElement) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a12, 1);
  container.appendChild(renderer.domElement);

  const uniforms: BlobUniforms = {
    uTime: { value: 0 },
    uNoiseStrength: { value: 0.3 },
    uNoiseFrequency: { value: 1.5 },
    uOpacity: { value: 0 },
  };

  const geometry = new THREE.IcosahedronGeometry(1.2, 64);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
  });

  const blob = new THREE.Mesh(geometry, material);
  blob.scale.setScalar(0.1);
  scene.add(blob);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  return { scene, camera, renderer, blob, material, uniforms };
}
