export default function Logo({ size = 36, showText = true, textSize, className = '' }) {
  const wordSize = textSize || Math.round(size * 0.5)
  return (
    <div className={`flex items-center ${className}`}>
      {showText && (
        <span
          className="leading-none"
          style={{ fontFamily: 'Inter, sans-serif', fontSize: wordSize, letterSpacing: '-0.02em' }}
        >
          <span className="font-bold text-[#111827]">Job</span>
          <span className="font-medium text-indigo-600">Verse</span>
        </span>
      )}
    </div>
  )
}
