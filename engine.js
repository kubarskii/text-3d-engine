// @ts-check
// ============ TEXT-BASED 3D ENGINE ============

/**
 * @typedef {Object} Point
 * @property {number} x from -1 to 1
 * @property {number} y from -1 to 1        
 * @property {number} z from 0 to 1, if less than 0 - not visible
*/

/**
 * @typedef {Object} RenderResult
 * @property {number} x from 0 to width
 * @property {number} y from 0 to height
*/

/**
 * @typedef {Object} Line
 * @property {Point} start
 * @property {Point} end
*/

/**
 * @typedef {Object} Model3D
 * @property {Point[]} vertices - Array of 3D points
 * @property {number[][]} edges - Array of [i, j] vertex index pairs
 * @property {number[][]} [faces] - Optional: Array of vertex indices forming faces
*/

/**
 * @typedef {Object} FrameBuffer
 * @property {string[][]} chars - 2D character buffer
 * @property {number[][]} depth - Z-buffer for depth testing
 * @property {number} width
 * @property {number} height
*/

// ============ CORE POINT FUNCTIONS ============

/**
 * Creating a point in world coordinates
 * @param {number} x from -1 to 1
 * @param {number} y from -1 to 1
 * @param {number} z from 0 to 1, if less than 0 - not visible
 * @returns {Point}
*/
export const point = (x, y, z) => {
    return { x, y, z }
}

/**
 * Convert from normalized coordinates (-1 to 1) to screen coordinates (0 to width/height)
 * @param {RenderResult} point - Point with normalized coordinates
 * @param {number} width - Screen width
 * @param {number} height - Screen height
 * @returns {RenderResult} Point in screen coordinates
*/
export const normalize = ({ x, y }, width, height) => {
    return {
        x: (x + 1) / 2 * width,
        y: (1 - (y + 1) / 2) * height,
    }
}

/**
 * Apply perspective projection (divide by Z for perspective)
 * @param {Point} point - 3D point (destructured as {x, y, z})
 * @returns {RenderResult} 2D projected point (returns {x: 0, y: 0} if z <= 0)
 */
export const normalizeZ = ({ x, y, z }) => {
    if (z <= 0) {
        return { x: 0, y: 0 }
    }
    return { x: x / z, y: y / z }
}

/**
 * Project a 3D point to 2D screen coordinates
 * @param {Point} point - 3D point in world space
 * @param {number} width - Screen width
 * @param {number} height - Screen height
 * @returns {RenderResult} 2D screen coordinates
 */
export const renderPoint = (point, width, height) => {
    return normalize(normalizeZ(point), width, height)
}

// ============ ROTATION FUNCTIONS ============

/**
 * Rotate around Z axis
 * @param {Point} p
 * @param {number} angle in radians
 * @returns {Point}
 */
export const rotateZ = (p, angle) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return {
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
        z: p.z
    }
}

/**
 * Rotate around X axis
 * @param {Point} p
 * @param {number} angle in radians
 * @returns {Point}
 */
export const rotateX = (p, angle) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return {
        x: p.x,
        y: p.y * cos - p.z * sin,
        z: p.y * sin + p.z * cos
    }
}

/**
 * Rotate around Y axis
 * @param {Point} p
 * @param {number} angle in radians
 * @returns {Point}
 */
export const rotateY = (p, angle) => {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    return {
        x: p.x * cos + p.z * sin,
        y: p.y,
        z: -p.x * sin + p.z * cos
    }
}

// ============ TRANSLATION FUNCTIONS ============

/**
 * Translate point in Z (move towards/away from camera)
 * @param {Point} p
 * @param {number} offset
 * @returns {Point}
 */
export const translateZ = (p, offset) => {
    return { x: p.x, y: p.y, z: p.z + offset }
}

/**
 * Translate point in X
 * @param {Point} p
 * @param {number} offset
 * @returns {Point}
 */
export const translateX = (p, offset) => {
    return { x: p.x + offset, y: p.y, z: p.z }
}

/**
 * Translate point in Y
 * @param {Point} p
 * @param {number} offset
 * @returns {Point}
 */
export const translateY = (p, offset) => {
    return { x: p.x, y: p.y + offset, z: p.z }
}

/**
 * Translate point in all directions
 * @param {Point} p
 * @param {number} dx
 * @param {number} dy
 * @param {number} dz
 * @returns {Point}
 */
export const translate = (p, dx, dy, dz) => {
    return { x: p.x + dx, y: p.y + dy, z: p.z + dz }
}

/**
 * Scale a point
 * @param {Point} p
 * @param {number} scale
 * @returns {Point}
 */
export const scale = (p, scale) => {
    return { x: p.x * scale, y: p.y * scale, z: p.z * scale }
}

// ============ SHADING ============

// Depth shading characters (far → close)
export const SHADE_CHARS = ' ·∙░▒▓█'
export const VERTEX_CHAR = '●'
export const BG_CHAR = ' '

/**
 * Get shading character based on depth (z value after translation)
 * @param {number} z depth value (lower = closer)
 * @param {number} minZ minimum expected z
 * @param {number} maxZ maximum expected z
 * @returns {string}
 */
export const getShadeChar = (z, minZ = 1.5, maxZ = 2.5) => {
    const t = 1 - Math.max(0, Math.min(1, (z - minZ) / (maxZ - minZ)))
    const idx = Math.floor(t * (SHADE_CHARS.length - 1))
    return SHADE_CHARS[idx]
}

// ============ BUFFER RENDERER ============

/**
 * Create a new frame buffer
 * @param {number} width
 * @param {number} height
 * @returns {FrameBuffer}
 */
export const createBuffer = (width, height) => {
    /** @type {string[][]} */
    const chars = []
    /** @type {number[][]} */
    const depth = []
    for (let y = 0; y <= height; y++) {
        chars[y] = []
        depth[y] = []
        for (let x = 0; x <= width; x++) {
            chars[y][x] = BG_CHAR
            depth[y][x] = Infinity
        }
    }
    return { chars, depth, width, height }
}

/**
 * Clear the buffer
 * @param {FrameBuffer} buffer
 * @param {string} [bgChar]
 */
export const clearBuffer = (buffer, bgChar = BG_CHAR) => {
    for (let y = 0; y <= buffer.height; y++) {
        for (let x = 0; x <= buffer.width; x++) {
            buffer.chars[y][x] = bgChar
            buffer.depth[y][x] = Infinity
        }
    }
}

/**
 * Plot pixel to buffer with depth testing
 * @param {FrameBuffer} buffer
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {string} char
 */
export const plotToBuffer = (buffer, x, y, z, char) => {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    if (ix < 0 || ix > buffer.width || iy < 0 || iy > buffer.height) return
    if (z < buffer.depth[iy][ix]) {
        buffer.depth[iy][ix] = z
        buffer.chars[iy][ix] = char
    }
}

/**
 * Render buffer to DOM (single update)
 * @param {FrameBuffer} buffer
 * @param {HTMLElement} container
 */
export const flushBuffer = (buffer, container) => {
    const lines = []
    for (let y = 0; y <= buffer.height; y++) {
        lines.push(buffer.chars[y].join(''))
    }
    container.textContent = lines.join('\n')
}

/**
 * Draw line to buffer using Bresenham with depth
 * @param {FrameBuffer} buffer
 * @param {Point} p1
 * @param {Point} p2
 * @param {number} width
 * @param {number} height
 * @param {string} [overrideChar] - Optional character to use instead of depth shading
 */
export const drawLineToBuffer = (buffer, p1, p2, width, height, overrideChar) => {
    // Near clipping plane - skip edges that cross or are behind the camera
    const NEAR_CLIP = 0.1

    // Skip entirely if both points are behind camera
    if (p1.z < NEAR_CLIP && p2.z < NEAR_CLIP) return

    // Clip edge if one point is behind camera
    let clippedP1 = p1
    let clippedP2 = p2

    if (p1.z < NEAR_CLIP) {
        // Interpolate p1 to the near plane
        const t = (NEAR_CLIP - p1.z) / (p2.z - p1.z)
        clippedP1 = {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y),
            z: NEAR_CLIP
        }
    } else if (p2.z < NEAR_CLIP) {
        // Interpolate p2 to the near plane
        const t = (NEAR_CLIP - p2.z) / (p1.z - p2.z)
        clippedP2 = {
            x: p2.x + t * (p1.x - p2.x),
            y: p2.y + t * (p1.y - p2.y),
            z: NEAR_CLIP
        }
    }

    const start = renderPoint(clippedP1, width, height)
    const end = renderPoint(clippedP2, width, height)

    let x0 = Math.floor(start.x)
    let y0 = Math.floor(start.y)
    const x1 = Math.floor(end.x)
    const y1 = Math.floor(end.y)

    // Skip tiny edges (optimization)
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    if (dx < 2 && dy < 2) return

    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    const totalSteps = Math.max(dx, dy)
    let step = 0

    while (true) {
        const t = totalSteps > 0 ? step / totalSteps : 0
        const z = clippedP1.z + t * (clippedP2.z - clippedP1.z)
        const char = overrideChar || getShadeChar(z)

        plotToBuffer(buffer, x0, y0, z, char)

        if (x0 === x1 && y0 === y1) break

        const e2 = 2 * err
        if (e2 > -dy) {
            err -= dy
            x0 += sx
        }
        if (e2 < dx) {
            err += dx
            y0 += sy
        }
        step++
    }
}

// ============ OBJ PARSER ============

/**
 * Parse simple OBJ format string
 * @param {string} objString
 * @returns {Model3D}
 */
export const parseOBJ = (objString) => {
    const vertices = []
    const edges = []
    const edgeSet = new Set()

    const lines = objString.trim().split('\n')
    for (const line of lines) {
        const parts = line.trim().split(/\s+/)
        if (parts[0] === 'v') {
            vertices.push(point(
                parseFloat(parts[1]),
                parseFloat(parts[2]),
                parseFloat(parts[3])
            ))
        } else if (parts[0] === 'f') {
            // Parse face indices, handling OBJ format (1-based, can be negative for relative)
            const indices = parts.slice(1)
                .map(p => {
                    const idxStr = p.split('/')[0].trim()
                    if (!idxStr) return null

                    let idx = parseInt(idxStr, 10)
                    // Handle negative indices (relative to current vertex count)
                    if (idx < 0) {
                        idx = vertices.length + idx + 1
                    }
                    // Convert from 1-based to 0-based
                    idx = idx - 1

                    // Validate index is within bounds
                    if (isNaN(idx) || idx < 0 || idx >= vertices.length) {
                        return null
                    }
                    return idx
                })
                .filter(idx => idx !== null)

            // Only process if we have at least 2 valid indices
            if (indices.length >= 2) {
                for (let i = 0; i < indices.length; i++) {
                    const a = indices[i]
                    const b = indices[(i + 1) % indices.length]
                    // Ensure both indices are valid
                    if (a !== null && b !== null && a !== b) {
                        const key = a < b ? `${a}-${b}` : `${b}-${a}`
                        if (!edgeSet.has(key)) {
                            edgeSet.add(key)
                            edges.push([a, b])
                        }
                    }
                }
            }
        }
    }

    // Filter out any edges with invalid indices (safety check)
    const validEdges = edges.filter(([a, b]) =>
        typeof a === 'number' && typeof b === 'number' &&
        a >= 0 && b >= 0 &&
        a < vertices.length && b < vertices.length &&
        a !== b
    )

    return { vertices, edges: validEdges }
}

// ============ MODEL TRANSFORMATION ============

/**
 * Transform a model with rotation and translation
 * @param {Model3D} model
 * @param {Object} transform
 * @param {number} [transform.rx] - Rotation around X
 * @param {number} [transform.ry] - Rotation around Y
 * @param {number} [transform.rz] - Rotation around Z
 * @param {number} [transform.tx] - Translation in X
 * @param {number} [transform.ty] - Translation in Y
 * @param {number} [transform.tz] - Translation in Z
 * @param {number} [transform.scale] - Scale factor
 * @returns {Point[]}
 */
export const transformModel = (model, { rx = 0, ry = 0, rz = 0, tx = 0, ty = 0, tz = 2, scale: s = 1 }) => {
    return model.vertices.map(v => {
        let p = point(v.x * s, v.y * s, v.z * s)
        p = rotateX(p, rx)
        p = rotateY(p, ry)
        p = rotateZ(p, rz)
        p = translate(p, tx, ty, tz)
        return p
    })
}

// ============ HIGH-LEVEL RENDERING ============

/**
 * Optimized frame renderer using buffer
 * @param {FrameBuffer} buffer
 * @param {HTMLDivElement} container
 * @param {Object} dimensions
 * @param {Point[]} points
 * @param {Line[]} lines
 * @param {Object} [options]
 * @param {number} [options.maxEdges] - Max edges to render (for LOD)
 * @param {boolean} [options.showVertices] - Whether to show vertex points
 * @param {string} [options.lineChar] - Override character for lines
 * @param {string} [options.vertexChar] - Override character for vertices
 */
export const renderFrame = (buffer, container, dimensions, points, lines = [], options = {}) => {
    const { maxEdges = Infinity, showVertices = true, lineChar, vertexChar = VERTEX_CHAR } = options

    // Edge decimation for complex models
    const step = lines.length > maxEdges ? Math.ceil(lines.length / maxEdges) : 1

    for (let i = 0; i < lines.length; i += step) {
        const line = lines[i]
        drawLineToBuffer(buffer, line.start, line.end, dimensions.width, dimensions.height, lineChar)
    }

    // Render vertices on top
    if (showVertices) {
        for (const pt of points) {
            const { x, y } = renderPoint(pt, dimensions.width, dimensions.height)
            plotToBuffer(buffer, Math.floor(x), Math.floor(y), pt.z - 0.001, vertexChar)
        }
    }
}

/**
 * Render a 3D model
 * @param {FrameBuffer} buffer
 * @param {Model3D} model
 * @param {Point[]} transformedVertices
 * @param {HTMLDivElement} container
 * @param {Object} dimensions
 * @param {Object} [options]
 */
export const renderModel = (buffer, model, transformedVertices, container, dimensions, options = {}) => {
    // Validate and filter edges to ensure all indices are valid
    const maxIndex = transformedVertices.length - 1
    const validEdges = model.edges.filter(([i, j]) => {
        return typeof i === 'number' && typeof j === 'number' &&
            i >= 0 && j >= 0 &&
            i <= maxIndex && j <= maxIndex &&
            i !== j &&
            transformedVertices[i] && transformedVertices[j]
    })

    const lines = validEdges.map(([i, j]) => ({
        start: transformedVertices[i],
        end: transformedVertices[j]
    }))
    renderFrame(buffer, container, dimensions, transformedVertices, lines, options)
}

// ============ UTILITY FUNCTIONS ============

/**
 * Calculate distance between two points
 * @param {Point} a
 * @param {Point} b
 * @returns {number}
 */
export const distance = (a, b) => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dz = a.z - b.z
    return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate center of a model
 * @param {Point[]} vertices
 * @returns {Point}
 */
export const getCenter = (vertices) => {
    const sum = vertices.reduce((acc, v) => ({
        x: acc.x + v.x,
        y: acc.y + v.y,
        z: acc.z + v.z
    }), { x: 0, y: 0, z: 0 })
    return {
        x: sum.x / vertices.length,
        y: sum.y / vertices.length,
        z: sum.z / vertices.length
    }
}

/**
 * Lerp between two values
 * @param {number} a
 * @param {number} b
 * @param {number} t
 * @returns {number}
 */
export const lerp = (a, b, t) => a + (b - a) * t

/**
 * Clamp a value between min and max
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
