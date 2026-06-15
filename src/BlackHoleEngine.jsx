import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const diskVertex = `
  uniform float uTime;
  uniform float uThickness;
  varying vec2 vUv;
  varying float vNoise;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.03;
      amplitude *= 0.52;
    }

    return value;
  }

  void main() {
    vUv = uv;
    float plasma = fbm(vec2(uv.x * 12.0 - uTime * 0.08, uv.y * 8.0 + uTime * 0.03));
    float filament = sin((uv.x * 34.0 + plasma * 5.0 - uTime * 0.9) * 6.283185);
    vNoise = plasma;

    vec3 displaced = position;
    displaced += normal * ((plasma - 0.45) * uThickness + filament * uThickness * 0.16);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const diskFragment = `
  uniform float uTime;
  uniform float uAlpha;
  uniform float uHeat;
  varying vec2 vUv;
  varying float vNoise;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(269.5, 183.3))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.08;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    float tube = abs(vUv.y - 0.5) * 2.0;
    float verticalDensity = 1.0 - smoothstep(0.2, 1.0, tube);
    float turbulence = fbm(vec2(vUv.x * 15.0 - uTime * 0.09, vUv.y * 11.0 + vNoise * 2.0));
    float streak = sin(vUv.x * 84.0 + turbulence * 8.0 - uTime * 1.35) * 0.5 + 0.5;
    float hotFilament = smoothstep(0.42, 1.0, streak) * verticalDensity;
    float dustLane = 1.0 - smoothstep(0.45, 0.88, fbm(vec2(vUv.x * 22.0 + 4.0, vUv.y * 34.0 - uTime * 0.05))) * 0.42;
    float doppler = 0.72 + smoothstep(-0.2, 0.95, sin(vUv.x * 6.283185 - 0.7)) * 0.52;

    vec3 blue = vec3(0.03, 0.44, 0.82);
    vec3 deepOrange = vec3(0.12, 0.025, 0.0);
    vec3 orange = vec3(1.0, 0.30, 0.0);
    vec3 impactRed = vec3(1.0, 0.071, 0.31);
    float pinkAccent = smoothstep(0.78, 1.0, sin(vUv.x * 18.0 + turbulence * 7.0) * 0.5 + 0.5);
    float blueAccent = smoothstep(0.9, 1.0, sin(vUv.x * 31.0 - uTime * 0.9 + turbulence * 4.0) * 0.5 + 0.5);
    vec3 color = mix(deepOrange, orange, turbulence * 0.5 + hotFilament * 0.48);
    color = mix(color, impactRed, pinkAccent * hotFilament * 0.28);
    color = mix(color, blue, blueAccent * hotFilament * 0.12);

    float alpha = (verticalDensity * 0.26 + hotFilament * 0.52 + turbulence * 0.12) * dustLane * uAlpha;
    gl_FragColor = vec4(color * doppler * (0.72 + hotFilament * 0.34), alpha * 0.86);
  }
`;

const lensVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const starsFragment = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.05;
      amplitude *= 0.52;
    }

    return value;
  }

  float stars(vec2 p, float scale, float threshold) {
    vec2 grid = p * scale;
    vec2 id = floor(grid);
    vec2 f = fract(grid) - 0.5;
    float star = smoothstep(0.035, 0.0, length(f));
    float rnd = hash(id);
    return star * step(threshold, rnd) * (0.35 + rnd);
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    float r = length(p);
    vec2 dir = r > 0.001 ? normalize(p) : vec2(0.0);
    float lens = 0.14 / max(r * r, 0.06);

    // Star coordinates bend around the gravity well.
    vec2 warped = p + dir * lens * 0.16 + vec2(-dir.y, dir.x) * lens * 0.05;
    float s1 = stars(warped + vec2(11.0, 3.0), 72.0, 0.988);
    float s2 = stars(warped + vec2(-7.0, 19.0), 126.0, 0.994);
    float nebula = fbm(warped * 3.2 + vec2(-0.8, 0.2)) * smoothstep(1.4, 0.25, r);
    vec3 color = vec3(0.0);
    color += vec3(0.05, 0.025, 0.018) * nebula * 0.36;
    color += vec3(1.0, 0.30, 0.0) * s1 * 0.5;
    color += vec3(0.05, 0.48, 0.9) * s2 * 0.26;

    float alpha = clamp(nebula * 0.18 + s1 + s2 * 0.75, 0.0, 0.82);
    gl_FragColor = vec4(color, alpha);
  }
`;

const lensArcFragment = `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(91.7, 317.3))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= 1.12;
    float r = length(p);
    float angle = atan(p.y, p.x);
    float upper = smoothstep(-0.05, 0.24, p.y);
    float upperArc = smoothstep(0.08, 0.0, abs(r - 0.3)) * upper;
    float photonArc = smoothstep(0.035, 0.0, abs(r - 0.23)) * upper;
    float streak = sin(angle * 18.0 - uTime * 0.8 + noise(vec2(angle * 4.0, r * 16.0)) * 5.0) * 0.5 + 0.5;
    vec3 blue = vec3(0.03, 0.44, 0.82);
    vec3 orange = vec3(1.0, 0.30, 0.0);
    vec3 impactRed = vec3(1.0, 0.071, 0.31);
    vec3 color = mix(orange, impactRed, smoothstep(0.58, 1.0, streak) * 0.28);
    color = mix(color, blue, smoothstep(0.88, 1.0, streak) * 0.14);
    float alpha = upperArc * 0.46 + photonArc * 0.32;
    gl_FragColor = vec4(color * (0.82 + streak * 0.36), alpha);
  }
`;

const horizonSmokeFragment = `
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(41.7, 289.3))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p *= 2.05;
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= 1.02;
    float radius = length(p);
    float angle = atan(p.y, p.x);
    float smoke = fbm(vec2(cos(angle), sin(angle)) * 3.0 + vec2(uTime * 0.035, -uTime * 0.02));
    float softOuter = smoothstep(0.52, 0.26, radius);
    float innerCut = smoothstep(0.24, 0.32, radius);
    float halo = softOuter * innerCut;
    float rim = smoothstep(0.035, 0.0, abs(radius - 0.325));
    float alpha = (halo * (0.1 + smoke * 0.18) + rim * 0.32) * smoothstep(0.64, 0.18, radius);
    vec3 color = mix(vec3(1.0, 0.30, 0.0), vec3(1.0, 0.071, 0.31), smoke * 0.22);
    gl_FragColor = vec4(color * (0.42 + smoke * 0.44), alpha);
  }
`;

const TILT_65 = (65 * Math.PI) / 180;

function StarfieldBackdrop() {
  const materialRef = useRef(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(16, 9) },
    }),
    [],
  );
  const { size } = useThree();

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <mesh position={[0, 0, -3.25]} renderOrder={0}>
      <planeGeometry args={[9.5, 5.1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={lensVertex}
        fragmentShader={starsFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function AccretionDisk({ radius, tube, speed, alpha, heat, thickness, offset = 0 }) {
  const meshRef = useRef(null);
  const materialRef = useRef(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: offset },
      uAlpha: { value: alpha },
      uHeat: { value: heat },
      uThickness: { value: thickness },
    }),
    [alpha, heat, offset, thickness],
  );

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = elapsed + offset;
    }
    if (meshRef.current) {
      meshRef.current.rotation.z = elapsed * speed + offset;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[TILT_65, 0, 0]} renderOrder={7}>
      <torusGeometry args={[radius, tube, 56, 360]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={diskVertex}
        fragmentShader={diskFragment}
        uniforms={uniforms}
        transparent
        depthTest
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function VolumetricGas({ radius, tube, speed, alpha, offset }) {
  return (
    <AccretionDisk
      radius={radius}
      tube={tube}
      speed={speed}
      alpha={alpha}
      heat={0.35}
      thickness={0.28}
      offset={offset}
    />
  );
}

function LensedUpperDiskImage() {
  const materialRef = useRef(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0.82]} renderOrder={8}>
      <planeGeometry args={[2.3, 2.3, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={lensVertex}
        fragmentShader={lensArcFragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function EventHorizon() {
  return (
    <>
      <mesh position={[0, 0, 0.08]} renderOrder={6}>
        <sphereGeometry args={[0.72, 128, 128]} />
        <meshBasicMaterial color="#000000" toneMapped={false} depthTest depthWrite />
      </mesh>
      <mesh position={[0, 0, 0.18]} renderOrder={10}>
        <torusGeometry args={[0.735, 0.007, 24, 256]} />
        <meshBasicMaterial
          color="#ff4c00"
          transparent
          opacity={0.34}
          toneMapped={false}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh position={[0, 0, 0.19]} renderOrder={10}>
        <torusGeometry args={[0.77, 0.004, 18, 256]} />
        <meshBasicMaterial
          color="#ff124f"
          transparent
          opacity={0.18}
          toneMapped={false}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  );
}

function HorizonSmokeGlow() {
  const materialRef = useRef(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0.2]} renderOrder={9}>
      <planeGeometry args={[2.55, 2.55, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={lensVertex}
        fragmentShader={horizonSmokeFragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function GlowingOrbitParticles() {
  const backPointsRef = useRef(null);
  const frontPointsRef = useRef(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 9800 }, () => ({
        radius: 0.78 + Math.random() * 1.35,
        phase: Math.random() * Math.PI * 2,
        speed: 0.14 + Math.random() * 0.36,
        height: (Math.random() - 0.5) * 0.18,
        lane: Math.random(),
      })),
    [],
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(particles.length * 2 * 3);
    const colors = new Float32Array(particles.length * 2 * 3);
    const palette = [
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff5a00"),
      new THREE.Color("#ff3c00"),
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff124f"),
      new THREE.Color("#ff124f"),
      new THREE.Color("#1f8cff"),
      new THREE.Color("#37d7ff"),
    ];

    particles.forEach((particle, index) => {
      const color = palette[index % palette.length];
      const base = index * 6;
      const x = Math.cos(particle.phase) * particle.radius;
      const y = particle.height;
      const z = Math.sin(particle.phase) * particle.radius * (0.22 + particle.lane * 0.12);
      positions[base] = x;
      positions[base + 1] = y;
      positions[base + 2] = z;
      positions[base + 3] = x;
      positions[base + 4] = y;
      positions[base + 5] = z;
      colors[base] = color.r;
      colors[base + 1] = color.g;
      colors[base + 2] = color.b;
      colors[base + 3] = color.r;
      colors[base + 4] = color.g;
      colors[base + 5] = color.b;
    });

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return {
      back: bufferGeometry,
      front: bufferGeometry.clone(),
    };
  }, [particles]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    const backAttribute = backPointsRef.current?.geometry.getAttribute("position");
    const frontAttribute = frontPointsRef.current?.geometry.getAttribute("position");
    if (!backAttribute || !frontAttribute) return;
    const backPositions = backAttribute.array;
    const frontPositions = frontAttribute.array;

    particles.forEach((particle, index) => {
      const angle = particle.phase + elapsed * particle.speed;
      const wave = Math.sin(elapsed * 0.85 + particle.phase) * 0.035;
      const radius = particle.radius + wave;
      const x = Math.cos(angle) * radius;
      const y = particle.height + Math.sin(angle * 2.0) * 0.035;
      const zScale = 0.22 + particle.lane * 0.12;
      const z = Math.sin(angle) * radius * zScale;
      const trail = 0.26 + particle.speed * 0.48;
      const tx = -Math.sin(angle) * trail;
      const tz = Math.cos(angle) * zScale * trail;
      const isFront = Math.sin(angle) < 0;
      const base = index * 6;

      backPositions[base] = isFront ? 999 : x;
      backPositions[base + 1] = isFront ? 999 : y;
      backPositions[base + 2] = isFront ? 999 : z;
      backPositions[base + 3] = isFront ? 999 : x - tx;
      backPositions[base + 4] = isFront ? 999 : y;
      backPositions[base + 5] = isFront ? 999 : z - tz;

      frontPositions[base] = isFront ? x : 999;
      frontPositions[base + 1] = isFront ? y : 999;
      frontPositions[base + 2] = isFront ? z : 999;
      frontPositions[base + 3] = isFront ? x - tx : 999;
      frontPositions[base + 4] = isFront ? y : 999;
      frontPositions[base + 5] = isFront ? z - tz : 999;
    });

    backAttribute.needsUpdate = true;
    frontAttribute.needsUpdate = true;
  });

  return (
    <>
      <lineSegments ref={backPointsRef} geometry={geometry.back} rotation={[TILT_65, 0, 0]} renderOrder={4}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.15}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <lineSegments ref={frontPointsRef} geometry={geometry.front} rotation={[TILT_65, 0, 0]} renderOrder={11}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.26}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </>
  );
}

function BlueLinearOrbitLines() {
  const linesRef = useRef(null);
  const lines = useMemo(
    () =>
      Array.from({ length: 1800 }, () => ({
        radius: 0.9 + Math.random() * 1.85,
        phase: Math.random() * Math.PI * 2,
        speed: 0.08 + Math.random() * 0.18,
        height: (Math.random() - 0.5) * 0.14,
        lane: Math.random(),
      })),
    [],
  );

  const geometry = useMemo(() => {
    const positions = new Float32Array(lines.length * 2 * 3);
    const colors = new Float32Array(lines.length * 2 * 3);
    const palette = [
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff5a00"),
      new THREE.Color("#ff3c00"),
      new THREE.Color("#ff124f"),
      new THREE.Color("#ff124f"),
      new THREE.Color("#1f8cff"),
      new THREE.Color("#ff124f"),
    ];

    lines.forEach((line, index) => {
      const color = palette[index % palette.length];
      const base = index * 6;
      const x = Math.cos(line.phase) * line.radius;
      const y = line.height;
      const z = Math.sin(line.phase) * line.radius * (0.24 + line.lane * 0.1);
      positions[base] = x;
      positions[base + 1] = y;
      positions[base + 2] = z;
      positions[base + 3] = x;
      positions[base + 4] = y;
      positions[base + 5] = z;
      colors[base] = color.r;
      colors[base + 1] = color.g;
      colors[base + 2] = color.b;
      colors[base + 3] = color.r;
      colors[base + 4] = color.g;
      colors[base + 5] = color.b;
    });

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return bufferGeometry;
  }, [lines]);

  useFrame(({ clock }) => {
    if (!linesRef.current) return;
    const elapsed = clock.getElapsedTime();
    const positionAttribute = linesRef.current.geometry.getAttribute("position");
    if (!positionAttribute) return;
    const positions = positionAttribute.array;

    lines.forEach((line, index) => {
      const angle = line.phase + elapsed * line.speed;
      const radius = line.radius + Math.sin(elapsed * 0.42 + line.phase) * 0.02;
      const zScale = 0.24 + line.lane * 0.1;
      const x = Math.cos(angle) * radius;
      const y = line.height + Math.sin(angle * 2.0) * 0.02;
      const z = Math.sin(angle) * radius * zScale;
      const trail = 0.58 + line.speed * 0.74;
      const tx = -Math.sin(angle) * trail;
      const tz = Math.cos(angle) * zScale * trail;
      const base = index * 6;
      positions[base] = x;
      positions[base + 1] = y;
      positions[base + 2] = z;
      positions[base + 3] = x - tx;
      positions[base + 4] = y;
      positions[base + 5] = z - tz;
    });

    positionAttribute.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef} geometry={geometry} rotation={[TILT_65, 0, 0]} renderOrder={12}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.24}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

function OrbitingDust() {
  const pointsRef = useRef(null);
  const particles = useMemo(
    () =>
      Array.from({ length: 1800 }, () => ({
        radius: 0.8 + Math.random() * 3.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.025 + Math.random() * 0.16,
        height: (Math.random() - 0.5) * 0.42,
        pull: 0.05 + Math.random() * 0.2,
        size: 0.55 + Math.random() * 1.55,
      })),
    [],
  );
  const geometry = useMemo(() => {
    const positions = new Float32Array(particles.length * 3);
    const colors = new Float32Array(particles.length * 3);
    const sizes = new Float32Array(particles.length);
    const palette = [
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff4c00"),
      new THREE.Color("#ff5a00"),
      new THREE.Color("#ff3c00"),
      new THREE.Color("#ff124f"),
      new THREE.Color("#ff124f"),
      new THREE.Color("#1f8cff"),
    ];

    particles.forEach((particle, index) => {
      const color = palette[index % palette.length];
      positions[index * 3] = Math.cos(particle.phase) * particle.radius;
      positions[index * 3 + 1] = particle.height;
      positions[index * 3 + 2] = Math.sin(particle.phase) * particle.radius * 0.28;
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      sizes[index] = particle.size;
    });

    const bufferGeometry = new THREE.BufferGeometry();
    bufferGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    bufferGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    bufferGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    return bufferGeometry;
  }, [particles]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const elapsed = clock.getElapsedTime();
    const positionAttribute = pointsRef.current.geometry.getAttribute("position");
    if (!positionAttribute) return;

    const positions = positionAttribute.array;

    particles.forEach((particle, index) => {
      const inward = 1 - ((Math.sin(elapsed * 0.18 + particle.phase) + 1) * 0.5) * particle.pull;
      const radius = particle.radius * inward;
      const angle = particle.phase + elapsed * particle.speed;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = particle.height + Math.sin(angle * 2.0) * 0.035;
      positions[index * 3 + 2] = Math.sin(angle) * radius * 0.28;
    });

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} rotation={[TILT_65, 0, 0]} renderOrder={3}>
      <pointsMaterial
        size={0.013}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.62}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function OrbitingAsteroids() {
  const groupRef = useRef(null);
  const asteroids = useMemo(
    () =>
      Array.from({ length: 64 }, (_, index) => ({
        radius: 0.92 + Math.random() * 1.95,
        phase: (index / 64) * Math.PI * 2 + Math.random() * 0.5,
        speed: (index % 2 === 0 ? 1 : -1) * (0.035 + Math.random() * 0.095),
        size: 0.01 + Math.random() * 0.032,
        height: (Math.random() - 0.5) * 0.16,
        color: index % 3 === 0 ? "#6d4b32" : index % 3 === 1 ? "#9a6a42" : "#4b3a30",
      })),
    [],
  );
  const asteroidRefs = useRef([]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(elapsed * 0.05) * 0.025;
    }

    asteroids.forEach((asteroid, index) => {
      const mesh = asteroidRefs.current[index];
      if (!mesh) return;

      const angle = asteroid.phase + elapsed * asteroid.speed;
      const wobble = 1 + Math.sin(elapsed * 0.37 + asteroid.phase) * 0.035;
      mesh.position.set(Math.cos(angle) * asteroid.radius * wobble, asteroid.height, Math.sin(angle) * asteroid.radius * 0.28);
      mesh.rotation.set(elapsed * asteroid.speed * 2.1, angle * 0.7, elapsed * asteroid.speed * 3.2);
    });
  });

  return (
    <group ref={groupRef} rotation={[TILT_65, 0, 0]} renderOrder={4}>
      {asteroids.map((asteroid, index) => (
        <mesh
          key={`${asteroid.radius}-${index}`}
          ref={(element) => {
            asteroidRefs.current[index] = element;
          }}
        >
          <dodecahedronGeometry args={[asteroid.size, 0]} />
          <meshStandardMaterial
            color={asteroid.color}
            emissive="#3a210f"
            emissiveIntensity={0.22}
            roughness={0.92}
            metalness={0.04}
          />
        </mesh>
      ))}
    </group>
  );
}

function GargantuaScene() {
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const elapsed = clock.getElapsedTime();
    groupRef.current.rotation.y = Math.sin(elapsed * 0.08) * 0.08;
    groupRef.current.rotation.x = Math.sin(elapsed * 0.055) * 0.025;
  });

  return (
    <>
      <StarfieldBackdrop />
      <group ref={groupRef} position={[0, 0, 0]}>
        <AccretionDisk radius={1.72} tube={0.032} speed={0.1} alpha={0.14} heat={0.5} thickness={0.025} />
        <AccretionDisk radius={1.12} tube={0.024} speed={0.2} alpha={0.18} heat={0.72} thickness={0.018} offset={2.1} />
        <OrbitingDust />
        <OrbitingAsteroids />
        <HorizonSmokeGlow />
        <EventHorizon />
        <LensedUpperDiskImage />
        <GlowingOrbitParticles />
        <BlueLinearOrbitLines />
      </group>
    </>
  );
}

export default function BlackHoleEngine() {
  return (
    <div className="black-hole-engine" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.12, 5.2], fov: 42 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          scene.background = null;
          gl.setClearColor(0x000000, 0);
          gl.setClearAlpha(0);
        }}
        style={{ background: "transparent" }}
      >
        <GargantuaScene />
      </Canvas>
    </div>
  );
}
