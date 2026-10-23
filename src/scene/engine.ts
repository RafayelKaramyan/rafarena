import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  evaluateFrame,
  getMoment,
  players,
  type ViewState,
  type CameraMode,
  type Point,
} from '../domain/match';

const HOME = 0xb8efd3;
const AWAY = 0xf79579;
const poses: Record<
  CameraMode,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  broadcast: { position: [112, 115, 142], target: [0, 0, 0] },
  tactical: { position: [0, 195, 0.1], target: [0, 0, 0] },
  touchline: { position: [22, 29, 112], target: [9, 0, 0] },
  orbit: { position: [128, 90, 118], target: [0, 0, 0] },
};

export class StadiumEngine {
  private scene = new T.Scene();
  private camera = new T.PerspectiveCamera(37, 1, 0.1, 650);
  private renderer: T.WebGLRenderer;
  private controls: OrbitControls;
  private resize: ResizeObserver;
  private view: ViewState;
  private disposed = false;
  private raf = 0;
  private dirty = false;
  private cameraMoving = false;
  private targetPosition = new T.Vector3();
  private targetLook = new T.Vector3();
  private previousCamera = '';
  private avatars = new Map<string, T.Group>();
  private selectables: T.Object3D[] = [];
  private paths = new T.Group();
  private passing = new T.Group();
  private zones = new T.Group();
  private ring = new T.Mesh(
    new T.RingGeometry(1.5, 1.85, 40),
    new T.MeshBasicMaterial({
      color: 0xf5f0d9,
      side: T.DoubleSide,
      transparent: true,
      opacity: 0.95,
    }),
  );
  private ball = new T.Group();
  private ballHalo: T.Mesh;
  private raycaster = new T.Raycaster();
  private pointer = new T.Vector2();
  private pointerStart = { x: 0, y: 0 };
  private currentTime = 3600;
  private reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private onSelect: (id: string) => void;
  private onLost: () => void;
  private shadowLight = new T.DirectionalLight(0xf7f3db, 3.2);

  constructor(
    private host: HTMLElement,
    view: ViewState,
    onSelect: (id: string) => void,
    onLost: () => void,
  ) {
    this.view = view;
    this.onSelect = onSelect;
    this.onLost = onLost;
    this.renderer = new T.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, host.clientWidth < 600 ? 1.25 : 1.75),
    );
    this.renderer.setClearColor(0x0a1517, 0);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.28;
    this.renderer.shadowMap.enabled = host.clientWidth > 700;
    this.renderer.shadowMap.type = T.PCFSoftShadowMap;
    const canvas = this.renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    canvas.addEventListener('webglcontextlost', this.contextLost);
    canvas.addEventListener('pointerdown', this.pointerDown);
    canvas.addEventListener('pointerup', this.pointerUp);
    canvas.addEventListener('pointermove', this.pointerMove);
    host.appendChild(canvas);
    this.scene.fog = new T.FogExp2(0x0a1517, 0.0025);
    this.scene.add(new T.HemisphereLight(0xe8fff3, 0x183738, 3.4));
    this.shadowLight.position.set(-20, 90, 40);
    this.shadowLight.castShadow = true;
    this.shadowLight.shadow.mapSize.set(1024, 1024);
    this.shadowLight.shadow.camera.left = -90;
    this.shadowLight.shadow.camera.right = 90;
    this.shadowLight.shadow.camera.top = 75;
    this.shadowLight.shadow.camera.bottom = -75;
    this.shadowLight.shadow.camera.far = 200;
    this.shadowLight.shadow.bias = -0.001;
    this.scene.add(this.shadowLight);
    const rim = new T.DirectionalLight(0x5ab7b3, 2.7);
    rim.position.set(30, 20, -70);
    this.scene.add(rim);
    this.buildStadium();
    this.buildPlayers();
    this.buildBall();
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.22;
    this.scene.add(this.ring);
    this.scene.add(this.paths, this.passing, this.zones);
    this.ballHalo = new T.Mesh(
      new T.RingGeometry(0.85, 1.12, 32),
      new T.MeshBasicMaterial({
        color: 0xffffff,
        side: T.DoubleSide,
        transparent: true,
        opacity: 0.6,
      }),
    );
    this.ballHalo.rotation.x = -Math.PI / 2;
    this.scene.add(this.ballHalo);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.09;
    this.controls.enablePan = false;
    this.controls.enableZoom = true;
    this.controls.minDistance = 65;
    this.controls.maxDistance = 300;
    this.controls.minPolarAngle = 0.01;
    this.controls.maxPolarAngle = Math.PI / 2.1;
    this.controls.addEventListener('change', this.requestRender);
    this.controls.addEventListener('start', this.orbitStart);
    this.resize = new ResizeObserver(this.onResize);
    this.resize.observe(host);
    document.addEventListener('visibilitychange', this.visibility);
    this.setView(view, true);
    this.onResize();
  }
  private material(color: number, roughness = 0.75) {
    return new T.MeshStandardMaterial({ color, roughness, metalness: 0.1 });
  }
  private mesh(
    geometry: T.BufferGeometry,
    material: T.Material,
    x: number,
    y: number,
    z: number,
    parent: T.Object3D = this.scene,
  ) {
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }
  private pitchLine(
    points: Point[],
    color = 0xc5e8d8,
    opacity = 0.55,
    y = 0.15,
    parent: T.Object3D = this.scene,
  ) {
    const geometry = new T.BufferGeometry().setFromPoints(
      points.map((p) => new T.Vector3(p.x, y, p.z)),
    );
    const line = new T.Line(
      geometry,
      new T.LineBasicMaterial({ color, transparent: true, opacity }),
    );
    parent.add(line);
    return line;
  }
  private rectangle(x1: number, z1: number, x2: number, z2: number) {
    this.pitchLine([
      { x: x1, z: z1 },
      { x: x2, z: z1 },
      { x: x2, z: z2 },
      { x: x1, z: z2 },
      { x: x1, z: z1 },
    ]);
  }
  private buildStadium() {
    const base = this.mesh(
      new T.CylinderGeometry(89, 91, 3, 100),
      this.material(0x172f31),
      0,
      -2.6,
      0,
    );
    base.scale.z = 0.73;
    base.receiveShadow = true;
    this.mesh(new T.BoxGeometry(116, 1.2, 78), this.material(0x1b4b40), 0, -0.8, 0).receiveShadow =
      true;
    const stripeA = this.material(0x24674e),
      stripeB = this.material(0x1f5c47);
    for (let i = 0; i < 14; i++)
      this.mesh(
        new T.BoxGeometry(7.5, 0.1, 68),
        i % 2 ? stripeA : stripeB,
        -48.75 + i * 7.5,
        -0.1,
        0,
      ).receiveShadow = true;
    this.rectangle(-52.5, -34, 52.5, 34);
    this.pitchLine([
      { x: 0, z: -34 },
      { x: 0, z: 34 },
    ]);
    this.mesh(
      new T.RingGeometry(9.05, 9.2, 80),
      new T.MeshBasicMaterial({
        color: 0xb9dac7,
        side: T.DoubleSide,
        transparent: true,
        opacity: 0.6,
      }),
      0,
      0.14,
      0,
    ).rotation.x = -Math.PI / 2;
    this.mesh(
      new T.CircleGeometry(0.28, 16),
      new T.MeshBasicMaterial({ color: 0xc5e8d8 }),
      0,
      0.15,
      0,
    ).rotation.x = -Math.PI / 2;
    for (const sign of [-1, 1]) {
      this.rectangle(sign * 52.5, -20.16, sign * 36, 20.16);
      this.rectangle(sign * 52.5, -9.16, sign * 47, 9.16);
      const arc: Point[] = [];
      for (let i = 0; i <= 32; i++) {
        const a = -1 + i / 16;
        arc.push({ x: sign * (41.5 - Math.cos(a) * 9.15), z: Math.sin(a) * 9.15 });
      }
      this.pitchLine(arc);
      const white = this.material(0xd9e8dc);
      for (const z of [-3.66, 3.66])
        this.mesh(new T.CylinderGeometry(0.13, 0.13, 2.44, 8), white, sign * 52.5, 1.22, z);
      const bar = this.mesh(
        new T.CylinderGeometry(0.13, 0.13, 7.32, 8),
        white,
        sign * 52.5,
        2.44,
        0,
      );
      bar.rotation.x = Math.PI / 2;
      const net = this.mesh(
        new T.BoxGeometry(2.1, 2.4, 7.3, 3, 5, 13),
        new T.MeshBasicMaterial({
          color: 0x91b8a9,
          wireframe: true,
          transparent: true,
          opacity: 0.22,
        }),
        sign * 53.5,
        1.2,
        0,
      );
      net.renderOrder = 1;
      this.mesh(new T.BoxGeometry(102, 1.1, 0.35), this.material(0x98d6bc), 0, 0.5, sign * 36);
    }
    const shape = new T.Shape();
    shape.absellipse(0, 0, 87, 64, 0, Math.PI * 2, false, 0);
    const hole = new T.Path();
    hole.absellipse(0, 0, 72, 51, 0, Math.PI * 2, true, 0);
    shape.holes.push(hole);
    const stands = this.mesh(
      new T.ExtrudeGeometry(shape, { depth: 3.2, bevelEnabled: false, curveSegments: 96 }),
      this.material(0x183536),
      0,
      0.3,
      0,
    );
    stands.rotation.x = -Math.PI / 2;
    const seats = new T.InstancedMesh(
      new T.BoxGeometry(1.1, 0.7, 0.85),
      this.material(0x2e5553),
      8 * 180,
    );
    const seat = new T.Object3D();
    const colors = [new T.Color(0x315b59), new T.Color(0x214747), new T.Color(0x4c7167)];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 180; col++) {
        const angle = (col / 180) * Math.PI * 2;
        seat.position.set(
          Math.cos(angle) * (73 + row * 1.6),
          1.3 + row * 0.85,
          Math.sin(angle) * (52 + row * 1.5),
        );
        seat.rotation.y = -angle + Math.PI / 2;
        seat.updateMatrix();
        const index = row * 180 + col;
        seats.setMatrixAt(index, seat.matrix);
        seats.setColorAt(index, colors[(col * 7 + row * 3) % 3]!);
      }
    }
    this.scene.add(seats);
    const railPoints = Array.from(
      { length: 181 },
      (_, i) =>
        new T.Vector3(
          Math.cos((i / 180) * Math.PI * 2) * 86,
          8.2,
          Math.sin((i / 180) * Math.PI * 2) * 64,
        ),
    );
    this.mesh(
      new T.TubeGeometry(new T.CatmullRomCurve3(railPoints), 180, 0.22, 5, true),
      new T.MeshBasicMaterial({ color: 0x89b7a8 }),
      0,
      0,
      0,
    );
    for (const x of [-58, 58])
      for (const z of [-43, 43]) {
        this.mesh(new T.CylinderGeometry(0.22, 0.38, 24, 8), this.material(0x395553), x, 12, z);
        const lights = this.mesh(
          new T.BoxGeometry(6.5, 1.2, 1),
          new T.MeshBasicMaterial({ color: 0xd6ffe8 }),
          x,
          24,
          z,
        );
        lights.rotation.y = x * z > 0 ? -0.4 : 0.4;
        this.mesh(new T.BoxGeometry(7.5, 1.7, 1.4), this.material(0x102c2e), x, 24, z - 0.35);
      }
  }
  private numberTexture(number: number, team: 'home' | 'away') {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;
    ctx.beginPath();
    ctx.arc(48, 48, 43, 0, Math.PI * 2);
    ctx.fillStyle = team === 'home' ? '#b8efd3' : '#f79579';
    ctx.fill();
    ctx.fillStyle = '#0a211e';
    ctx.font = 'bold 62px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 48, 49);
    return new T.CanvasTexture(canvas);
  }
  private buildPlayers() {
    const body = new T.CylinderGeometry(0.74, 0.57, 1.3, 10);
    const head = new T.SphereGeometry(0.47, 10, 8);
    const foot = new T.CylinderGeometry(0.58, 0.68, 0.65, 10);
    const homeMaterial = this.material(HOME),
      awayMaterial = this.material(AWAY);
    const shorts = this.material(0x102e2b),
      skin = this.material(0xe5c7a4);
    for (const player of players) {
      const group = new T.Group();
      group.userData.playerId = player.id;
      const jersey = this.mesh(
        body,
        player.team === 'home' ? homeMaterial : awayMaterial,
        0,
        1.48,
        0,
        group,
      );
      jersey.castShadow = true;
      jersey.userData.playerId = player.id;
      this.mesh(head, skin, 0, 2.42, 0, group).castShadow = true;
      this.mesh(foot, shorts, 0, 0.53, 0, group);
      const disc = this.mesh(
        new T.CircleGeometry(1.2, 24),
        new T.MeshBasicMaterial({
          color: player.team === 'home' ? HOME : AWAY,
          transparent: true,
          opacity: 0.22,
        }),
        0,
        0.08,
        0,
        group,
      );
      disc.rotation.x = -Math.PI / 2;
      const sprite = new T.Sprite(
        new T.SpriteMaterial({
          map: this.numberTexture(player.number, player.team),
          depthTest: false,
        }),
      );
      sprite.position.y = 4.15;
      sprite.scale.set(2.7, 2.7, 1);
      group.add(sprite);
      this.avatars.set(player.id, group);
      this.selectables.push(jersey);
      this.scene.add(group);
    }
  }
  private buildBall() {
    const sphere = this.mesh(
      new T.SphereGeometry(0.57, 16, 12),
      this.material(0xfff9df, 0.35),
      0,
      0,
      0,
      this.ball,
    );
    sphere.castShadow = true;
    const patch = new T.Mesh(
      new T.IcosahedronGeometry(0.575, 0),
      new T.MeshBasicMaterial({ color: 0x172e2c, wireframe: true }),
    );
    this.ball.add(patch);
    this.scene.add(this.ball);
  }
  private clearGroup(group: T.Group) {
    for (const child of [...group.children]) {
      const mesh = child as T.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
      else mesh.material?.dispose();
      group.remove(child);
    }
  }
  private buildOverlays() {
    this.clearGroup(this.paths);
    this.clearGroup(this.passing);
    this.clearGroup(this.zones);
    const moment = getMoment(this.view.momentId);
    const route = moment.ball.map((p) => new T.Vector3(p.x, 0.35, p.z));
    const curve = new T.CurvePath<T.Vector3>();
    for (let index = 1; index < route.length; index++) {
      curve.add(new T.LineCurve3(route[index - 1]!, route[index]!));
    }
    this.mesh(
      new T.TubeGeometry(curve, 70, 0.13, 5, false),
      new T.MeshBasicMaterial({ color: 0xe1e9a9, transparent: true, opacity: 0.72 }),
      0,
      0,
      0,
      this.passing,
    );
    moment.ball.slice(0, -1).forEach((p) => {
      const node = this.mesh(
        new T.RingGeometry(0.55, 0.9, 20),
        new T.MeshBasicMaterial({ color: 0xe6e8ad, side: T.DoubleSide }),
        p.x,
        0.2,
        p.z,
        this.passing,
      );
      node.rotation.x = -Math.PI / 2;
    });
    Object.entries(moment.runs).forEach(([id, run]) =>
      this.pitchLine(run, id.startsWith('h') ? HOME : AWAY, 0.55, 0.2, this.paths),
    );
    for (let i = 0; i < 3; i++) {
      const zone = this.mesh(
        new T.PlaneGeometry(17.5, 66),
        new T.MeshBasicMaterial({
          color: i === 1 ? 0xcfe5a0 : 0xb4e4c5,
          transparent: true,
          opacity: 0.075,
          depthWrite: false,
          side: T.DoubleSide,
        }),
        8.75 + i * 17.5,
        0.18,
        0,
        this.zones,
      );
      zone.rotation.x = -Math.PI / 2;
    }
  }
  setView(view: ViewState, immediate = false) {
    const momentChanged = this.view.momentId !== view.momentId || !this.passing.children.length;
    this.view = view;
    if (momentChanged) this.buildOverlays();
    this.paths.visible = view.layers.trails;
    this.passing.visible = view.layers.passing;
    this.zones.visible = view.layers.zones;
    const cameraKey =
      view.camera + (view.camera === 'orbit' && view.orbit ? JSON.stringify(view.orbit) : '');
    if (cameraKey !== this.previousCamera) {
      this.previousCamera = cameraKey;
      const pose = view.camera === 'orbit' && view.orbit ? view.orbit : poses[view.camera];
      this.targetPosition.fromArray(pose.position);
      this.targetLook.fromArray(pose.target);
      this.controls.enabled = view.camera === 'orbit';
      this.cameraMoving = true;
      if (immediate || this.reduced) {
        this.camera.position.copy(this.targetPosition);
        this.controls.target.copy(this.targetLook);
        this.cameraMoving = false;
        this.camera.lookAt(this.targetLook);
      }
    }
    this.setTime(view.timeMs);
    this.requestRender();
  }
  setTime(timeMs: number) {
    this.currentTime = timeMs;
    const frame = evaluateFrame(getMoment(this.view.momentId), timeMs);
    frame.positions.forEach((player) => {
      const group = this.avatars.get(player.id)!;
      group.position.set(player.x, 0, player.z);
      group.scale.setScalar(this.view.playerId && player.id === this.view.playerId ? 1.12 : 1);
      group.rotation.y = Math.atan2(frame.ball.x - player.x, frame.ball.z - player.z);
    });
    this.ball.position.set(frame.ball.x, frame.ball.y + 0.15, frame.ball.z);
    this.ball.rotation.set(timeMs * 0.002, timeMs * 0.0013, timeMs * 0.001);
    this.ballHalo.position.set(frame.ball.x, 0.21, frame.ball.z);
    const selected = frame.positions.find((p) => p.id === this.view.playerId);
    this.ring.visible = !!selected;
    if (selected) this.ring.position.set(selected.x, 0.22, selected.z);
    this.requestRender();
  }
  private requestRender = () => {
    if (this.disposed || document.hidden || this.dirty) return;
    this.dirty = true;
    this.raf = requestAnimationFrame(this.render);
  };
  private render = () => {
    this.dirty = false;
    if (this.disposed) return;
    if (this.cameraMoving) {
      this.camera.position.lerp(this.targetPosition, 0.11);
      this.controls.target.lerp(this.targetLook, 0.11);
      this.camera.lookAt(this.controls.target);
      this.cameraMoving = this.camera.position.distanceTo(this.targetPosition) > 0.08;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    if (this.cameraMoving) this.requestRender();
  };
  private onResize = () => {
    const width = this.host.clientWidth,
      height = this.host.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.zoom = Math.min(1, this.camera.aspect / 1.3);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.requestRender();
  };
  private pointerDown = (event: PointerEvent) => {
    this.pointerStart = { x: event.clientX, y: event.clientY };
  };
  private hit(event: PointerEvent) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(this.pointer, this.camera);
    return this.raycaster.intersectObjects(this.selectables)[0]?.object.userData.playerId as
      | string
      | undefined;
  }
  private pointerUp = (event: PointerEvent) => {
    if (Math.hypot(event.clientX - this.pointerStart.x, event.clientY - this.pointerStart.y) > 6)
      return;
    const id = this.hit(event);
    if (id) this.onSelect(id);
  };
  private pointerMove = (event: PointerEvent) => {
    this.renderer.domElement.style.cursor = this.hit(event)
      ? 'pointer'
      : this.view.camera === 'orbit'
        ? 'grab'
        : 'default';
  };
  private orbitStart = () => {
    this.cameraMoving = false;
  };
  private visibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.dirty = false;
    } else {
      this.setTime(this.currentTime);
    }
  };
  private contextLost = (event: Event) => {
    event.preventDefault();
    this.onLost();
  };
  getPose(): ViewState['orbit'] {
    return {
      position: this.camera.position.toArray().map((value) => Math.round(value * 100) / 100) as [
        number,
        number,
        number,
      ],
      target: this.controls.target.toArray().map((value) => Math.round(value * 100) / 100) as [
        number,
        number,
        number,
      ],
    };
  }
  async png(): Promise<Blob> {
    this.renderer.render(this.scene, this.camera);
    return new Promise((resolve, reject) =>
      this.renderer.domElement.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error('The current frame could not be exported.')),
        'image/png',
      ),
    );
  }
  destroy() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.resize.disconnect();
    this.controls.dispose();
    document.removeEventListener('visibilitychange', this.visibility);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('webglcontextlost', this.contextLost);
    canvas.removeEventListener('pointerdown', this.pointerDown);
    canvas.removeEventListener('pointerup', this.pointerUp);
    canvas.removeEventListener('pointermove', this.pointerMove);
    const geometries = new Set<T.BufferGeometry>(),
      materials = new Set<T.Material>(),
      textures = new Set<T.Texture>();
    this.scene.traverse((object) => {
      const mesh = object as T.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      if (mesh.material)
        (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => {
          materials.add(material);
          const textured = material as T.MeshStandardMaterial;
          if (textured.map) textures.add(textured.map);
        });
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
    this.shadowLight.shadow.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    canvas.remove();
  }
}
