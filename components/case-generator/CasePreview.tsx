"use client";

import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import type { CaseParameters } from "@/lib/case-params";
import { createPhoneCaseGeometry } from "@/lib/case-geometry";
import { jscadGeomToBufferGeometry } from "@/lib/jscad-to-three";

type CasePreviewProps = {
  params: CaseParameters;
};

export function CasePreview({ params }: CasePreviewProps) {
  return (
    <Canvas shadows dpr={[1, 2]}>
      <PerspectiveCamera makeDefault position={[0, -230, 190]} fov={36} />
      <color attach="background" args={["#eef1f4"]} />
      <ambientLight intensity={1.2} />
      <directionalLight castShadow intensity={2.4} position={[120, -160, 220]} />
      <directionalLight intensity={0.8} position={[-120, 140, 120]} />
      <CaseMesh params={params} />
      <GridHelper />
      <OrbitControls enableDamping minDistance={130} maxDistance={420} />
    </Canvas>
  );
}

function CaseMesh({ params }: CasePreviewProps) {
  const geometry = useMemo(() => {
    const solid = createPhoneCaseGeometry(params);
    const bufferGeometry = jscadGeomToBufferGeometry(solid);
    bufferGeometry.rotateX(Math.PI / 2);
    bufferGeometry.center();
    return bufferGeometry;
  }, [params]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#25313d"
        metalness={0.08}
        roughness={0.58}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GridHelper() {
  return (
    <gridHelper
      args={[220, 22, "#cbd5e1", "#e2e8f0"]}
      position={[0, -70, -25]}
      rotation={[Math.PI / 2, 0, 0]}
    />
  );
}
