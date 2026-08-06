export default function Logo({ size = 36, showText = true, textSize, className = '' }) {
  const markSize = size * 0.56
  const wordSize = textSize || Math.round(size * 0.5)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="shrink-0 rounded-xl bg-indigo-600 flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 48 48" fill="none" style={{ width: markSize, height: markSize }}>
          <path d="M16 9V26c0 5.5 3.5 9 10 9c5 0 8-2.5 8-7" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 8.5L16 2l6 6.5" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m32 29 3 3 6.5-9" stroke="#06B6D4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
