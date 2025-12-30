/**
 * OBJ Model Loading and Processing Utilities
 * Provides functions to load, parse, center, scale, and simplify 3D models
 */

import * as Engine from './engine.js'

// ============ BOUNDING BOX ============

/**
 * Calculate the bounding box of a model's vertices
 * @param {Array} vertices - Array of {x, y, z} points
 * @returns {Object} Bounding box with min/max for each axis and dimensions
 * @throws {Error} If vertices array is empty
 */
export const calculateBoundingBox = (vertices) => {
    if (!vertices || vertices.length === 0) {
        throw new Error('Cannot calculate bounding box: vertices array is empty')
    }

    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    let minZ = Infinity, maxZ = -Infinity

    for (const v of vertices) {
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x)
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y)
        minZ = Math.min(minZ, v.z); maxZ = Math.max(maxZ, v.z)
    }

    return {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ },
        center: {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            z: (minZ + maxZ) / 2
        },
        width: maxX - minX,
        height: maxY - minY,
        depth: maxZ - minZ
    }
}

// ============ VERTEX TRANSFORMATIONS ============

/**
 * Center vertices around the origin
 * @param {Array} vertices - Array of {x, y, z} points
 * @param {Object} [center] - Optional center point, calculated if not provided
 * @returns {Array} Centered vertices
 */
export const centerVertices = (vertices, center = null) => {
    if (!center) {
        const bbox = calculateBoundingBox(vertices)
        center = bbox.center
    }

    return vertices.map(v => ({
        x: v.x - center.x,
        y: v.y - center.y,
        z: v.z - center.z
    }))
}

/**
 * Scale vertices uniformly
 * @param {Array} vertices - Array of {x, y, z} points
 * @param {number} scale - Scale factor
 * @returns {Array} Scaled vertices
 */
export const scaleVertices = (vertices, scale) => {
    return vertices.map(v => ({
        x: v.x * scale,
        y: v.y * scale,
        z: v.z * scale
    }))
}

/**
 * Scale vertices to fit a target height
 * @param {Array} vertices - Array of {x, y, z} points
 * @param {number} targetHeight - Desired height in game units
 * @returns {Array} Scaled vertices
 * @throws {Error} If targetHeight is invalid or model has zero height
 */
export const scaleToHeight = (vertices, targetHeight) => {
    if (targetHeight <= 0) {
        throw new Error(`Invalid targetHeight: ${targetHeight}. Must be greater than 0`)
    }
    const bbox = calculateBoundingBox(vertices)
    if (bbox.height === 0) {
        // If height is zero, use max dimension instead
        const maxDim = Math.max(bbox.width, bbox.height, bbox.depth)
        if (maxDim === 0) {
            throw new Error('Cannot scale model: all dimensions are zero')
        }
        const scale = targetHeight / maxDim
        return scaleVertices(vertices, scale)
    }
    const scale = targetHeight / bbox.height
    return scaleVertices(vertices, scale)
}

/**
 * Center and scale vertices in one operation
 * @param {Array} vertices - Array of {x, y, z} points
 * @param {number} targetHeight - Desired height in game units
 * @returns {Array} Centered and scaled vertices
 * @throws {Error} If targetHeight is invalid or model has zero dimensions
 */
export const centerAndScale = (vertices, targetHeight) => {
    if (targetHeight <= 0) {
        throw new Error(`Invalid targetHeight: ${targetHeight}. Must be greater than 0`)
    }
    const bbox = calculateBoundingBox(vertices)
    
    // If height is zero, use max dimension instead
    let scale
    if (bbox.height === 0) {
        const maxDim = Math.max(bbox.width, bbox.height, bbox.depth)
        if (maxDim === 0) {
            throw new Error('Cannot scale model: all dimensions are zero')
        }
        scale = targetHeight / maxDim
    } else {
        scale = targetHeight / bbox.height
    }

    return vertices.map(v => ({
        x: (v.x - bbox.center.x) * scale,
        y: (v.y - bbox.center.y) * scale,
        z: (v.z - bbox.center.z) * scale
    }))
}

// ============ MODEL SIMPLIFICATION ============

/**
 * Simplify a model by keeping only every Nth edge
 * @param {Object} model - Model with vertices and edges arrays
 * @param {number} factor - Keep every Nth edge (higher = fewer edges)
 * @returns {Object} Simplified model
 * @throws {Error} If factor is invalid
 */
export const simplifyModel = (model, factor) => {
    if (!model || !model.vertices || !model.edges) {
        throw new Error('Invalid model: must have vertices and edges arrays')
    }
    if (factor < 1 || !Number.isInteger(factor)) {
        throw new Error(`Invalid factor: ${factor}. Must be an integer >= 1`)
    }
    if (factor === 1) {
        return { vertices: model.vertices, edges: model.edges }
    }
    return {
        vertices: model.vertices,
        edges: model.edges.filter((_, i) => i % factor === 0)
    }
}

/**
 * Simplify by targeting a maximum number of edges
 * @param {Object} model - Model with vertices and edges arrays
 * @param {number} maxEdges - Target maximum number of edges
 * @returns {Object} Simplified model
 * @throws {Error} If maxEdges is invalid
 */
export const simplifyToMaxEdges = (model, maxEdges) => {
    if (!model || !model.vertices || !model.edges) {
        throw new Error('Invalid model: must have vertices and edges arrays')
    }
    if (maxEdges < 1 || !Number.isInteger(maxEdges)) {
        throw new Error(`Invalid maxEdges: ${maxEdges}. Must be an integer >= 1`)
    }
    if (model.edges.length <= maxEdges) {
        return { vertices: model.vertices, edges: model.edges }
    }

    const factor = Math.ceil(model.edges.length / maxEdges)
    return simplifyModel(model, factor)
}

// ============ OBJ LOADING ============

/**
 * Load and parse an OBJ file from a URL
 * @param {string} url - URL to the OBJ file
 * @returns {Promise<Object>} Parsed model with vertices and edges
 * @throws {Error} If loading or parsing fails
 */
export const loadOBJ = async (url) => {
    if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL: ${url}`)
    }

    let response
    try {
        response = await fetch(url)
    } catch (error) {
        throw new Error(`Failed to fetch OBJ file: ${error.message}`)
    }

    if (!response.ok) {
        throw new Error(`Failed to load OBJ: ${response.status} ${response.statusText}`)
    }

    const objText = await response.text()
    if (!objText || objText.trim().length === 0) {
        throw new Error('OBJ file is empty')
    }

    let model
    try {
        model = Engine.parseOBJ(objText)
    } catch (error) {
        throw new Error(`Failed to parse OBJ file: ${error.message}`)
    }

    // Validate parsed model
    if (!model || !model.vertices || !model.edges) {
        throw new Error('Parsed model is invalid: missing vertices or edges')
    }
    if (model.vertices.length === 0) {
        throw new Error('Parsed model has no vertices')
    }

    return model
}

/**
 * Load an OBJ file and process it for game use
 * @param {string} url - URL to the OBJ file
 * @param {Object} [options] - Processing options
 * @param {number} [options.targetHeight=1] - Target height in game units
 * @param {number} [options.simplifyFactor=1] - Edge simplification factor (1 = no simplification)
 * @param {number} [options.maxEdges] - Maximum edges (alternative to simplifyFactor)
 * @param {boolean} [options.center=true] - Whether to center the model
 * @returns {Promise<Object>} Processed model ready for rendering
 * @throws {Error} If loading, parsing, or processing fails
 */
export const loadAndProcessOBJ = async (url, options = {}) => {
    const {
        targetHeight = 1,
        simplifyFactor = 1,
        maxEdges = null,
        center = true
    } = options

    // Validate options
    if (targetHeight <= 0) {
        throw new Error(`Invalid targetHeight: ${targetHeight}. Must be greater than 0`)
    }
    if (simplifyFactor < 1 || !Number.isInteger(simplifyFactor)) {
        throw new Error(`Invalid simplifyFactor: ${simplifyFactor}. Must be an integer >= 1`)
    }
    if (maxEdges !== null && (maxEdges < 1 || !Number.isInteger(maxEdges))) {
        throw new Error(`Invalid maxEdges: ${maxEdges}. Must be an integer >= 1`)
    }

    const model = await loadOBJ(url)
    const originalEdgeCount = model.edges.length
    const originalVertexCount = model.vertices.length

    // Center and scale vertices
    let processedVertices = model.vertices
    try {
        if (center) {
            processedVertices = centerAndScale(processedVertices, targetHeight)
        } else {
            processedVertices = scaleToHeight(processedVertices, targetHeight)
        }
    } catch (error) {
        throw new Error(`Failed to process vertices: ${error.message}`)
    }

    // Simplify edges using the dedicated function
    let processedModel = { vertices: processedVertices, edges: model.edges }
    if (maxEdges !== null) {
        processedModel = simplifyToMaxEdges(processedModel, maxEdges)
    } else if (simplifyFactor > 1) {
        processedModel = simplifyModel(processedModel, simplifyFactor)
    }

    const finalModel = {
        vertices: processedModel.vertices,
        edges: processedModel.edges,
        originalEdgeCount,
        originalVertexCount
    }

    console.log(`Loaded OBJ: ${finalModel.vertices.length} vertices, ${finalModel.edges.length} edges (simplified from ${originalEdgeCount})`)

    return finalModel
}

/**
 * Load multiple OBJ files in parallel
 * @param {Array<{url: string, options: Object}>} models - Array of model configs
 * @returns {Promise<Array>} Array of processed models
 * @throws {Error} If models array is invalid
 */
export const loadMultipleOBJ = async (models) => {
    if (!Array.isArray(models)) {
        throw new Error('models must be an array')
    }
    if (models.length === 0) {
        return []
    }
    return Promise.all(
        models.map(({ url, options }) => {
            if (!url) {
                throw new Error('Each model config must have a url property')
            }
            return loadAndProcessOBJ(url, options || {})
        })
    )
}

// ============ MODEL UTILITIES ============

/**
 * Clone a model (useful for creating multiple instances)
 * @param {Object} model - Model with vertices and edges
 * @returns {Object} Cloned model
 * @throws {Error} If model is invalid
 */
export const cloneModel = (model) => {
    if (!model || !model.vertices || !model.edges) {
        throw new Error('Invalid model: must have vertices and edges arrays')
    }
    return {
        vertices: model.vertices.map(v => ({ x: v.x, y: v.y, z: v.z })),
        edges: model.edges.map(e => [...e])
    }
}

/**
 * Merge multiple models into one
 * @param {Array} models - Array of models with vertices and edges
 * @returns {Object} Merged model
 * @throws {Error} If models array is invalid
 */
export const mergeModels = (models) => {
    if (!Array.isArray(models)) {
        throw new Error('models must be an array')
    }
    if (models.length === 0) {
        return { vertices: [], edges: [] }
    }

    const mergedVertices = []
    const mergedEdges = []

    for (const model of models) {
        if (!model || !model.vertices || !model.edges) {
            throw new Error('All models must have vertices and edges arrays')
        }
        const offset = mergedVertices.length
        mergedVertices.push(...model.vertices.map(v => ({ x: v.x, y: v.y, z: v.z })))
        mergedEdges.push(...model.edges.map(e => [e[0] + offset, e[1] + offset]))
    }

    return { vertices: mergedVertices, edges: mergedEdges }
}

/**
 * Get model statistics
 * @param {Object} model - Model with vertices and edges
 * @returns {Object} Statistics about the model
 * @throws {Error} If model is invalid
 */
export const getModelStats = (model) => {
    if (!model || !model.vertices || !model.edges) {
        throw new Error('Invalid model: must have vertices and edges arrays')
    }
    const bbox = calculateBoundingBox(model.vertices)
    return {
        vertexCount: model.vertices.length,
        edgeCount: model.edges.length,
        boundingBox: bbox,
        dimensions: {
            width: bbox.width,
            height: bbox.height,
            depth: bbox.depth
        }
    }
}

