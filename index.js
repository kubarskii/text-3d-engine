// Public entry point for the npm package
// Provides a minimal contract to render voxel 3D text inside a container

import {
    clearBuffer,
    createBuffer,
    flushBuffer,
    getCenter,
    renderModel,
    rotateX,
    rotateY,
    translate,
    translateZ,
} from './engine.js'
import { createVoxelText } from './models.js'

/**
 * Create a simple text renderer using the ASCII 3D engine
 * @param {{
 *  container: HTMLElement,
 *  width: number,
 *  height: number,
 *  text: string,
 *  pixelSize?: number,
 *  letterSpacing?: number,
 *  lineSpacing?: number,
 *  autoRotate?: boolean,
 *  rotationSpeed?: number
 * }} config
 */
export const createTextRenderer = (config) => {
    const {
        container,
        width,
        height,
        text,
        pixelSize = 0.28,
        letterSpacing = 0.25,
        lineSpacing = 0.35,
        autoRotate = true,
        rotationSpeed = 0.4,
    } = config

    if (!container) throw new Error('container is required')
    if (typeof width !== 'number' || typeof height !== 'number') {
        throw new Error('width and height are required numbers')
    }
    if (typeof text !== 'string') throw new Error('text must be a string')

    let buffer = createBuffer(width, height)
    let dimensions = { width, height }
    let animationFrame = null
    let angle = 0

    const state = {
        model: createVoxelText(text, { pixelSize, letterSpacing, lineSpacing }),
        centeredVertices: [],
    }

    const recenterModel = () => {
        if (!state.model.vertices.length) {
            state.centeredVertices = []
            return
        }
        const center = getCenter(state.model.vertices)
        state.centeredVertices = state.model.vertices.map(v => translate(v, -center.x, -center.y, -center.z))
    }

    const rebuildText = (nextText) => {
        state.model = createVoxelText(nextText, { pixelSize, letterSpacing, lineSpacing })
        recenterModel()
    }

    const resize = (nextWidth, nextHeight) => {
        dimensions = { width: nextWidth, height: nextHeight }
        buffer = createBuffer(nextWidth, nextHeight)
    }

    const draw = () => {
        clearBuffer(buffer)
        if (!state.centeredVertices.length) {
            flushBuffer(buffer, container)
            return
        }
        const transformed = state.centeredVertices.map(v => {
            const rotatedY = rotateY(v, angle)
            const rotated = rotateX(rotatedY, -0.3)
            return translateZ(rotated, 2.8)
        })

        renderModel(buffer, state.model, transformed, container, dimensions, { showVertices: false })
        flushBuffer(buffer, container)
    }

    const loop = () => {
        angle += rotationSpeed * 0.016
        draw()
        animationFrame = requestAnimationFrame(loop)
    }

    const start = () => {
        if (animationFrame) return
        if (autoRotate) {
            animationFrame = requestAnimationFrame(loop)
        } else {
            draw()
        }
    }

    const stop = () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame)
            animationFrame = null
        }
    }

    const updateText = (nextText) => {
        rebuildText(nextText)
        if (!autoRotate) draw()
    }

    recenterModel()
    start()

    return {
        start,
        stop,
        resize,
        updateText,
        draw,
        destroy: () => {
            stop()
            container.textContent = ''
        }
    }
}

export { createVoxelText } from './models.js'
