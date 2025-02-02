// Boundary system for collision detection
class BoundarySystem {
    constructor() {
        // Room boundaries defined as lines (walls)
        this.boundaries = [];
        // Furniture/objects defined as rectangles or circles
        this.objects = [];
        // Fixed y-value for camera height
        this.fixedHeight = -0.2;
        // Collision buffer distance
        this.collisionBuffer = 0.3;
    }

    // Add a wall boundary (line segment)
    addWall(x1, z1, x2, z2) {
        this.boundaries.push({
            type: 'wall',
            x1, z1, x2, z2
        });
    }

    // Add a rectangular object
    addRectObject(x, z, width, depth, rotation = 0) {
        this.objects.push({
            type: 'rectangle',
            x, z,
            width, depth,
            rotation
        });
    }

    // Add a circular object
    addCircularObject(x, z, radius) {
        this.objects.push({
            type: 'circle',
            x, z,
            radius
        });
    }

    // Check if a point collides with any boundary
    checkCollision(x, z) {
        // Check walls
        for (const wall of this.boundaries) {
            if (this.pointLineDistance(x, z, wall) < this.collisionBuffer) {
                return true;
            }
        }

        // Check objects
        for (const obj of this.objects) {
            if (obj.type === 'circle') {
                const dist = Math.hypot(x - obj.x, z - obj.z);
                if (dist < (obj.radius + this.collisionBuffer)) {
                    return true;
                }
            } else if (obj.type === 'rectangle') {
                if (this.pointRectangleCollision(x, z, obj)) {
                    return true;
                }
            }
        }

        return false;
    }

    // Calculate distance from point to line segment (wall)
    pointLineDistance(x, z, wall) {
        const A = x - wall.x1;
        const B = z - wall.z1;
        const C = wall.x2 - wall.x1;
        const D = wall.z2 - wall.z1;

        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;

        if (len_sq !== 0) {
            param = dot / len_sq;
        }

        let xx, zz;

        if (param < 0) {
            xx = wall.x1;
            zz = wall.z1;
        } else if (param > 1) {
            xx = wall.x2;
            zz = wall.z2;
        } else {
            xx = wall.x1 + param * C;
            zz = wall.z1 + param * D;
        }

        return Math.hypot(x - xx, z - zz);
    }

    // Check collision with rectangular object
    pointRectangleCollision(x, z, rect) {
        // Transform point to rectangle's local space
        const cos = Math.cos(-rect.rotation);
        const sin = Math.sin(-rect.rotation);
        const dx = x - rect.x;
        const dz = z - rect.z;
        
        const localX = dx * cos - dz * sin;
        const localZ = dx * sin + dz * cos;

        // Check if point is inside rectangle bounds (with buffer)
        return Math.abs(localX) < (rect.width/2 + this.collisionBuffer) &&
               Math.abs(localZ) < (rect.depth/2 + this.collisionBuffer);
    }

    // Validate and adjust position if needed
    validatePosition(x, z) {
        if (this.checkCollision(x, z)) {
            return null; // Position is invalid
        }
        return { x, z };
    }

    // Get fixed height
    getFixedHeight() {
        return this.fixedHeight;
    }
}

export default BoundarySystem;