import { motion } from 'framer-motion';

// ─── Golf ball arc animation ──────────────────────────────────────────
function GolfBallArc({
  sx, sy, mx, my, ex, ey,
  delay = 0, dur = 1.6, repeatDelay = 5,
}: {
  sx: number; sy: number;
  mx: number; my: number;
  ex: number; ey: number;
  delay?: number; dur?: number; repeatDelay?: number;
}) {
  return (
    <motion.circle
      r={2.2}
      fill="white"
      style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))' }}
      animate={{
        cx: [sx, mx, ex],
        cy: [sy, my, ey],
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration: dur,
        delay,
        repeat: Infinity,
        repeatDelay,
        ease: 'easeOut',
        times: [0, 0.35, 0.85, 1],
      }}
    />
  );
}

// ─── Waving flag ─────────────────────────────────────────────────────
function WavingFlag({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <line x1={x} y1={y + 1} x2={x} y2={y - 26} stroke="#0a1f14" strokeWidth="1.6" strokeLinecap="round" />
      <motion.path
        fill="#92FF5F"
        animate={{
          d: [
            `M ${x} ${y - 26} L ${x + 17} ${y - 20} L ${x} ${y - 14} Z`,
            `M ${x} ${y - 26} L ${x + 20} ${y - 21} L ${x} ${y - 16} Z`,
            `M ${x} ${y - 26} L ${x + 15} ${y - 19} L ${x} ${y - 13} Z`,
            `M ${x} ${y - 26} L ${x + 17} ${y - 20} L ${x} ${y - 14} Z`,
          ],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <circle cx={x} cy={y + 1} r={2.4} fill="rgba(0,0,0,0.25)" />
    </g>
  );
}

// ─── Person figure ────────────────────────────────────────────────────
function Person({
  x, y, shirtColor, headColor = '#e8b078', label, role, delay = 0, pose = 'stand',
}: {
  x: number; y: number;
  shirtColor: string;
  headColor?: string;
  label: string;
  role: string;
  delay?: number;
  pose?: 'swing' | 'putt' | 'stand' | 'teach' | 'address';
}) {
  const roleColor: Record<string, string> = {
    GOLFER: 'rgba(217,243,107,0.9)',
    COACH: 'rgba(255,178,80,0.9)',
    FACILITY: 'rgba(120,210,210,0.9)',
  };
  const pillColor = roleColor[role] ?? 'rgba(255,255,255,0.8)';

  let clubPath: string | null = null;
  let leftArmPath: string | null = null;
  let rightArmPath: string | null = null;

  if (pose === 'swing') {
    rightArmPath = `M ${x + 4} ${y - 1} L ${x + 13} ${y - 8}`;
    clubPath = `M ${x + 13} ${y - 8} L ${x + 20} ${y - 3}`;
  } else if (pose === 'address') {
    leftArmPath = `M ${x - 3} ${y} L ${x - 2} ${y + 10}`;
    rightArmPath = `M ${x + 3} ${y} L ${x + 2} ${y + 10}`;
    clubPath = `M ${x} ${y + 10} L ${x} ${y + 20}`;
  } else if (pose === 'putt') {
    leftArmPath = `M ${x - 3} ${y - 1} L ${x - 2} ${y + 8}`;
    rightArmPath = `M ${x + 3} ${y - 1} L ${x + 2} ${y + 8}`;
    clubPath = `M ${x} ${y + 8} L ${x - 1} ${y + 17}`;
  } else if (pose === 'teach') {
    rightArmPath = `M ${x + 4} ${y - 2} L ${x + 16} ${y - 6}`;
  } else {
    leftArmPath = `M ${x - 4} ${y - 1} L ${x - 5} ${y + 7}`;
    rightArmPath = `M ${x + 4} ${y - 1} L ${x + 5} ${y + 7}`;
  }

  return (
    <motion.g
      animate={{ y: [0, -2.5, 0] }}
      transition={{ duration: 2.8 + delay * 0.7, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ellipse cx={x} cy={y + 10} rx={7} ry={3.5} fill="rgba(0,0,0,0.22)" />
      <line x1={x - 3} y1={y + 6} x2={x - 3} y2={y + 13} stroke={shirtColor} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
      <line x1={x + 3} y1={y + 6} x2={x + 3} y2={y + 13} stroke={shirtColor} strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
      <ellipse cx={x} cy={y + 1} rx={6} ry={8} fill={shirtColor} />
      {leftArmPath && <path d={leftArmPath} stroke={headColor} strokeWidth={2} strokeLinecap="round" fill="none" />}
      {rightArmPath && <path d={rightArmPath} stroke={headColor} strokeWidth={2} strokeLinecap="round" fill="none" />}
      {clubPath && <path d={clubPath} stroke="rgba(255,255,255,0.7)" strokeWidth={1.4} strokeLinecap="round" fill="none" />}
      <circle cx={x} cy={y - 8} r={5.5} fill={headColor} />
      {role === 'GOLFER' && (
        <path d={`M ${x - 5.5} ${y - 9} Q ${x} ${y - 16} ${x + 5.5} ${y - 9}`} fill={shirtColor} opacity={0.9} />
      )}
      <rect x={x - 18} y={y - 26} width={36} height={11} rx={5.5} fill={pillColor} opacity={0.92} />
      <text
        x={x} y={y - 20}
        textAnchor="middle" dominantBaseline="middle"
        fill="#0F3B27" fontSize={5.5} fontWeight="800"
        letterSpacing="0.8" fontFamily="Manrope, sans-serif"
      >
        {role}
      </text>
    </motion.g>
  );
}

// ─── Tree cluster ─────────────────────────────────────────────────────
function TreeCluster({ x, y, count = 3, scale = 1 }: { x: number; y: number; count?: number; scale?: number }) {
  const offsets = [
    { dx: 0, dy: 0, r: 10 * scale },
    { dx: 11 * scale, dy: 5 * scale, r: 8 * scale },
    { dx: -9 * scale, dy: 7 * scale, r: 7 * scale },
    { dx: 6 * scale, dy: -8 * scale, r: 6 * scale },
  ].slice(0, count);
  return (
    <g>
      {offsets.map((o, i) => (
        <circle key={i} cx={x + o.dx} cy={y + o.dy + 4} r={o.r} fill="rgba(0,0,0,0.2)" />
      ))}
      {offsets.map((o, i) => (
        <circle key={i} cx={x + o.dx} cy={y + o.dy} r={o.r}
          fill={i % 2 === 0 ? '#0f2c1a' : '#152d1e'}
        />
      ))}
      {offsets.slice(0, 1).map((o, i) => (
        <circle key={i} cx={x + o.dx - o.r * 0.3} cy={y + o.dy - o.r * 0.3} r={o.r * 0.25}
          fill="rgba(255,255,255,0.06)"
        />
      ))}
    </g>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────
export default function HeroEcosystem() {
  return (
    <motion.div
      className="hero-visual hero-ecosystem"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <svg
        viewBox="0 0 580 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id="eco-bg" cx="45%" cy="55%" r="70%">
            <stop offset="0%" stopColor="#F7F9F7" />
            <stop offset="100%" stopColor="#eceae3" />
          </radialGradient>
          <radialGradient id="eco-fairway" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#72ba58" />
            <stop offset="100%" stopColor="#569046" />
          </radialGradient>
          <radialGradient id="eco-green" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#62d44e" />
            <stop offset="100%" stopColor="#44aa30" />
          </radialGradient>
          <radialGradient id="eco-range" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#4e8c5a" />
            <stop offset="100%" stopColor="#3a6e46" />
          </radialGradient>
          <radialGradient id="eco-pond" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#5898b4" />
            <stop offset="100%" stopColor="#3a7090" />
          </radialGradient>
          <filter id="eco-sh" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="#050e07" floodOpacity="0.28" />
          </filter>
          <filter id="eco-bldg-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#050e07" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* ── Background ─────────────────────────────────────── */}
        <rect width="580" height="640" fill="url(#eco-bg)" />
        <rect width="580" height="640" fill="rgba(0,0,0,0.04)" />

        {/* ── Driving range field (right half) ──────────────── */}
        <rect x="296" y="30" width="284" height="430" rx="6" fill="url(#eco-range)" />

        {/* Range target circles */}
        <ellipse cx="440" cy="120" rx="28" ry="10" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeDasharray="4 4" />
        <ellipse cx="440" cy="120" rx="14" ry="5" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <ellipse cx="440" cy="120" rx="5" ry="2" fill="rgba(255,255,255,0.15)" />
        <ellipse cx="430" cy="220" rx="24" ry="9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" strokeDasharray="4 4" />
        <ellipse cx="430" cy="220" rx="11" ry="4" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <ellipse cx="420" cy="310" rx="20" ry="8" fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="1.2" strokeDasharray="4 4" />

        <text x="462" y="124" fill="rgba(255,255,255,0.35)" fontSize="7.5" fontWeight="700" fontFamily="Manrope, sans-serif">250Y</text>
        <text x="454" y="224" fill="rgba(255,255,255,0.3)" fontSize="7.5" fontWeight="700" fontFamily="Manrope, sans-serif">150Y</text>
        <text x="440" y="314" fill="rgba(255,255,255,0.28)" fontSize="7.5" fontWeight="700" fontFamily="Manrope, sans-serif">75Y</text>

        {/* Range net */}
        <line x1="304" y1="32" x2="576" y2="32" stroke="rgba(255,255,255,0.22)" strokeWidth="2.5" />
        {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
          <line key={i} x1={304 + i * 27} y1="32" x2={304 + i * 27} y2="52" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
        ))}
        {[0,1,2].map(i => (
          <line key={i} x1="304" y1={32 + i * 10} x2="576" y2={32 + i * 10} stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
        ))}
        {[304, 358, 412, 466, 520, 576].map((px, i) => (
          <rect key={i} x={px - 2} y="24" width="4" height="28" rx="2" fill="rgba(255,255,255,0.25)" />
        ))}

        {/* Range separator */}
        <line x1="296" y1="30" x2="296" y2="465" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeDasharray="6 5" />

        {/* Hitting bays strip */}
        <rect x="296" y="430" width="284" height="60" rx="4" fill="#2a4a34" />
        {[348, 400, 452, 504, 556].map((bx, i) => (
          <line key={i} x1={bx} y1="430" x2={bx} y2="490" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
        ))}
        {[306, 358, 410, 462, 514].map((bx, i) => (
          <rect key={i} x={bx + 2} y="444" width="38" height="30" rx="3" fill="#1c3825" />
        ))}
        {[1, 2, 3, 4, 5].map((n, i) => (
          <text key={n} x={315 + i * 52} y="440" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="7" fontWeight="700" fontFamily="Manrope, sans-serif">BAY {n}</text>
        ))}
        {[320, 372, 424, 476, 528].map((tx, i) => (
          <circle key={i} cx={tx + 5} cy="456" r="2.5" fill="#92FF5F" opacity={0.5} />
        ))}

        {/* ── Golf course (left/center) ──────────────────────── */}
        <ellipse cx="155" cy="340" rx="120" ry="200" fill="#305c38" opacity="0.5" />

        {/* Fairway */}
        <path
          d="M 135 570 C 130 510 145 460 160 400 C 175 345 180 300 175 250 C 170 205 162 182 148 165"
          stroke="url(#eco-fairway)" strokeWidth="80" strokeLinecap="round" fill="none"
        />
        {/* Mow stripes */}
        {[0, 1, 2, 3].map(i => (
          <path key={i}
            d="M 130 560 C 126 500 140 450 155 390 C 168 335 172 290 168 245 C 164 200 155 178 142 162"
            stroke={i % 2 === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'}
            strokeWidth="10" strokeLinecap="round" fill="none"
          />
        ))}

        {/* ── Putting green ──────────────────────────────────── */}
        <ellipse cx="148" cy="138" rx="54" ry="38" fill="rgba(0,0,0,0.18)" transform="translate(3,8)" />
        <ellipse cx="148" cy="138" rx="54" ry="38" fill="url(#eco-green)" />
        <ellipse cx="148" cy="138" rx="54" ry="38" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2.5" />
        <ellipse cx="148" cy="138" rx="38" ry="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
        {/* Single hole cup */}
        <circle cx="162" cy="128" r="4.5" fill="rgba(0,0,0,0.6)" />
        <circle cx="162" cy="128" r="3.5" fill="#0a1a10" />
        <WavingFlag x={162} y={128} />

        {/* ── Bunkers ────────────────────────────────────────── */}
        <ellipse cx="98" cy="165" rx="20" ry="12" fill="#b8a06a" transform="rotate(-20 98 165)" />
        <ellipse cx="98" cy="165" rx="16" ry="9" fill="#d4be88" transform="rotate(-20 98 165)" />
        <ellipse cx="200" cy="158" rx="17" ry="10" fill="#b8a06a" transform="rotate(15 200 158)" />
        <ellipse cx="200" cy="158" rx="13" ry="7.5" fill="#d4be88" transform="rotate(15 200 158)" />
        <ellipse cx="118" cy="310" rx="16" ry="10" fill="#b8a06a" transform="rotate(-10 118 310)" />
        <ellipse cx="118" cy="310" rx="12.5" ry="7.5" fill="#d4be88" transform="rotate(-10 118 310)" />
        <ellipse cx="205" cy="360" rx="13" ry="8" fill="#b8a06a" transform="rotate(12 205 360)" />
        <ellipse cx="205" cy="360" rx="10" ry="6" fill="#d4be88" transform="rotate(12 205 360)" />

        {/* ── Water hazard ───────────────────────────────────── */}
        <ellipse cx="240" cy="245" rx="30" ry="18" fill="rgba(0,0,0,0.2)" transform="translate(2,5)" />
        <ellipse cx="240" cy="245" rx="30" ry="18" fill="url(#eco-pond)" />
        <ellipse cx="240" cy="245" rx="30" ry="18" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <motion.ellipse
          cx="235" cy="243" rx="12" ry="4"
          fill="rgba(255,255,255,0.12)"
          animate={{ rx: [12, 15, 12], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <text x="240" y="249" textAnchor="middle" dominantBaseline="middle"
          fill="rgba(255,255,255,0.2)" fontSize="6" fontWeight="700"
          letterSpacing="0.8" fontFamily="Manrope, sans-serif">HAZARD</text>

        {/* ── Tee box ────────────────────────────────────────── */}
        <rect x="120" y="548" width="36" height="22" rx="5" fill="#6aae56" />
        <rect x="122" y="550" width="32" height="18" rx="4" fill="#7fc46a" />
        <circle cx="131" cy="559" r="2.5" fill="#92FF5F" opacity={0.9} />
        <circle cx="149" cy="559" r="2.5" fill="#92FF5F" opacity={0.9} />

        {/* ── Trees ──────────────────────────────────────────── */}
        <TreeCluster x={62} y={100} count={4} scale={1.2} />
        <TreeCluster x={66} y={200} count={3} scale={1.0} />
        <TreeCluster x={52} y={290} count={3} scale={0.9} />
        <TreeCluster x={60} y={400} count={2} scale={1.1} />
        <TreeCluster x={70} y={490} count={3} scale={0.8} />
        <TreeCluster x={240} y={100} count={3} scale={1.0} />
        <TreeCluster x={258} y={180} count={2} scale={0.85} />
        <TreeCluster x={268} y={430} count={3} scale={0.95} />
        <TreeCluster x={278} y={530} count={2} scale={0.8} />

        {/* ── Clubhouse building ─────────────────────────────── */}
        <g filter="url(#eco-bldg-sh)">
          <rect x="460" y="510" width="110" height="80" rx="6" fill="#e8e0d4" />
          <path d="M 456 514 L 515 495 L 574 514 Z" fill="#c8b89a" />
          <rect x="460" y="514" width="110" height="76" rx="4" fill="#f0e8dc" />
          <rect x="470" y="524" width="16" height="14" rx="3" fill="#a8c8d8" opacity={0.8} />
          <rect x="492" y="524" width="16" height="14" rx="3" fill="#a8c8d8" opacity={0.8} />
          <rect x="542" y="524" width="16" height="14" rx="3" fill="#a8c8d8" opacity={0.8} />
          <rect x="510" y="548" width="20" height="42" rx="3" fill="#8a7a68" />
          <circle cx="518" cy="569" r="1.8" fill="rgba(255,255,255,0.5)" />
          <line x1="515" y1="495" x2="515" y2="476" stroke="#8a7a68" strokeWidth="1.4" />
          <path d="M 515 476 L 526 480 L 515 484 Z" fill="#92FF5F" />
        </g>

        {/* ── Golf ball arcs ─────────────────────────────────── */}
        {/* Range balls */}
        <GolfBallArc sx={325} sy={450} mx={360} my={160} ex={425} ey={118} delay={0} dur={1.6} repeatDelay={5.5} />
        <GolfBallArc sx={377} sy={450} mx={408} my={200} ex={430} ey={220} delay={1.2} dur={1.3} repeatDelay={6} />
        <GolfBallArc sx={429} sy={450} mx={432} my={240} ex={428} ey={310} delay={2.6} dur={1.1} repeatDelay={5} />
        <GolfBallArc sx={530} sy={450} mx={490} my={190} ex={436} ey={118} delay={0.7} dur={1.5} repeatDelay={7} />

        {/* Tee shot — drive goes almost to the green (lands ~20px short of fringe) */}
        <GolfBallArc sx={138} sy={552} mx={125} my={62} ex={155} ey={180} delay={3.5} dur={2.2} repeatDelay={9} />

        {/* ── PEOPLE ─────────────────────────────────────────── */}

        {/* Single golfer at tee box, mid-swing */}
        <Person
          x={138} y={548}
          shirtColor="#6ec0f0"
          headColor="#f0c088"
          label="Arjun K."
          role="GOLFER"
          delay={1.2}
          pose="swing"
        />

        {/* Coach teaching at range bay 3 */}
        <Person
          x={410} y={455}
          shirtColor="#ff8c42"
          headColor="#d8986a"
          label="Meera Shah"
          role="COACH"
          delay={0.3}
          pose="teach"
        />

        {/* Student being coached */}
        <Person
          x={438} y={458}
          shirtColor="#c0e8f8"
          headColor="#e8b078"
          label="Dev P."
          role="GOLFER"
          delay={0.9}
          pose="swing"
        />

        {/* Solo range golfer — bay 1 */}
        <Person
          x={323} y={455}
          shirtColor="#a0c8a0"
          headColor="#c87050"
          label="Vikram R."
          role="GOLFER"
          delay={1.5}
          pose="swing"
        />

        {/* Solo range golfer — bay 5 */}
        <Person
          x={530} y={458}
          shirtColor="#f0d890"
          headColor="#e8a060"
          label="Aisha K."
          role="GOLFER"
          delay={0.5}
          pose="address"
        />

        {/* ── Ambient birds ───────────────────────────────────── */}
        {[
          { x: 350, y: 80, delay: 0 },
          { x: 380, y: 70, delay: 0.3 },
          { x: 420, y: 65, delay: 0.6 },
        ].map((b, i) => (
          <motion.path
            key={i}
            d={`M ${b.x - 5} ${b.y} Q ${b.x} ${b.y - 4} ${b.x + 5} ${b.y}`}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            animate={{ x: [0, 80], y: [0, -10], opacity: [0, 0.6, 0.6, 0] }}
            transition={{ duration: 8, delay: b.delay + 2, repeat: Infinity, ease: 'linear' }}
          />
        ))}

      </svg>
    </motion.div>
  );
}
