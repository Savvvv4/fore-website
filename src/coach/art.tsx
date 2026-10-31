/**
 * Warm golf-landscape illustration used for profile covers, directory cards and mock-ups.
 * `variant` shifts the sun and hills so neighbouring cards don't look identical.
 */
export function CoverArt({ variant = 0, className = '', wide = false }: { variant?: number; className?: string; wide?: boolean }) {
  const v = Math.abs(variant) % 4;
  const sunX = [300, 110, 250, 160][v];
  const sunY = [82, 76, 72, 86][v];
  const k = wide ? 2.4 : 1;
  const flagX = [96, 300, 140, 320][v];
  return (
    <svg className={`cb-art ${className}`} viewBox={`0 0 ${400 * k} 200`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fore-art-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9DA" />
          <stop offset="1" stopColor="#FFC8A0" />
        </linearGradient>
        <linearGradient id="fore-art-fairway" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9FC79A" />
          <stop offset="1" stopColor="#7DB07E" />
        </linearGradient>
      </defs>
      <rect width={400 * k} height="200" fill="url(#fore-art-sky)" />
      <circle cx={sunX * k} cy={sunY} r="34" fill="#FF8A3D" opacity=".9" />
      <circle cx={sunX * k} cy={sunY} r="52" fill="#FF8A3D" opacity=".12" />
      <g transform={`scale(${k} 1)`}>
      <path d="M0 132 C60 104 110 112 160 124 C220 138 270 100 330 108 C365 112 385 120 400 126 V200 H0 Z" fill="#F0B48E" />
      <path d="M0 150 C70 128 130 140 190 146 C260 154 320 128 400 140 V200 H0 Z" fill="url(#fore-art-fairway)" />
      <path d="M0 172 C90 160 180 170 260 166 C320 163 360 168 400 172 V200 H0 Z" fill="#5E9A68" />
      </g>
      <ellipse cx={flagX * k + 2} cy="163" rx="22" ry="4" fill="#B8DBAE" />
      <line x1={flagX * k} y1="162" x2={flagX * k} y2="126" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" />
      <path d={`M${flagX * k} 127 l18 6 l-18 6 Z`} fill="#FF6E00" />
    </svg>
  );
}
