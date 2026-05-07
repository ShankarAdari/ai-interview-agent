import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import { MathUtils, AdditiveBlending } from 'three'

function NeuralNetwork() {
  const ref = useRef()
  
  // Create random points for the "neurons"
  const points = useMemo(() => {
    const p = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15
      p[i * 3 + 1] = (Math.random() - 0.5) * 15
      p[i * 3 + 2] = (Math.random() - 0.5) * 15
    }
    return p
  }, [])

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10
    ref.current.rotation.y -= delta / 15
    
    // Subtle reaction to mouse
    const { mouse } = state
    ref.current.position.x = MathUtils.lerp(ref.current.position.x, mouse.x * 0.5, 0.1)
    ref.current.position.y = MathUtils.lerp(ref.current.position.y, mouse.y * 0.5, 0.1)
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6c63ff"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </Points>
    </group>
  )
}

function FloatingOrbs() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={[-5, 2, -2]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#6c63ff" emissive="#6c63ff" emissiveIntensity={2} transparent opacity={0.3} />
      </mesh>
      <mesh position={[5, -3, -5]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} transparent opacity={0.2} />
      </mesh>
      <mesh position={[2, 4, -8]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={1} transparent opacity={0.1} />
      </mesh>
    </Float>
  )
}

export default function Background3D() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(circle at 50% 50%, #080d1a 0%, #050810 100%)'
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <NeuralNetwork />
        <FloatingOrbs />
      </Canvas>
    </div>
  )
}
