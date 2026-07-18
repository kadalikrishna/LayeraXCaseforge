"use client";

import { Bounds, OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { createCaseSolid } from "@/lib/geometry";
import { toBufferGeometry } from "@/lib/jscad-to-three";
import type { CaseConfiguration, DevicePreset } from "@/lib/types";

type CasePreviewProps = { configuration: CaseConfiguration; device: DevicePreset; autoRotate?: boolean };

export function CasePreview({ configuration, device, autoRotate = false }: CasePreviewProps) {
  return (
    <Canvas dpr={[1, 1.7]} gl={{ alpha: true, antialias: true }}>
      <PerspectiveCamera makeDefault position={[118, -188, -150]} fov={32} />
      <hemisphereLight args={["#ffffff", "#ded8ce", 2.2]} />
      <directionalLight intensity={2.1} position={[110, -120, 170]} />
      <directionalLight color="#fff4e8" intensity={1.15} position={[-90, 95, 80]} />
      <Bounds fit clip observe margin={1.45}>
        <CaseMesh configuration={configuration} device={device} />
        {configuration.showPhone && <PhoneReference configuration={configuration} device={device} />}
      </Bounds>
      <OrbitControls
        makeDefault
        enableDamping
        enablePan={false}
        minDistance={105}
        maxDistance={360}
        autoRotate={autoRotate}
        autoRotateSpeed={2.2}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
      />
    </Canvas>
  );
}

function CaseMesh({ configuration, device }: CasePreviewProps) {
  const geometry = useMemo(() => toBufferGeometry(createCaseSolid(device, configuration)), [configuration, device]);
  const material = configuration.finish === "gloss" ? { roughness: 0.16, metalness: 0.08 } : configuration.finish === "matte" ? { roughness: 0.86, metalness: 0.01 } : { roughness: 0.48, metalness: 0.04 };
  return <mesh geometry={geometry}><meshStandardMaterial color={configuration.color} side={THREE.DoubleSide} {...material} /></mesh>;
}

function PhoneReference({ configuration, device }: CasePreviewProps) {
  return <group position={[0, 0, 2]}><mesh><boxGeometry args={[device.width, device.height, device.thickness]} /><meshStandardMaterial color="#9aa6aa" transparent opacity={configuration.phoneOpacity} roughness={0.35} /></mesh><mesh position={[device.camera.x, device.camera.y, -device.thickness / 2 - 1]}><boxGeometry args={[device.camera.width, device.camera.height, 2]} /><meshStandardMaterial color="#14191b" transparent opacity={Math.min(1, configuration.phoneOpacity + 0.2)} /></mesh></group>;
}
