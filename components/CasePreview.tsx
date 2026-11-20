"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { geometryKey, GeometryQueue, type GeometryResponse } from "@/lib/geometry-protocol";
import { getCaseMetrics } from "@/lib/case-metrics";
import type { CameraRegion, CaseConfiguration, DevicePreset } from "@/lib/types";
import styles from "./caseforge.module.css";

export type CameraView = "perspective" | "front" | "back" | "side";
type Props = { configuration: CaseConfiguration; device: DevicePreset; autoRotate?: boolean; view: CameraView; viewRevision: number };
type MeshState = { shell: THREE.BufferGeometry; phone: THREE.BufferGeometry; elapsedMs: number };
function fromPositions(positions: Float32Array) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals(); geometry.computeBoundingSphere();
  return geometry;
}

export function CasePreview(props: Props) {
  const [mesh, setMesh] = useState<MeshState | null>(null);
  const [status, setStatus] = useState("Building your case…");
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [fps, setFps] = useState(0);
  const queue = useRef<GeometryQueue | null>(null);
  const key = geometryKey(props.device, props.configuration);
  const current = useRef(props);
  useEffect(() => { current.current = props; }, [props]);
  useEffect(() => {
    let worker: Worker;
    try { worker = new Worker(new URL("../lib/geometry.worker.ts", import.meta.url)); }
    catch { setTimeout(() => { setFailed(true); setStatus("The geometry worker could not start. Retry to rebuild your preview."); }, 0); return; }
    const work = new GeometryQueue((request) => worker.postMessage(request), (result) => {
      if (result.error || !result.positions || !result.phone) { setFailed(true); setStatus(result.error ?? "Preview generation failed."); return; }
      setMesh({ shell: fromPositions(result.positions), phone: fromPositions(result.phone), elapsedMs: result.elapsedMs ?? 0 });
      setStatus(""); setFailed(false);
    });
    queue.current = work;
    worker.onmessage = (event: MessageEvent<GeometryResponse>) => work.receive(event.data);
    worker.onerror = () => { setFailed(true); setStatus("The preview worker stopped. Your design is safe; retry to continue."); };
    return () => { queue.current = null; worker.terminate(); };
  }, [retry]);
  useEffect(() => {
    queue.current?.invalidate();
    const timer = window.setTimeout(() => {
      setStatus("Updating geometry…"); setFailed(false);
      queue.current?.request(current.current.device, current.current.configuration);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [key, retry]);
  useEffect(() => () => { mesh?.shell.dispose(); mesh?.phone.dispose(); }, [mesh]);
  const sample = useCallback((value: number) => setFps(value), []);
  return <div className={styles.previewRoot} data-render-fps={fps.toFixed(1)} data-geometry-ms={mesh?.elapsedMs.toFixed(1) ?? ""} aria-busy={!!status && !failed}>
    <PreviewBoundary key={retry} onRetry={() => setRetry((value) => value + 1)}>
      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }} fallback={<div className={styles.previewLoading}>This preview needs WebGL. Try Chrome or Edge with graphics acceleration enabled.</div>}>
        <PerspectiveCamera makeDefault position={[75, -55, -270]} fov={32} near={0.1} far={3000} />
        <hemisphereLight args={["#ffffff", "#77716a", 2.2]} />
        <directionalLight intensity={3} position={[-80, 150, -180]} />
        <directionalLight intensity={1.5} color="#dceaff" position={[140, -30, -50]} />
        <directionalLight intensity={1.1} position={[0, 30, 200]} />
        {mesh && <mesh geometry={mesh.shell}><meshStandardMaterial color={props.configuration.color} roughness={props.configuration.finish === "gloss" ? 0.2 : props.configuration.finish === "matte" ? 0.85 : 0.48} metalness={0.06} side={THREE.DoubleSide} /></mesh>}
        {mesh && props.configuration.showPhone && <PhoneReference geometry={mesh.phone} device={props.device} configuration={props.configuration} />}
        <OrbitControls makeDefault enableDamping enablePan={false} minDistance={35} maxDistance={1100} autoRotate={props.autoRotate} autoRotateSpeed={1.4} />
        <CameraRig device={props.device} view={props.view} revision={props.viewRevision} />
        <FrameMeter onSample={sample} />
      </Canvas>
    </PreviewBoundary>
    {status && <div className={`${styles.meshStatus} ${failed ? styles.meshError : ""}`} role={failed ? "alert" : "status"}>{!failed && <span className={styles.spinner} />}{status}{failed && <button onClick={() => setRetry((value) => value + 1)} type="button">Retry preview</button>}</div>}
  </div>;
}

class PreviewBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className={styles.previewLoading} role="alert"><p>The 3D view could not render. Your design can still be saved.</p><button onClick={this.props.onRetry} type="button">Retry preview</button></div> : this.props.children; }
}

function CameraRig({ device, view, revision }: { device: DevicePreset; view: CameraView; revision: number }) {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const controls = useThree((state) => state.controls) as OrbitControlsImpl | null;
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect = size.width / Math.max(1, size.height);
    const halfHeight = (device.height + 12) / 2;
    const halfWidth = (device.width + 12) / 2;
    const distance = Math.max(halfHeight / Math.tan(camera.fov * Math.PI / 360), halfWidth / (Math.tan(camera.fov * Math.PI / 360) * aspect)) * 1.4;
    const direction = view === "front" ? new THREE.Vector3(0, 0, 1) : view === "back" ? new THREE.Vector3(0, 0, -1) : view === "side" ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0.33, -0.18, -1).normalize();
    camera.position.copy(direction.multiplyScalar(distance)); camera.up.set(0, 1, 0); camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    controls?.target.set(0, 0, 0); controls?.update();
  }, [camera, controls, device, size.width, size.height, view, revision]);
  return null;
}

function FrameMeter({ onSample }: { onSample: (fps: number) => void }) {
  const frames = useRef(0); const elapsed = useRef(0);
  useFrame((_state, delta) => { frames.current++; elapsed.current += delta; if (elapsed.current >= 2) { onSample(frames.current / elapsed.current); frames.current = 0; elapsed.current = 0; } });
  return null;
}

function RoundedFace({ width, height, radius, depth, color, position }: { width: number; height: number; radius: number; depth: number; color: string; position: [number, number, number] }) {
  const geometry = useMemo(() => {
    const x = -width / 2, y = -height / 2, r = Math.min(radius, width / 2 - 0.01, height / 2 - 0.01);
    const shape = new THREE.Shape();
    shape.moveTo(x + r, y); shape.lineTo(x + width - r, y); shape.quadraticCurveTo(x + width, y, x + width, y + r);
    shape.lineTo(x + width, y + height - r); shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    shape.lineTo(x + r, y + height); shape.quadraticCurveTo(x, y + height, x, y + height - r);
    shape.lineTo(x, y + r); shape.quadraticCurveTo(x, y, x + r, y);
    return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
  }, [width, height, radius, depth]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} position={position}><meshStandardMaterial color={color} roughness={0.36} metalness={0.15} /></mesh>;
}

function PhoneReference({ geometry, device, configuration }: { geometry: THREE.BufferGeometry; device: DevicePreset; configuration: CaseConfiguration }) {
  const metrics = getCaseMetrics(device, configuration);
  const back = configuration.style === "protective" ? 1.9 : 1.4;
  const centerZ = -metrics.outerDepth / 2 + back + 0.25 + device.thickness / 2;
  const rearZ = centerZ - device.thickness / 2;
  const regions: CameraRegion[] = device.profile?.openings ?? [{ ...device.camera, role: "island", shape: "rounded-rect" }];
  return <group>
    <mesh geometry={geometry} position={[0, 0, centerZ]}><meshStandardMaterial color="#30343b" roughness={0.3} metalness={0.4} /></mesh>
    <RoundedFace width={device.width - 3} height={device.height - 3} radius={device.cornerRadius - 1} depth={0.15} color="#11151e" position={[0, 0, centerZ + device.thickness / 2]} />
    <RoundedFace width={device.companyId === "apple" ? 21 : 3.2} height={device.companyId === "apple" ? 5.5 : 3.2} radius={2.7} depth={0.1} color="#030405" position={[0, device.height / 2 - 7, centerZ + device.thickness / 2 + 0.18]} />
    {regions.filter((region) => region.role === "island").map((region, index) => <RoundedFace key={index} width={region.width} height={region.height} radius={region.radius} depth={device.profile?.cameraHeight ?? 2.4} color="#343a42" position={[region.x, region.y, rearZ - (device.profile?.cameraHeight ?? 2.4)]} />)}
    {(device.profile?.lenses ?? []).map((region, index) => <group key={index} position={[region.x, region.y, rearZ - (device.profile?.cameraHeight ?? 2.4) - 0.15]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh><cylinderGeometry args={[region.radius, region.radius, 0.7, 40]} /><meshStandardMaterial color={region.role === "flash" ? "#eee5c9" : "#0c111a"} roughness={0.18} metalness={0.45} /></mesh>
      {region.role === "lens" && <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[region.radius * 0.55, region.radius * 0.55, 0.1, 32]} /><meshStandardMaterial color="#203a56" roughness={0.12} metalness={0.6} /></mesh>}
    </group>)}
  </group>;
}


