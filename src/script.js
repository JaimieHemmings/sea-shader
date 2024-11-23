import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Sky } from 'three/examples/jsm/Addons.js'
import Stats from './stats.js'
import GUI from 'lil-gui'

// Shader imports
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

/**
 * Base
 */
// Debug
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)
const gui = new GUI({ width: 340 })
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Water
 */
// Geometry
const waterGeometry = new THREE.PlaneGeometry(20, 20, 512, 512)

// Color
debugObject.depthColor = '#186691';
debugObject.surfaceColor = '#9bd8ff';

// Material
const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
        uTime: { value: 0 },

        uWaveAmplitude: { value: 0.2 },
        uWaveFrequency: { value: new THREE.Vector2(1, 1) },
        uWaveSpeed: { value: 1 },

        usmallWavesElevation: { value: 0.15 },
        usmallWavesFrequency: { value: 2 },
        usmallWavesSpeed: { value: 0.2 },
        uSmallWavesIterations: { value: 3 },

        uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
        uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
        uColorOffset: { value: 0.08 },
        uColorMultiplier: { value: 5 }
    }
})

// Debug
gui.add(waterMaterial.uniforms.uWaveAmplitude, 'value').min(0).max(1).step(0.01).name('waveAmplitude')
gui.add(waterMaterial.uniforms.uWaveFrequency.value, 'x').min(0).max(10).step(0.1).name('uWaveFrequencyX')
gui.add(waterMaterial.uniforms.uWaveFrequency.value, 'y').min(0).max(10).step(0.1).name('uWaveFrequencyY')
gui.add(waterMaterial.uniforms.uWaveSpeed, 'value').min(0).max(4).step(0.1).name('waveSpeed')

gui
.addColor(debugObject, 'depthColor')
.onChange(() =>
{
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
})

gui
.addColor(debugObject, 'surfaceColor')
.onChange(() =>
{
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
})

gui.add(waterMaterial.uniforms.uColorOffset, 'value').min(0).max(0.1).step(0.01).name('colorOffset')
gui.add(waterMaterial.uniforms.uColorMultiplier, 'value').min(0).max(10).step(0.1).name('colorMultiplier')

gui.add(waterMaterial.uniforms.usmallWavesElevation, 'value').min(0).max(1).step(0.01).name('smallWavesElevation')
gui.add(waterMaterial.uniforms.usmallWavesFrequency, 'value').min(0).max(10).step(0.1).name('smallWavesFrequency')
gui.add(waterMaterial.uniforms.usmallWavesSpeed, 'value').min(0).max(4).step(0.1).name('smallWavesSpeed')
gui.add(waterMaterial.uniforms.uSmallWavesIterations, 'value').min(0).max(10).step(1).name('smallWavesIterations')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

// Add Sky
const sky = new Sky()
sky.material.uniforms.turbidity.value = 3
sky.material.uniforms.rayleigh.value = 10
sky.material.uniforms.mieCoefficient.value = 0.1
sky.material.uniforms.mieDirectionalG.value = 0.95
sky.material.uniforms.sunPosition.value = new THREE.Vector3(0.8, -0.05, -2)
sky.scale.set(100,100,100)
scene.add(sky)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
camera.position.y = 4
// Set camera to look at planeGeometry
camera.lookAt(water.position)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enablePan = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()
    const elapsedTime = clock.getElapsedTime()

    // Update water
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
    stats.end()
}

tick()