export class Point {
  constructor(public x: number, public y: number) {}
}

/**
 * Generates points for a line using Bresenham's line algorithm
 * @param p1 - Starting point
 * @param p2 - Ending point
 * @returns Array of points along the line
 */
export function line(p1: Point, p2: Point): Point[] {
  const points: Point[] = []
  const dx = Math.abs(p2.x - p1.x)
  const sx = p1.x < p2.x ? 1 : -1
  const dy = -Math.abs(p2.y - p1.y)
  const sy = p1.y < p2.y ? 1 : -1
  let err = dx + dy

  let x1 = p1.x
  let y1 = p1.y

  while (true) {
    points.push(new Point(x1, y1))

    if (x1 === p2.x && y1 === p2.y) {
      break
    }

    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x1 += sx
    }
    if (e2 <= dx) {
      err += dx
      y1 += sy
    }
  }

  return points
}

/**
 * Generate points for a circle using Midpoint Circle Algorithm
 * @param r - Radius of the circle
 * @param pc - Center point of the circle
 * @returns Array of points forming the circle
 */
export function circle(r: number, pc: Point): Point[] {
  const points: Point[] = []
  let x = 0
  let y = r

  points.push(new Point(x, y))

  let p = 1 - r

  while (x <= y) {
    x++

    if (p < 0) {
      points.push(new Point(x, y))
      p = p + 2 * x + 1
    } else {
      y--
      points.push(new Point(x, y))
      p = p + 2 * x + 1 - 2 * y
    }
  }

  const fullCircle = _sym8(points)

  for (const pt of fullCircle) {
    pt.x += pc.x
    pt.y += pc.y
  }

  return fullCircle
}

/**
 * Helper function for generating all 8 octants of a circle
 * @param points - Points from the first octant
 * @returns Points for all 8 octants
 */
function _sym8(points: Point[]): Point[] {
  const nPoints: Point[] = [...points]

  for (const p of points) {
    nPoints.push(new Point(p.y, p.x))
  }
  for (const p of points) {
    nPoints.push(new Point(-p.y, p.x))
  }
  for (const p of points) {
    nPoints.push(new Point(-p.x, p.y))
  }
  for (const p of points) {
    nPoints.push(new Point(-p.x, -p.y))
  }
  for (const p of points) {
    nPoints.push(new Point(-p.y, -p.x))
  }
  for (const p of points) {
    nPoints.push(new Point(p.y, -p.x))
  }
  for (const p of points) {
    nPoints.push(new Point(p.x, -p.y))
  }

  return nPoints
}

/**
 * Generate points for an ellipse using the Midpoint Ellipse Algorithm
 * @param rx - X radius (semi-major axis)
 * @param ry - Y radius (semi-minor axis)
 * @param pc - Center point of the ellipse
 * @returns Array of points forming the ellipse
 */
export function ellipse(rx: number, ry: number, pc: Point): Point[] {
  const points: Point[] = []
  let x = 0
  let y = ry

  let p1 = ry * ry - rx * rx * ry + 0.25 * rx * rx
  let dx = 2 * ry * ry * x
  let dy = 2 * rx * rx * y

  while (dx < dy) {
    points.push(new Point(x, y))

    if (p1 < 0) {
      x++
      dx += 2 * ry * ry
      p1 += dx + ry * ry
    } else {
      x++
      y--
      dx += 2 * ry * ry
      dy -= 2 * rx * rx
      p1 += dx - dy + ry * ry
    }
  }

  let p2 =
    ry * ry * ((x + 0.5) * (x + 0.5)) +
    rx * rx * ((y - 1) * (y - 1)) -
    rx * rx * ry * ry

  while (y >= 0) {
    points.push(new Point(x, y))

    if (p2 > 0) {
      y--
      dy -= 2 * rx * rx
      p2 += rx * rx - dy
    } else {
      y--
      x++
      dx += 2 * ry * ry
      dy -= 2 * rx * rx
      p2 += dx - dy + rx * rx
    }
  }

  const fullEllipse = _sym4(points)

  for (const pt of fullEllipse) {
    pt.x += pc.x
    pt.y += pc.y
  }

  return fullEllipse
}

/**
 * Helper function for generating all 4 quadrants of an ellipse
 * @param points - Points from the first quadrant
 * @returns Points for all 4 quadrants
 */
function _sym4(points: Point[]): Point[] {
  const nPoints: Point[] = [...points]

  for (const p of points) {
    nPoints.push(new Point(-p.x, p.y))
  }
  for (const p of points) {
    nPoints.push(new Point(-p.x, -p.y))
  }
  for (const p of points) {
    nPoints.push(new Point(p.x, -p.y))
  }

  return nPoints
}
