import { Html } from "@react-three/drei";

export default function SensorNode({ position, label, color }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.18, 0.28]} />
        <meshStandardMaterial color="#f9fbfb" emissive={color} emissiveIntensity={0.08} roughness={0.32} metalness={0.04} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.09, 24, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.26} />
      </mesh>
      <Html distanceFactor={7} position={[0, 0.48, 0]} center>
        <span className="node-label">{label}</span>
      </Html>
    </group>
  );
}
