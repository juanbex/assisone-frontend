interface LogoProps {
  size?: number
  showText?: boolean
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  const cell = Math.floor(size / 4)
  const gap = 2

  const pixels: { col: number; row: number; color: string }[] = [
    { col: 3, row: 0, color: '#4a7ab8' },
    { col: 0, row: 1, color: '#6b9bd1' },
    { col: 2, row: 1, color: '#6b9bd1' },
    { col: 3, row: 1, color: '#00A9E0' },
    { col: 1, row: 2, color: '#6b9bd1' },
    { col: 2, row: 2, color: '#00A9E0' },
    { col: 1, row: 3, color: '#00A9E0' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: size, height: size,
        background: '#0A1F44',
        borderRadius: 8,
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${cell - gap}px)`,
        gridTemplateRows: `repeat(4, ${cell - gap}px)`,
        gap: `${gap}px`,
        padding: `${gap}px`,
        flexShrink: 0,
      }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const px = pixels.find(p => p.col === col && p.row === row)
          return (
            <div key={i} style={{
              background: px ? px.color : 'transparent',
              borderRadius: 2,
            }} />
          )
        })}
      </div>
      {showText && (
        <span style={{
          fontWeight: 700,
          fontSize: Math.floor(size * 0.42),
          color: '#ffffff',
          letterSpacing: '0.02em',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          AssisOne
        </span>
      )}
    </div>
  )
}
