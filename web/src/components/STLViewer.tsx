import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { Suspense } from 'react';

interface STLViewerProps {
  modelPath: string;
}

export function STLViewer({ modelPath }: STLViewerProps) {
  return (
    <Canvas shadows camera={{ position: [0, 0, 200], fov: 50 }}>
      <Suspense fallback={null}>
        <Stage environment={null} intensity={0.5} contactShadow={false}>
          {/* TODO: 实际实现需要加载 STL 文件 */}
          <PlaceholderModel />
        </Stage>
      </Suspense>
      <OrbitControls 
        autoRotate
        autoRotateSpeed={2}
        enableZoom={true}
        enablePan={true}
      />
    </Canvas>
  );
}

function PlaceholderModel() {
  // 临时占位模型，等待 STL 加载器实现
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[50, 50, 50]} />
        <meshStandardMaterial color="#667eea" />
      </mesh>
      <mesh position={[30, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 30, 30]} />
        <meshStandardMaterial color="#764ba2" />
      </mesh>
      <mesh position={[-30, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 30, 30]} />
        <meshStandardMaterial color="#667eea" />
      </mesh>
    </group>
  );
}

export default STLViewer;
