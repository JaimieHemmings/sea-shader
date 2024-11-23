import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

// Shader imports
import waterVertexShader from './shaders/water/vertex.glsl'
import waterFragmentShader from './shaders/water/fragment.glsl'

/**
 * Base
 */
// Debug
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
const waterGeometry = new THREE.PlaneGeometry(50, 50, 128, 128)

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

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

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
    const elapsedTime = clock.getElapsedTime()

    // Update water
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()