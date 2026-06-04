import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

export default function HumanSilhouette({ position, score }) {
  const groupRef = useRef(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const pulse = Math.sin(clock.elapsedTime * 4) * 0.035;
    groupRef.current.position.y = pulse;
    groupRef.current.rotation.y = Math.sin(clock.elapsedTime * 1.5) * 0.08;
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.22, 32, 20]} />
        <meshStandardMaterial color="#eec9a6" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.63, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.74, 8, 18]} />
        <meshStandardMaterial color="#2d3035" roughness={0.62} />
      </mesh>
      <mesh position={[-0.17, 0.08, 0]} rotation={[0.08, 0, 0.08]} castShadow>
        <capsuleGeometry args={[0.07, 0.58, 8, 14]} />
        <meshStandardMaterial color="#4a5560" roughness={0.7} />
      </mesh>
      <mesh position={[0.17, 0.08, 0]} rotation={[0.08, 0, -0.08]} castShadow>
        <capsuleGeometry args={[0.07, 0.58, 8, 14]} />
        <meshStandardMaterial color="#4a5560" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <torusGeometry args={[0.44 + score * 0.32, 0.012, 10, 72]} />
        <meshStandardMaterial color="#d69e2e" emissive="#d69e2e" emissiveIntensity={0.28} transparent opacity={0.68} />
      </mesh>
    </group>
  );
}
