import { ContactShadows, Line, useGLTF } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const MODEL_URL = '/models/wqis-digital-weld-gauge.glb'

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1)
}

function easeInOutCubic(value) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2
}

function InspectionMark({ reduced, onReady }) {
  const { scene } = useGLTF(MODEL_URL)
  const assembly = useRef()
  const platform = useRef()
  const stand = useRef()
  const tool = useRef()
  const scanRing = useRef()
  const scanMaterial = useRef()
  const pointer = useRef({ x: 0, y: 0 })

  const parts = useMemo(() => {
    const platformScene = scene.clone(true)
    const standScene = scene.clone(true)
    const toolScene = scene.clone(true)
    const isPlatform = (name) => /^(Plate_|Weld_)/i.test(name)
    const isStand = (name) => /^Gauge_Foot_/i.test(name)

    const configure = (root, visibleWhen) => {
      root.traverse((object) => {
        if (!object.isMesh) return
        object.visible = visibleWhen(object.name)
        object.castShadow = object.visible
        object.receiveShadow = object.visible
      })
      return root
    }

    return {
      platformScene: configure(platformScene, (name) => isPlatform(name)),
      standScene: configure(standScene, (name) => isStand(name)),
      toolScene: configure(toolScene, (name) => !isPlatform(name) && !isStand(name)),
    }
  }, [scene])

  useEffect(() => {
    onReady?.()
  }, [onReady])

  useFrame((state, delta) => {
    if (!assembly.current || !platform.current || !stand.current || !tool.current || document.hidden) return

    const rawProgress = reduced ? 1 : clamp01(window.scrollY / Math.max(window.innerHeight * 0.26, 1))
    const standProgress = easeInOutCubic(clamp01(rawProgress * 1.45))
    const toolProgress = easeInOutCubic(clamp01((rawProgress - 0.12) / 0.88))
    const impact = reduced ? 0 : Math.max(0, 1 - Math.abs(rawProgress - 0.94) / 0.16)
    const mobile = state.size.width < 700

    platform.current.position.y = THREE.MathUtils.damp(platform.current.position.y, 0, 8, delta)
    stand.current.position.y = THREE.MathUtils.damp(stand.current.position.y, (1 - standProgress) * 0.024, 9, delta)
    stand.current.rotation.z = THREE.MathUtils.damp(stand.current.rotation.z, (1 - standProgress) * 0.025, 8, delta)
    tool.current.position.y = THREE.MathUtils.damp(tool.current.position.y, (1 - toolProgress) * 0.112, 10, delta)
    tool.current.rotation.z = THREE.MathUtils.damp(tool.current.rotation.z, (1 - toolProgress) * -0.035, 8, delta)

    assembly.current.rotation.x = THREE.MathUtils.damp(assembly.current.rotation.x, -0.035 + pointer.current.y * -0.026, 4, delta)
    assembly.current.rotation.y = THREE.MathUtils.damp(assembly.current.rotation.y, -0.18 + pointer.current.x * 0.07, 4, delta)
    assembly.current.position.y = THREE.MathUtils.damp(assembly.current.position.y, mobile ? -0.67 : -0.73, 5, delta)

    if (scanRing.current) {
      scanRing.current.scale.setScalar(1 + impact * 1.6)
      scanRing.current.rotation.z = state.clock.elapsedTime * 0.12
    }
    if (scanMaterial.current) scanMaterial.current.opacity = 0.08 + impact * 0.52
  })

  return (
    <group
      ref={assembly}
      position={[0, -0.73, 0]}
      rotation={[-0.035, -0.18, 0]}
      scale={11.2}
      onPointerMove={(event) => {
        pointer.current.x = event.pointer.x || 0
        pointer.current.y = event.pointer.y || 0
      }}
      onPointerLeave={() => { pointer.current = { x: 0, y: 0 } }}
    >
      <primitive ref={platform} object={parts.platformScene} />
      <primitive ref={stand} object={parts.standScene} />
      <primitive ref={tool} object={parts.toolScene} />

      <mesh ref={scanRing} position={[0, 0.022, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.158, 0.164, 64]} />
        <meshBasicMaterial ref={scanMaterial} color="#39c2d7" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <Line points={[[0, 0.02, -0.13], [0, 0.02, 0.13]]} color="#82dbe6" lineWidth={0.4} transparent opacity={0.28} />
    </group>
  )
}

function CameraRig({ reduced }) {
  const { camera, size } = useThree()

  useFrame((state, delta) => {
    if (document.hidden) return
    const scroll = reduced ? 1 : clamp01(window.scrollY / Math.max(window.innerHeight * 0.26, 1))
    const mobile = size.width < 700
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 4, delta)
    const targetZ = mobile ? 10.1 + scroll * 0.12 : 9.35 - scroll * 0.72
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 3.45 - scroll * 0.08, 4, delta)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4, delta)
    camera.lookAt(0, -0.12, 0)
  })

  return null
}

function InspectionScene({ reduced, onReady }) {
  return (
    <>
      <ambientLight intensity={1.2} color="#bfd7e2" />
      <hemisphereLight args={['#eefbff', '#17374a', 1.3]} />
      <directionalLight position={[4.5, 7, 6]} intensity={4.3} color="#fff3dc" castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, 2]} intensity={2.7} color="#58b7d2" />
      <spotLight position={[0, 4, 5]} angle={0.42} penumbra={0.8} intensity={3.2} color="#d5f7ff" />
      <InspectionMark reduced={reduced} onReady={onReady} />
      <ContactShadows position={[0, -1.3, 0]} opacity={0.28} scale={5.5} blur={2.8} far={3.2} />
      <CameraRig reduced={reduced} />
    </>
  )
}

export default function SceneCanvas({ onReady }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const initialCameraZ = typeof window !== 'undefined' && window.innerWidth < 700 ? 10.1 : 9.35

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 3.45, initialCameraZ], fov: 34, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      shadows
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.08
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      <InspectionScene reduced={reduced} onReady={onReady} />
    </Canvas>
  )
}

useGLTF.preload(MODEL_URL)
