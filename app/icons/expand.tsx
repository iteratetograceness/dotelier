export function ExpandIcon({
  className,
  width = 25,
  height = 25,
}: {
  className?: string
  width?: number
  height?: number
}) {
  // Simple pixel-art external link icon - box with arrow pointing out
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 16 16'
      fill='currentColor'
      className={className}
      width={width}
      height={height}
      shapeRendering='crispEdges'
    >
      {/* Box */}
      <rect x='1' y='3' width='2' height='12' />
      <rect x='1' y='13' width='12' height='2' />
      <rect x='11' y='8' width='2' height='7' />
      <rect x='1' y='3' width='5' height='2' />

      {/* Arrow head */}
      <rect x='9' y='0' width='6' height='2' />
      <rect x='13' y='0' width='2' height='6' />
      {/* Arrow diagonal */}
      <rect x='11' y='2' width='2' height='2' />
      <rect x='9' y='4' width='2' height='2' />
      <rect x='7' y='6' width='2' height='2' />
    </svg>
  )
}
