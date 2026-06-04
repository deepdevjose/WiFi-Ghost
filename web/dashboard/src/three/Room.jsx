import { Grid } from "@react-three/drei";

const zoneTiles = {
  left: [-1.45, 0.012, 0],
  center: [0, 0.014, 0],
  right: [1.45, 0.012, 0],
  near: [0, 0.016, 1.15]
};

export default function Room({ activeZone }) {
  const activePosition = zoneTiles[activeZone] ?? zoneTiles.center;

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5.2, 4.2]} />
        <meshStandardMaterial color="#dce2e4" roughness={0.78} metalness={0.03} />
      </mesh>

      <mesh position={activePosition} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.25, 1.05]} />
        <meshStandardMaterial color="#d69e2e" transparent opacity={0.22} roughness={0.36} />
      </mesh>

      <Grid
        args={[5.2, 4.2]}
        position={[0, 0.018, 0]}
        cellColor="#aab5ba"
        sectionColor="#7e8c93"
        fadeDistance={6}
        fadeStrength={1.4}
      />

      <Wall position={[0, 1.05, -2.1]} rotation={[0, 0, 0]} size={[5.2, 2.1, 0.08]} />
      <Wall position={[-2.6, 1.05, 0]} rotation={[0, Math.PI / 2, 0]} size={[4.2, 2.1, 0.08]} />
      <Wall position={[2.6, 1.05, 0]} rotation={[0, Math.PI / 2, 0]} size={[4.2, 2.1, 0.08]} />
      <Desk position={[1.35, 0.22, 1.35]} />
      <Desk position={[-1.55, 0.22, -1.25]} />
    </group>
  );
}

function Wall({ position, rotation, size }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#f7f7f8" roughness={0.74} />
    </mesh>
  );
}

function Desk({ position }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.95, 0.08, 0.48]} />
        <meshStandardMaterial color="#b9a68d" roughness={0.62} />
      </mesh>
      <mesh castShadow position={[-0.36, 0.1, -0.17]}>
        <boxGeometry args={[0.06, 0.32, 0.06]} />
        <meshStandardMaterial color="#56616a" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0.36, 0.1, -0.17]}>
        <boxGeometry args={[0.06, 0.32, 0.06]} />
        <meshStandardMaterial color="#56616a" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[-0.36, 0.1, 0.17]}>
        <boxGeometry args={[0.06, 0.32, 0.06]} />
        <meshStandardMaterial color="#56616a" roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh castShadow position={[0.36, 0.1, 0.17]}>
        <boxGeometry args={[0.06, 0.32, 0.06]} />
        <meshStandardMaterial color="#56616a" roughness={0.5} metalness={0.12} />
      </mesh>
    </group>
  );
}
