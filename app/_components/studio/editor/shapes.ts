export class Point {
  constructor(public x: number, public y: number) {}

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y
  }

  toString(): string {
    return `${this.x},${this.y}`
  }

  static from(p: Point): Point {
    return new Point(p.x, p.y)
  }

  static zero(): Point {
    return new Point(0, 0)
  }
}

/**
 * Generates points for a line using Bresenham's line algorithm
 * @param p1 - Starting point
 * @param p2 - Ending point
 * @returns Array of points along the line
 */
export function line(p1: Point, p2: Point): Point[] {
  if (p1.equals(p2)) return [Point.from(p1)]

  const points: Point[] = []

  const deltaX = Math.abs(p2.x - p1.x)
  const deltaYNegative = -Math.abs(p2.y - p1.y)

  const stepX = p1.x < p2.x ? 1 : -1
  const stepY = p1.y < p2.y ? 1 : -1

  let errorTerm = deltaX + deltaYNegative

  let currentX = p1.x
  let currentY = p1.y

  while (true) {
    points.push(new Point(currentX, currentY))

    if (currentX === p2.x && currentY === p2.y) break

    const doubleError = 2 * errorTerm

    if (doubleError >= deltaYNegative) {
      errorTerm += deltaYNegative
      currentX += stepX
    }

    if (doubleError <= deltaX) {
      errorTerm += deltaX
      currentY += stepY
    }
  }

  return points
}

/**
 * Generate points for a circle using optimized Midpoint Circle Algorithm
 * @param r - Radius of the circle
 * @param pc - Center point of the circle
 * @returns Array of points forming the circle
 */
export function circle(radius: number, center: Point): Point[] {
  if (radius <= 0) return []
  if (radius === 1) return [Point.from(center)]

  const octantPoints: Point[] = []

  let currentX = 0
  let currentY = radius
  let decisionParameter = 1 - radius

  octantPoints.push(new Point(currentX, currentY))

  while (currentX <= currentY) {
    currentX++

    if (decisionParameter < 0) {
      octantPoints.push(new Point(currentX, currentY))
      decisionParameter = decisionParameter + 2 * currentX + 1
    } else {
      currentY--
      octantPoints.push(new Point(currentX, currentY))
      decisionParameter = decisionParameter + 2 * currentX + 1 - 2 * currentY
    }
  }

  const fullCircle = _sym8(octantPoints)

  for (const point of fullCircle) {
    point.x += center.x
    point.y += center.y
  }

  return fullCircle
}

/**
 * Helper function for generating all 8 octants of a circle
 * @param points - Points from the first octant
 * @returns Points for all 8 octants
 */
function _sym8(points: Point[]): Point[] {
  const transforms = [
    (p: Point) => new Point(p.x, p.y), // original
    (p: Point) => new Point(p.y, p.x), // swap x,y
    (p: Point) => new Point(-p.y, p.x), // rotate 90° clockwise
    (p: Point) => new Point(-p.x, p.y), // reflect x
    (p: Point) => new Point(-p.x, -p.y), // rotate 180°
    (p: Point) => new Point(-p.y, -p.x), // rotate 270° clockwise
    (p: Point) => new Point(p.y, -p.x), // reflect y
    (p: Point) => new Point(p.x, -p.y), // reflect diagonal
  ]

  const uniquePoints = new Set<string>()
  const result: Point[] = []

  for (const point of points) {
    for (const transform of transforms) {
      const newPoint = transform(point)
      const key = `${newPoint.x},${newPoint.y}`

      if (!uniquePoints.has(key)) {
        uniquePoints.add(key)
        result.push(newPoint)
      }
    }
  }

  return result
}
