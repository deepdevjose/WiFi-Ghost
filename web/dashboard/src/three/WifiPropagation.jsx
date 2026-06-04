import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const TX_POSITION = new THREE.Vector3(2.05, 0.22, -1.55);
const RX_POSITION = new THREE.Vector3(-2.05, 0.22, 1.55);
const REFLECTION_A = new THREE.Vector3(1.8, 0.24, 1.85);
const REFLECTION_B = new THREE.Vector3(-2.05, 0.24, -1.75);

export default function WifiPropagation({ motion, score, txOnline, rssi, txRate, obstaclePosition }) {
  const ringsRef = useRef([]);
  const directRef = useRef(null);
  const disturbanceRef = useRef(null);
  const opacityBase = txOnline ? 0.34 : 0.12;
  const signalStrength = useMemo(() => {
    if (typeof rssi !== "number") return 0.5;
    return THREE.MathUtils.clamp((rssi + 90) / 55, 0.15, 1);
  }, [rssi]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;

    ringsRef.current.forEach((ring, index) => {
      if (!ring) return;
      const phase = (time * 0.42 + index * 0.2) % 1;
      const scale = 0.55 + phase * 5.25;
      ring.scale.set(scale, scale, scale);
      ring.material.opacity = (1 - phase) * opacityBase * signalStrength;
    });

    if (directRef.current) {
      directRef.current.material.opacity = txOnline ? 0.42 + Math.sin(time * 3) * 0.08 : 0.12;
    }

    if (disturbanceRef.current) {
      disturbanceRef.current.rotation.y += 0.012;
      disturbanceRef.current.material.opacity = 0.16 + score * 0.34 + Math.sin(time * 5) * 0.04;
    }
  });

  const beamColor = motion ? "#d75a4a" : "#0f8aa6";
  const waveColor = txOnline ? "#d69e2e" : "#9aa3aa";

  return (
    <group>
      <group position={TX_POSITION.toArray()}>
        {[0, 1, 2, 3, 4].map((ring) => (
          <mesh
            key={ring}
            ref={(node) => {
              ringsRef.current[ring] = node;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.03 + ring * 0.002, 0]}
          >
            <torusGeometry args={[0.34, 0.01, 8, 96]} />
            <meshBasicMaterial color={waveColor} transparent depthWrite={false} opacity={0.2} />
          </mesh>
        ))}
      </group>

      <Line
        ref={directRef}
        points={[TX_POSITION, RX_POSITION]}
        color={beamColor}
        lineWidth={txOnline ? 4 : 2}
        transparent
        opacity={txOnline ? 0.42 : 0.12}
      />

      <Line
        points={[TX_POSITION, REFLECTION_A, RX_POSITION]}
        color="#7d8a91"
        lineWidth={1.5}
        transparent
        opacity={txOnline ? 0.24 : 0.08}
        dashed
        dashSize={0.18}
        gapSize={0.12}
      />

      <Line
        points={[TX_POSITION, REFLECTION_B, RX_POSITION]}
        color="#7d8a91"
        lineWidth={1.5}
        transparent
        opacity={txOnline ? 0.18 : 0.06}
        dashed
        dashSize={0.18}
        gapSize={0.12}
      />

      {motion && (
        <group position={obstaclePosition}>
          <mesh ref={disturbanceRef} position={[0, 0.86, 0]} castShadow>
            <cylinderGeometry args={[0.36 + score * 0.18, 0.36 + score * 0.18, 1.58, 40]} />
            <meshStandardMaterial
              color="#d75a4a"
              emissive="#d75a4a"
              emissiveIntensity={0.12}
              transparent
              opacity={0.28}
              roughness={0.5}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
            <ringGeometry args={[0.44, 0.72 + score * 0.32, 48]} />
            <meshBasicMaterial color="#d75a4a" transparent opacity={0.22} depthWrite={false} />
          </mesh>
        </group>
      )}

      <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 0.12]} />
        <meshBasicMaterial color={motion ? "#d75a4a" : "#0f8aa6"} transparent opacity={txOnline ? 0.2 : 0.08} />
      </mesh>

      <SignalDot position={TX_POSITION} color="#d69e2e" active={txOnline} />
      <SignalDot position={RX_POSITION} color="#0f8aa6" active />
      <SignalDot position={REFLECTION_A} color="#7d8a91" active={txOnline} small />
      <SignalDot position={REFLECTION_B} color="#7d8a91" active={txOnline} small />
    </group>
  );
}

function SignalDot({ position, color, active, small = false }) {
  return (
    <mesh position={[position.x, position.y + 0.03, position.z]}>
      <sphereGeometry args={[small ? 0.045 : 0.07, 18, 12]} />
      <meshBasicMaterial color={color} transparent opacity={active ? 0.9 : 0.25} />
    </mesh>
  );
}
