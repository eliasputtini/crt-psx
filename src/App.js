import * as THREE from 'three'
import React, {useMemo, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas,extend, useFrame, } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
 

import { MyCustomEffect } from './CrtScreenEffect'
import { Model } from './models/crt/Crt'
 


import { Text, Environment, OrbitControls } from "@react-three/drei";


import { useAspect } from '@react-three/drei'

import { fragmentShader, vertexShader } from './CrtShader'

 




function Box({ color, ...props }) {

  // This reference will give us direct access to the mesh
  const mesh = useRef()
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame(() => {
    if (mesh.current !== undefined) {
      mesh.current.rotation.x = mesh.current.rotation.y += 0.01
    }
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial roughness={10} color={hovered ? 'red' : color} emissive={hovered ? 'hotpink' : color} emissiveIntensity={2} toneMapped={false} />
    </mesh>
  )
}

const OrbitingBoxes = () => {
  const [t, setT] = useState(0)
  useFrame(() => {
    setT(t + 0.01)
  })

  const r = 0.5 * (Math.sin(t * 0.5) + 2) * 1.5

  return (
    <>
      <Box position={[r * Math.cos(t), r * Math.sin(t), 0]} color="skyblue" />
      <Box position={[r * Math.cos(t + (Math.PI / 3) * 2), r * Math.sin(t + (Math.PI / 3) * 2), 0]} color="hotpink" />
      <Box position={[r * Math.cos(t + (Math.PI / 3) * 2 * 2), r * Math.sin(t + (Math.PI / 3) * 2 * 2), 0]} color="wheat" />
    </>
  )
}

function Video() { 
  const [video] = useState(() =>
    Object.assign(document.createElement('video'), { src: '/ps1.mp4', crossOrigin: 'Anonymous', loop: true, muted: false }),
  )
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isPlaying) {
      video.play()
    } else {
      video.pause()
    }
  }, [isPlaying, video])
 
 

  const texture = useMemo(() => new THREE.VideoTexture(video), [video]);

  return (
    <>
      <mesh scale={[4.1,3,1]}>
        <planeGeometry />
        <meshBasicMaterial toneMapped={false}>
          <videoTexture attach="map" args={[video]} encoding={THREE.SRGBColorSpace} />
        </meshBasicMaterial> 
 
        <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={{ 
            inputBuffer: { value: texture },
          }}
        />
      </mesh>
      <Text
        color="white"
        textAlign="center"
        fontSize={0.9}
        position={[0, 3, 0]}
        onClick={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </Text>
    </>
  )
}



export default function App() {

  return (

    <Canvas gl={{ antialias: false }} dpr={1} style={{ width: '100%', height: '100%' }}>
      <color attach="background" args={['black']} />

      <directionalLight
        position={[0, 30, 30]}
        intensity={10}
      />
      {/* <ambientLight intensity={0.1} /> */}

      <Suspense fallback={null}>
        <Model />

        <Environment path="cube" />

      </Suspense>
      <Video />


      {/* <OrbitingBoxes /> */}
      <EffectComposer>
        {/* <MyCustomEffect /> */}
        <Bloom intensity={0.5} mipmapBlur />
      </EffectComposer>
      <OrbitControls enablePan={false} enableZoom={true} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
      
    </Canvas >
  )
}
