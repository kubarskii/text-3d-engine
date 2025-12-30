// @ts-check
// ============ 3D MODELS LIBRARY ============
import { point } from './engine.js'

/**
 * @typedef {import('./engine.js').Point} Point
 * @typedef {import('./engine.js').Model3D} Model3D
 */

// ============ PRIMITIVE SHAPES ============

/**
 * Create a cube model
 * @param {number} size - Half-size of the cube
 * @returns {Model3D}
 */
export const createCube = (size = 0.5) => ({
    vertices: [
        point(-size, -size, -size),
        point(size, -size, -size),
        point(size, size, -size),
        point(-size, size, -size),
        point(-size, -size, size),
        point(size, -size, size),
        point(size, size, size),
        point(-size, size, size),
    ],
    edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
    ]
})

/**
 * Create a pyramid model
 * @param {number} size - Base size
 * @param {number} height - Height of pyramid
 * @returns {Model3D}
 */
export const createPyramid = (size = 0.5, height = 0.7) => ({
    vertices: [
        point(-size, -height / 2, -size),
        point(size, -height / 2, -size),
        point(size, -height / 2, size),
        point(-size, -height / 2, size),
        point(0, height / 2, 0),
    ],
    edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [0, 4], [1, 4], [2, 4], [3, 4],
    ]
})

/**
 * Create a tetrahedron model
 * @param {number} size
 * @returns {Model3D}
 */
export const createTetrahedron = (size = 0.5) => {
    const h = size * Math.sqrt(2 / 3)
    const r = size / Math.sqrt(3)
    return {
        vertices: [
            point(0, h, 0),
            point(-size / 2, -h / 2, r),
            point(size / 2, -h / 2, r),
            point(0, -h / 2, -r * 2),
        ],
        edges: [
            [0, 1], [0, 2], [0, 3],
            [1, 2], [2, 3], [3, 1],
        ]
    }
}

/**
 * Create an octahedron model
 * @param {number} size
 * @returns {Model3D}
 */
export const createOctahedron = (size = 0.5) => ({
    vertices: [
        point(0, size, 0),
        point(0, -size, 0),
        point(size, 0, 0),
        point(-size, 0, 0),
        point(0, 0, size),
        point(0, 0, -size),
    ],
    edges: [
        [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 4], [4, 3], [3, 5], [5, 2],
    ]
})

/**
 * Create an icosahedron model
 * @param {number} size
 * @returns {Model3D}
 */
export const createIcosahedron = (size = 0.5) => {
    const phi = (1 + Math.sqrt(5)) / 2
    const a = size
    const b = size / phi
    return {
        vertices: [
            point(0, b, -a), point(b, a, 0), point(-b, a, 0),
            point(0, b, a), point(0, -b, a), point(-a, 0, b),
            point(0, -b, -a), point(a, 0, -b), point(a, 0, b),
            point(-a, 0, -b), point(b, -a, 0), point(-b, -a, 0),
        ],
        edges: [
            [0, 1], [0, 2], [0, 6], [0, 7], [0, 9],
            [1, 2], [1, 3], [1, 7], [1, 8],
            [2, 3], [2, 5], [2, 9],
            [3, 4], [3, 5], [3, 8],
            [4, 5], [4, 8], [4, 10], [4, 11],
            [5, 9], [5, 11],
            [6, 7], [6, 9], [6, 10], [6, 11],
            [7, 8], [7, 10],
            [8, 10],
            [9, 11],
            [10, 11],
        ]
    }
}

/**
 * Create a sphere model
 * @param {number} radius
 * @param {number} segments
 * @param {number} rings
 * @returns {Model3D}
 */
export const createSphere = (radius = 0.5, segments = 12, rings = 8) => {
    const vertices = []
    const edges = []

    for (let ring = 0; ring <= rings; ring++) {
        const phi = (ring / rings) * Math.PI
        for (let seg = 0; seg < segments; seg++) {
            const theta = (seg / segments) * Math.PI * 2
            vertices.push(point(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            ))
        }
    }

    for (let ring = 0; ring < rings; ring++) {
        for (let seg = 0; seg < segments; seg++) {
            const curr = ring * segments + seg
            const next = ring * segments + (seg + 1) % segments
            const below = (ring + 1) * segments + seg
            edges.push([curr, next])
            edges.push([curr, below])
        }
    }

    return { vertices, edges }
}

/**
 * Create a torus model
 * @param {number} majorRadius
 * @param {number} minorRadius
 * @param {number} majorSegments
 * @param {number} minorSegments
 * @returns {Model3D}
 */
export const createTorus = (majorRadius = 0.4, minorRadius = 0.15, majorSegments = 16, minorSegments = 8) => {
    const vertices = []
    const edges = []

    for (let i = 0; i < majorSegments; i++) {
        const theta = (i / majorSegments) * Math.PI * 2
        for (let j = 0; j < minorSegments; j++) {
            const phi = (j / minorSegments) * Math.PI * 2
            const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta)
            const y = minorRadius * Math.sin(phi)
            const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta)
            vertices.push(point(x, y, z))
        }
    }

    for (let i = 0; i < majorSegments; i++) {
        for (let j = 0; j < minorSegments; j++) {
            const curr = i * minorSegments + j
            const nextMinor = i * minorSegments + (j + 1) % minorSegments
            const nextMajor = ((i + 1) % majorSegments) * minorSegments + j
            edges.push([curr, nextMinor])
            edges.push([curr, nextMajor])
        }
    }

    return { vertices, edges }
}

// ============ GAME MODELS ============

/**
 * Create a ship/arrow model
 * @param {number} size
 * @returns {Model3D}
 */
export const createShip = (size = 0.3) => ({
    vertices: [
        point(0, 0, -size * 1.5),
        point(-size, 0, size),
        point(size, 0, size),
        point(0, 0, size * 0.5),
        point(0, size * 0.3, 0),
    ],
    edges: [
        [0, 1], [0, 2], [1, 3], [2, 3],
        [0, 4], [1, 4], [2, 4], [3, 4],
    ]
})

/**
 * Create a star model
 * @param {number} size
 * @returns {Model3D}
 */
export const createStar = (size = 0.2) => {
    const vertices = []
    const edges = []
    const points = 5

    for (let i = 0; i < points * 2; i++) {
        const angle = (i / (points * 2)) * Math.PI * 2
        const r = i % 2 === 0 ? size : size * 0.4
        vertices.push(point(
            Math.cos(angle) * r,
            Math.sin(angle) * r,
            0
        ))
    }

    for (let i = 0; i < points * 2; i++) {
        edges.push([i, (i + 1) % (points * 2)])
    }

    return { vertices, edges }
}

// ============ SHOOTER GAME MODELS ============

/**
 * Create a demon/enemy model (bipedal monster)
 * @param {number} size
 * @returns {Model3D}
 */
export const createDemon = (size = 0.3) => {
    const h = size * 1.5
    return {
        vertices: [
            // Body
            point(0, h * 0.5, 0),           // 0: head top
            point(-size * 0.3, h * 0.3, 0), // 1: head left
            point(size * 0.3, h * 0.3, 0),  // 2: head right
            point(0, h * 0.2, -size * 0.2), // 3: head front
            point(0, h * 0.2, size * 0.2),  // 4: head back
            // Horns
            point(-size * 0.5, h * 0.7, -size * 0.1), // 5: left horn
            point(size * 0.5, h * 0.7, -size * 0.1),  // 6: right horn
            // Torso
            point(-size * 0.4, 0, 0),       // 7: left shoulder
            point(size * 0.4, 0, 0),        // 8: right shoulder
            point(-size * 0.3, -h * 0.3, 0),// 9: left hip
            point(size * 0.3, -h * 0.3, 0), // 10: right hip
            point(0, h * 0.1, 0),           // 11: neck
            point(0, -h * 0.1, 0),          // 12: waist
            // Arms
            point(-size * 0.7, -h * 0.1, -size * 0.3), // 13: left hand
            point(size * 0.7, -h * 0.1, -size * 0.3),  // 14: right hand
            // Legs
            point(-size * 0.3, -h * 0.7, 0), // 15: left foot
            point(size * 0.3, -h * 0.7, 0),  // 16: right foot
        ],
        edges: [
            // Head
            [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 3], [2, 3], [1, 4], [2, 4],
            // Horns
            [1, 5], [2, 6],
            // Neck to body
            [3, 11], [4, 11],
            [11, 7], [11, 8],
            // Torso
            [7, 8], [7, 12], [8, 12],
            [12, 9], [12, 10], [9, 10],
            // Arms
            [7, 13], [8, 14],
            // Legs
            [9, 15], [10, 16],
        ]
    }
}

/**
 * Create a skeleton enemy model
 * @param {number} size
 * @returns {Model3D}
 */
export const createSkeleton = (size = 0.25) => {
    const h = size * 1.4
    return {
        vertices: [
            // Skull
            point(0, h * 0.6, 0),            // 0: skull top
            point(-size * 0.2, h * 0.45, 0), // 1: skull left
            point(size * 0.2, h * 0.45, 0),  // 2: skull right
            point(0, h * 0.4, -size * 0.15), // 3: face
            // Spine
            point(0, h * 0.35, 0),  // 4: neck
            point(0, h * 0.1, 0),   // 5: upper spine
            point(0, -h * 0.1, 0),  // 6: lower spine
            point(0, -h * 0.25, 0), // 7: pelvis
            // Ribcage
            point(-size * 0.3, h * 0.2, -size * 0.1),  // 8: left ribs
            point(size * 0.3, h * 0.2, -size * 0.1),   // 9: right ribs
            point(-size * 0.25, h * 0.0, -size * 0.1), // 10: left ribs bottom
            point(size * 0.25, h * 0.0, -size * 0.1),  // 11: right ribs bottom
            // Arms
            point(-size * 0.35, h * 0.25, 0), // 12: left shoulder
            point(size * 0.35, h * 0.25, 0),  // 13: right shoulder
            point(-size * 0.5, h * 0.0, 0),   // 14: left elbow
            point(size * 0.5, h * 0.0, 0),    // 15: right elbow
            point(-size * 0.55, -h * 0.2, -size * 0.2), // 16: left hand
            point(size * 0.55, -h * 0.2, -size * 0.2),  // 17: right hand
            // Legs
            point(-size * 0.2, -h * 0.25, 0), // 18: left hip
            point(size * 0.2, -h * 0.25, 0),  // 19: right hip
            point(-size * 0.25, -h * 0.5, 0), // 20: left knee
            point(size * 0.25, -h * 0.5, 0),  // 21: right knee
            point(-size * 0.2, -h * 0.75, 0), // 22: left foot
            point(size * 0.2, -h * 0.75, 0),  // 23: right foot
        ],
        edges: [
            // Skull
            [0, 1], [0, 2], [1, 3], [2, 3], [1, 2],
            // Spine
            [3, 4], [4, 5], [5, 6], [6, 7],
            // Ribcage
            [5, 8], [5, 9], [8, 10], [9, 11], [10, 6], [11, 6],
            [8, 9], [10, 11],
            // Arms
            [5, 12], [5, 13],
            [12, 14], [13, 15],
            [14, 16], [15, 17],
            // Legs
            [7, 18], [7, 19],
            [18, 20], [19, 21],
            [20, 22], [21, 23],
        ]
    }
}

/**
 * Create a bull/charging enemy model
 * @param {number} size
 * @returns {Model3D}
 */
export const createBull = (size = 0.4) => {
    return {
        vertices: [
            // Head
            point(0, size * 0.3, -size * 0.8),    // 0: snout
            point(-size * 0.3, size * 0.4, -size * 0.5), // 1: head left
            point(size * 0.3, size * 0.4, -size * 0.5),  // 2: head right
            point(0, size * 0.5, -size * 0.4),    // 3: head top
            // Horns
            point(-size * 0.6, size * 0.6, -size * 0.3), // 4: left horn
            point(size * 0.6, size * 0.6, -size * 0.3),  // 5: right horn
            // Body
            point(-size * 0.4, size * 0.3, -size * 0.2), // 6: front left
            point(size * 0.4, size * 0.3, -size * 0.2),  // 7: front right
            point(-size * 0.5, size * 0.4, size * 0.2),  // 8: mid left
            point(size * 0.5, size * 0.4, size * 0.2),   // 9: mid right
            point(-size * 0.4, size * 0.3, size * 0.6),  // 10: back left
            point(size * 0.4, size * 0.3, size * 0.6),   // 11: back right
            point(0, size * 0.5, size * 0.3),     // 12: back top
            // Legs
            point(-size * 0.3, -size * 0.3, -size * 0.1), // 13: front left leg
            point(size * 0.3, -size * 0.3, -size * 0.1),  // 14: front right leg
            point(-size * 0.3, -size * 0.3, size * 0.4),  // 15: back left leg
            point(size * 0.3, -size * 0.3, size * 0.4),   // 16: back right leg
            // Tail
            point(0, size * 0.4, size * 0.9),     // 17: tail
        ],
        edges: [
            // Head
            [0, 1], [0, 2], [1, 3], [2, 3], [1, 2],
            // Horns
            [1, 4], [2, 5],
            // Head to body
            [1, 6], [2, 7], [3, 6], [3, 7],
            // Body
            [6, 7], [6, 8], [7, 9], [8, 9],
            [8, 10], [9, 11], [10, 11],
            [8, 12], [9, 12], [12, 10], [12, 11],
            // Legs
            [6, 13], [7, 14], [10, 15], [11, 16],
            // Tail
            [10, 17], [11, 17],
        ]
    }
}

/**
 * Create a spider enemy model
 * @param {number} size
 * @returns {Model3D}
 */
export const createSpider = (size = 0.3) => {
    const vertices = [
        // Body
        point(0, size * 0.2, 0),           // 0: body top
        point(0, 0, -size * 0.4),          // 1: head
        point(0, 0, size * 0.5),           // 2: abdomen
        point(-size * 0.2, 0, 0),          // 3: body left
        point(size * 0.2, 0, 0),           // 4: body right
    ]
    const edges = [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 3], [1, 4], [2, 3], [2, 4],
    ]

    // Add 8 legs
    const legAngles = [-0.8, -0.4, 0.4, 0.8]
    let idx = 5
    for (const angle of legAngles) {
        // Left legs
        const lx = -size * 0.3
        const lz = angle * size
        vertices.push(point(lx - size * 0.4, -size * 0.1, lz))           // knee
        vertices.push(point(lx - size * 0.7, -size * 0.3, lz * 1.2))     // foot
        edges.push([3, idx])
        edges.push([idx, idx + 1])
        idx += 2

        // Right legs
        const rx = size * 0.3
        vertices.push(point(rx + size * 0.4, -size * 0.1, lz))
        vertices.push(point(rx + size * 0.7, -size * 0.3, lz * 1.2))
        edges.push([4, idx])
        edges.push([idx, idx + 1])
        idx += 2
    }

    return { vertices, edges }
}

/**
 * Create a flying enemy (bat/gargoyle)
 * @param {number} size
 * @returns {Model3D}
 */
export const createFlyer = (size = 0.3) => {
    return {
        vertices: [
            // Body
            point(0, 0, -size * 0.5),     // 0: head
            point(0, size * 0.15, 0),     // 1: body top
            point(0, -size * 0.1, 0),     // 2: body bottom
            point(0, 0, size * 0.4),      // 3: tail
            // Left wing
            point(-size * 0.2, 0, -size * 0.1),   // 4: wing base
            point(-size * 0.8, size * 0.2, 0),    // 5: wing tip top
            point(-size * 0.7, -size * 0.1, size * 0.2), // 6: wing tip back
            point(-size * 0.5, 0, -size * 0.2),   // 7: wing front
            // Right wing
            point(size * 0.2, 0, -size * 0.1),    // 8: wing base
            point(size * 0.8, size * 0.2, 0),     // 9: wing tip top
            point(size * 0.7, -size * 0.1, size * 0.2),  // 10: wing tip back
            point(size * 0.5, 0, -size * 0.2),    // 11: wing front
        ],
        edges: [
            // Body
            [0, 1], [0, 2], [1, 3], [2, 3], [1, 2],
            // Left wing
            [1, 4], [2, 4], [4, 5], [4, 6], [4, 7],
            [5, 6], [5, 7], [6, 3],
            // Right wing
            [1, 8], [2, 8], [8, 9], [8, 10], [8, 11],
            [9, 10], [9, 11], [10, 3],
        ]
    }
}

/**
 * Create a projectile/bullet model
 * @param {number} size
 * @returns {Model3D}
 */
export const createBullet = (size = 0.05) => ({
    vertices: [
        point(0, 0, -size * 2),      // tip
        point(-size, -size, size),   // back corners
        point(size, -size, size),
        point(size, size, size),
        point(-size, size, size),
    ],
    edges: [
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 2], [2, 3], [3, 4], [4, 1],
    ]
})

/**
 * Create a muzzle flash effect
 * @param {number} size
 * @returns {Model3D}
 */
export const createMuzzleFlash = (size = 0.15) => {
    const vertices = []
    const edges = []
    const rays = 8

    vertices.push(point(0, 0, 0)) // center

    for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2
        const len = size * (0.7 + Math.random() * 0.6)
        vertices.push(point(
            Math.cos(angle) * len,
            Math.sin(angle) * len,
            -size * 0.5
        ))
        edges.push([0, i + 1])
    }

    return { vertices, edges }
}

/**
 * Create explosion effect model
 * @param {number} size
 * @returns {Model3D}
 */
export const createExplosion = (size = 0.3) => {
    const vertices = [point(0, 0, 0)]
    const edges = []
    const spikes = 12

    for (let i = 0; i < spikes; i++) {
        const theta = (i / spikes) * Math.PI * 2
        const phi = (Math.random() - 0.5) * Math.PI
        const r = size * (0.5 + Math.random() * 0.5)

        vertices.push(point(
            r * Math.cos(theta) * Math.cos(phi),
            r * Math.sin(phi),
            r * Math.sin(theta) * Math.cos(phi)
        ))
        edges.push([0, i + 1])
    }

    // Connect some outer points
    for (let i = 1; i < spikes; i += 2) {
        edges.push([i, ((i + 1) % spikes) + 1])
    }

    return { vertices, edges }
}

/**
 * Create a health pickup model
 * @param {number} size
 * @returns {Model3D}
 */
export const createHealthPack = (size = 0.15) => ({
    vertices: [
        // Cross shape
        point(-size, 0, 0),
        point(size, 0, 0),
        point(0, -size, 0),
        point(0, size, 0),
        point(0, 0, -size * 0.3),
        point(0, 0, size * 0.3),
        // Box outline
        point(-size * 0.5, -size * 0.5, 0),
        point(size * 0.5, -size * 0.5, 0),
        point(size * 0.5, size * 0.5, 0),
        point(-size * 0.5, size * 0.5, 0),
    ],
    edges: [
        [0, 1], [2, 3], // cross
        [0, 4], [1, 4], [2, 4], [3, 4],
        [0, 5], [1, 5], [2, 5], [3, 5],
        [6, 7], [7, 8], [8, 9], [9, 6], // box
    ]
})

/**
 * Create ammo pickup model
 * @param {number} size
 * @returns {Model3D}
 */
export const createAmmoPack = (size = 0.12) => ({
    vertices: [
        // Bullet shapes
        point(-size * 0.6, size * 0.3, 0),
        point(-size * 0.6, -size * 0.3, 0),
        point(-size * 0.6, 0, -size * 0.5),

        point(0, size * 0.3, 0),
        point(0, -size * 0.3, 0),
        point(0, 0, -size * 0.5),

        point(size * 0.6, size * 0.3, 0),
        point(size * 0.6, -size * 0.3, 0),
        point(size * 0.6, 0, -size * 0.5),
    ],
    edges: [
        [0, 1], [0, 2], [1, 2],
        [3, 4], [3, 5], [4, 5],
        [6, 7], [6, 8], [7, 8],
    ]
})

/**
 * Create crosshair model
 * @param {number} size
 * @returns {Model3D}
 */
export const createCrosshair = (size = 0.05) => ({
    vertices: [
        point(-size, 0, 0),
        point(-size * 0.3, 0, 0),
        point(size * 0.3, 0, 0),
        point(size, 0, 0),
        point(0, -size, 0),
        point(0, -size * 0.3, 0),
        point(0, size * 0.3, 0),
        point(0, size, 0),
    ],
    edges: [
        [0, 1], [2, 3], [4, 5], [6, 7],
    ]
})

/**
 * Create a gun/weapon model (first person view)
 * @param {number} size
 * @returns {Model3D}
 */
export const createGun = (size = 0.2) => ({
    vertices: [
        // Barrel
        point(0, -size * 0.1, -size * 1.5),   // 0: muzzle
        point(-size * 0.08, -size * 0.15, -size * 0.5), // 1: barrel left
        point(size * 0.08, -size * 0.15, -size * 0.5),  // 2: barrel right
        point(-size * 0.08, -size * 0.05, -size * 0.5), // 3: barrel top left
        point(size * 0.08, -size * 0.05, -size * 0.5),  // 4: barrel top right
        // Body
        point(-size * 0.12, -size * 0.2, 0),  // 5: body left
        point(size * 0.12, -size * 0.2, 0),   // 6: body right
        point(-size * 0.12, 0, 0),            // 7: body top left
        point(size * 0.12, 0, 0),             // 8: body top right
        // Grip
        point(-size * 0.1, -size * 0.5, size * 0.2),  // 9: grip left
        point(size * 0.1, -size * 0.5, size * 0.2),   // 10: grip right
        point(-size * 0.1, -size * 0.2, size * 0.3),  // 11: grip back left
        point(size * 0.1, -size * 0.2, size * 0.3),   // 12: grip back right
    ],
    edges: [
        // Barrel
        [0, 1], [0, 2], [0, 3], [0, 4],
        [1, 2], [3, 4], [1, 3], [2, 4],
        // Barrel to body
        [1, 5], [2, 6], [3, 7], [4, 8],
        // Body
        [5, 6], [7, 8], [5, 7], [6, 8],
        // Grip
        [5, 9], [6, 10], [9, 10],
        [5, 11], [6, 12], [11, 12],
        [9, 11], [10, 12],
    ]
})

// ============ 3D TEXT ============

/**
 * Create a thick 3D stroke from a 2D path with box-like extrusion
 * Each point becomes a rectangular cross-section for more volume
 * @param {number[][]} path - Array of [x, y] coordinates
 * @param {number} depth - Extrusion depth (Z axis)
 * @param {number} thickness - Stroke thickness
 * @param {number} offsetX - X offset for positioning
 * @returns {{ vertices: Point[], edges: [number, number][] }}
 */
const extrudeThickLetter = (path, depth, thickness, offsetX = 0) => {
    const vertices = []
    const edges = []
    const halfDepth = depth / 2
    const halfThick = thickness / 2

    // For each point, create 4 vertices (corners of rectangular cross-section)
    for (const [x, y] of path) {
        // Front face - outer and inner
        vertices.push(point(x + offsetX - halfThick, y - halfThick, -halfDepth))  // front bottom-left
        vertices.push(point(x + offsetX + halfThick, y - halfThick, -halfDepth))  // front bottom-right
        vertices.push(point(x + offsetX + halfThick, y + halfThick, -halfDepth))  // front top-right
        vertices.push(point(x + offsetX - halfThick, y + halfThick, -halfDepth))  // front top-left
        // Back face
        vertices.push(point(x + offsetX - halfThick, y - halfThick, halfDepth))   // back bottom-left
        vertices.push(point(x + offsetX + halfThick, y - halfThick, halfDepth))   // back bottom-right
        vertices.push(point(x + offsetX + halfThick, y + halfThick, halfDepth))   // back top-right
        vertices.push(point(x + offsetX - halfThick, y + halfThick, halfDepth))   // back top-left
    }

    const n = path.length
    // Connect each point's box
    for (let i = 0; i < n; i++) {
        const base = i * 8
        // Front face rectangle
        edges.push([base + 0, base + 1])
        edges.push([base + 1, base + 2])
        edges.push([base + 2, base + 3])
        edges.push([base + 3, base + 0])
        // Back face rectangle
        edges.push([base + 4, base + 5])
        edges.push([base + 5, base + 6])
        edges.push([base + 6, base + 7])
        edges.push([base + 7, base + 4])
        // Connecting edges (depth)
        edges.push([base + 0, base + 4])
        edges.push([base + 1, base + 5])
        edges.push([base + 2, base + 6])
        edges.push([base + 3, base + 7])
    }

    // Connect adjacent boxes along the path
    for (let i = 0; i < n - 1; i++) {
        const curr = i * 8
        const next = (i + 1) * 8
        // Connect corners between boxes
        edges.push([curr + 0, next + 0])
        edges.push([curr + 1, next + 1])
        edges.push([curr + 2, next + 2])
        edges.push([curr + 3, next + 3])
        edges.push([curr + 4, next + 4])
        edges.push([curr + 5, next + 5])
        edges.push([curr + 6, next + 6])
        edges.push([curr + 7, next + 7])
        // Diagonal bracing for more volume
        edges.push([curr + 1, next + 0])
        edges.push([curr + 2, next + 3])
        edges.push([curr + 5, next + 4])
        edges.push([curr + 6, next + 7])
    }

    return { vertices, edges }
}

/**
 * Create 3D text model spelling "3D" with thick volumetric letters
 * @param {number} scale - Scale factor
 * @returns {Model3D}
 */
export const createText3D = (scale = 0.15) => {
    const vertices = []
    const edges = []
    const depth = 0.6       // Increased depth
    const thickness = 0.12  // Stroke thickness

    // Letter "3" - curved shape with more points for smoother curve
    const letter3 = [
        [-0.25, 0.5],
        [0.1, 0.5],
        [0.3, 0.45],
        [0.4, 0.35],
        [0.4, 0.2],
        [0.35, 0.1],
        [0.2, 0.0],
        [0.35, -0.1],
        [0.4, -0.2],
        [0.4, -0.35],
        [0.3, -0.45],
        [0.1, -0.5],
        [-0.25, -0.5],
    ]

    // Letter "D" - with more points for smoother curve
    const letterD = [
        [-0.3, 0.5],
        [-0.3, -0.5],
        [0.0, -0.5],
        [0.2, -0.45],
        [0.35, -0.35],
        [0.4, -0.2],
        [0.4, 0.2],
        [0.35, 0.35],
        [0.2, 0.45],
        [0.0, 0.5],
        [-0.3, 0.5],
    ]

    // Inner vertical bar for D
    const dBar = [
        [-0.15, 0.35],
        [-0.15, -0.35],
    ]

    // Extrude letter "3"
    const l3 = extrudeThickLetter(letter3, depth, thickness, -0.65)
    const baseIdx3 = vertices.length
    vertices.push(...l3.vertices.map(v => point(v.x * scale, v.y * scale, v.z * scale)))
    edges.push(...l3.edges.map(([a, b]) => [a + baseIdx3, b + baseIdx3]))

    // Extrude letter "D" outline
    const lD = extrudeThickLetter(letterD, depth, thickness, 0.55)
    const baseDIdx = vertices.length
    vertices.push(...lD.vertices.map(v => point(v.x * scale, v.y * scale, v.z * scale)))
    edges.push(...lD.edges.map(([a, b]) => [a + baseDIdx, b + baseDIdx]))

    // Extrude D inner bar
    const lDBar = extrudeThickLetter(dBar, depth, thickness, 0.55)
    const baseBarIdx = vertices.length
    vertices.push(...lDBar.vertices.map(v => point(v.x * scale, v.y * scale, v.z * scale)))
    edges.push(...lDBar.edges.map(([a, b]) => [a + baseBarIdx, b + baseBarIdx]))

    return { vertices, edges }
}

/**
 * Create 3D text model spelling "HELLO" with thick volumetric letters
 * @param {number} scale - Scale factor
 * @returns {Model3D}
 */
export const createTextHello = (scale = 0.08) => {
    const vertices = []
    const edges = []
    const depth = 0.5       // Increased depth
    const thickness = 0.08  // Stroke thickness

    // Letter definitions as connected line paths with more points
    const letters = {
        H: [
            [[-0.3, 0.5], [-0.3, 0.0], [-0.3, -0.5]],           // left vertical
            [[0.3, 0.5], [0.3, 0.0], [0.3, -0.5]],               // right vertical
            [[-0.3, 0.0], [0.0, 0.0], [0.3, 0.0]],               // middle bar
        ],
        E: [
            [[-0.3, 0.5], [-0.3, 0.0], [-0.3, -0.5]],           // vertical
            [[-0.3, 0.5], [0.0, 0.5], [0.3, 0.5]],               // top
            [[-0.3, 0.0], [0.0, 0.0], [0.2, 0.0]],               // middle
            [[-0.3, -0.5], [0.0, -0.5], [0.3, -0.5]],           // bottom
        ],
        L: [
            [[-0.3, 0.5], [-0.3, 0.0], [-0.3, -0.5]],           // vertical
            [[-0.3, -0.5], [0.0, -0.5], [0.3, -0.5]],           // bottom
        ],
        O: [
            [
                [-0.3, 0.3], [-0.3, 0.0], [-0.3, -0.3],         // left
                [-0.2, -0.45], [0.0, -0.5], [0.2, -0.45],       // bottom curve
                [0.3, -0.3], [0.3, 0.0], [0.3, 0.3],             // right
                [0.2, 0.45], [0.0, 0.5], [-0.2, 0.45],           // top curve
                [-0.3, 0.3],                                      // close
            ],
        ],
    }

    const word = ['H', 'E', 'L', 'L', 'O']
    const spacing = 0.85

    word.forEach((char, charIdx) => {
        const offsetX = (charIdx - 2) * spacing
        const letterPaths = letters[char]

        for (const path of letterPaths) {
            const extruded = extrudeThickLetter(path, depth, thickness, offsetX)
            const baseIdx = vertices.length
            vertices.push(...extruded.vertices.map(v => point(v.x * scale, v.y * scale, v.z * scale)))
            edges.push(...extruded.edges.map(([a, b]) => [a + baseIdx, b + baseIdx]))
        }
    })

    return { vertices, edges }
}

// ============ GENERIC VOXEL TEXT ============

const PIXEL_FONT_3X5 = {
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    C: ["011", "100", "100", "100", "011"],
    D: ["110", "101", "101", "101", "110"],
    E: ["111", "100", "110", "100", "111"],
    F: ["111", "100", "110", "100", "100"],
    G: ["011", "100", "101", "101", "011"],
    H: ["101", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    J: ["011", "001", "001", "101", "010"],
    K: ["101", "101", "110", "101", "101"],
    L: ["100", "100", "100", "100", "111"],
    M: ["101", "111", "111", "101", "101"],
    N: ["101", "111", "111", "111", "101"],
    O: ["010", "101", "101", "101", "010"],
    P: ["110", "101", "110", "100", "100"],
    Q: ["010", "101", "101", "111", "011"],
    R: ["110", "101", "110", "101", "101"],
    S: ["011", "100", "010", "001", "110"],
    T: ["111", "010", "010", "010", "010"],
    U: ["101", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"],
    W: ["101", "101", "111", "111", "101"],
    X: ["101", "101", "010", "101", "101"],
    Y: ["101", "101", "010", "010", "010"],
    Z: ["111", "001", "010", "100", "111"],
    '0': ["111", "101", "101", "101", "111"],
    '1': ["010", "110", "010", "010", "111"],
    '2': ["111", "001", "111", "100", "111"],
    '3': ["111", "001", "111", "001", "111"],
    '4': ["101", "101", "111", "001", "001"],
    '5': ["111", "100", "111", "001", "111"],
    '6': ["111", "100", "111", "101", "111"],
    '7': ["111", "001", "010", "010", "010"],
    '8': ["111", "101", "111", "101", "111"],
    '9': ["111", "101", "111", "001", "111"],
    '?': ["111", "001", "011", "000", "010"],
    '!': ["010", "010", "010", "000", "010"],
    '#': ["101", "111", "101", "111", "101"],
}

const appendModel = (target, model) => {
    const offset = target.vertices.length
    target.vertices.push(...model.vertices)
    target.edges.push(...model.edges.map(([a, b]) => [a + offset, b + offset]))
}

const translateModel = (model, dx, dy, dz) => ({
    vertices: model.vertices.map(v => point(v.x + dx, v.y + dy, v.z + dz)),
    edges: [...model.edges]
})

/**
 * Create a voxel-style 3D text model from a simple 3x5 bitmap font
 * @param {string} text - text to render (supports A-Z, 0-9, !, ?, #, space)
 * @param {{ pixelSize?: number, depth?: number, letterSpacing?: number, lineSpacing?: number }} [options]
 * @returns {Model3D}
 */
export const createVoxelText = (text, options = {}) => {
    const {
        pixelSize = 0.3,
        depth = 0.3,
        letterSpacing = 0.25,
        lineSpacing = 0.35,
    } = options

    const lines = text.split(/\n/)
    const baseModel = { vertices: [], edges: [] }
    const halfPixel = pixelSize / 2

    lines.forEach((line, lineIdx) => {
        const upperLine = line.toUpperCase()
        let cursorX = 0
        const cursorY = -lineIdx * ((5 * pixelSize) + lineSpacing)

        for (const char of upperLine) {
            if (char === ' ') {
                cursorX += (3 * pixelSize) + letterSpacing
                continue
            }

            const bitmap = PIXEL_FONT_3X5[char] || PIXEL_FONT_3X5['?']
            bitmap.forEach((row, rowIdx) => {
                row.split('').forEach((pixel, colIdx) => {
                    if (pixel !== '1') return

                    const cube = createCube(halfPixel)
                    const offsetX = cursorX + (colIdx - 1) * pixelSize
                    const offsetY = cursorY + ((2 - rowIdx) * pixelSize)
                    const translated = translateModel(cube, offsetX, offsetY, 0)
                    appendModel(baseModel, translated)
                })
            })

            cursorX += (3 * pixelSize) + letterSpacing
        }
    })

    // Ensure some depth by translating the assembled text slightly along Z
    return translateModel(baseModel, 0, 0, depth)
}

