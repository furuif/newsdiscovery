import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Stage, Center } from '@react-three/drei';
import { Suspense, useState } from 'react';
import { STLLoader } from 'three-stdlib';
import * as THREE from 'three';

interface STLViewerProps {
  modelPath?: string;
  modelData?: ArrayBuffer;
}

export function STLViewer({ modelPath, modelData }: STLViewerProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 0, 200], fov: 50 }}>
        <Suspense fallback={null}>
          <Stage environment={null} intensity={0.5} contactShadow={false}>
            {modelData ? (
              <STLModel data={modelData} onError={setError} />
            ) : modelPath ? (
              <STLModel url={modelPath} onError={setError} />
            ) : (
              <PlaceholderModel />
            )}
          </Stage>
        </Suspense>
        <OrbitControls 
          autoRotate
          autoRotateSpeed={2}
          enableZoom={true}
          enablePan={true}
          minDistance={50}
          maxDistance={500}
        />
      </Canvas>
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '8px',
          fontSize: '0.9rem',
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

interface STLModelProps {
  url?: string;
  data?: ArrayBuffer;
  onError: (error: string) => void;
}

function STLModel({ url, data, onError }: STLModelProps) {
  let geometry;
  
  try {
    if (data) {
      // 从 ArrayBuffer 加载
      geometry = useLoader(STLLoader, data as any);
    } else if (url) {
      // 从 URL 加载
      geometry = useLoader(STLLoader, url);
    }
    
    if (!geometry) {
      throw new Error('无法加载几何体');
    }
    
    // 计算模型中心并居中
    const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
    const center = box.getCenter(new THREE.Vector3());
    
    return (
      <Center>
        <mesh 
          castShadow 
          receiveShadow
          geometry={geometry}
        >
          <meshStandardMaterial 
            color="#667eea"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </Center>
    );
  } catch (err) {
    console.error('STL 加载失败:', err);
    onError(err instanceof Error ? err.message : 'STL 加载失败');
    return <PlaceholderModel />;
  }
}

function PlaceholderModel() {
  // 临时占位模型
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[50, 50, 50]} />
        <meshStandardMaterial color="#667eea" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[30, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 30, 30]} />
        <meshStandardMaterial color="#764ba2" metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[-30, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[30, 30, 30]} />
        <meshStandardMaterial color="#667eea" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  );
}

export default STLViewer;
