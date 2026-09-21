import React from 'react';

export function PumpSchematic({
  fluidLevel = 1250,
  porePressure = 150,
  thp = 45,
  chp = 12,
  isPound = false,
  pumpRpm = 12,
}: {
  fluidLevel?: number;
  porePressure?: number;
  thp?: number;
  chp?: number;
  isPound?: boolean;
  pumpRpm?: number;
}) {
  const fluidY = 200 + Math.min(130, Math.max(0, ((fluidLevel - 1200) / 150) * 130));
  const pumpDuration = `${Math.max(0.8, Math.min(4, 60 / pumpRpm))}s`;

  return (
    <svg style={{ width: '100%', height: '100%', minHeight: '400px' }} viewBox="0 0 520 460" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="casingGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cds-border-strong-01)" />
          <stop offset="50%" stopColor="var(--cds-layer-03)" />
          <stop offset="100%" stopColor="var(--cds-border-strong-01)" />
        </linearGradient>

        <linearGradient id="fluidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cds-link-primary)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--cds-link-primary)" stopOpacity="0.85" />
        </linearGradient>

        <radialGradient id="steamHeatGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--cds-support-warning)" stopOpacity="0.45" />
          <stop offset="60%" stopColor="var(--cds-support-error)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--cds-support-error)" stopOpacity="0" />
        </radialGradient>

        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <style>
          {`
            @keyframes rockBeam {
              0%, 100% { transform: rotate(-8deg); }
              50% { transform: rotate(8deg); }
            }
            @keyframes moveRod {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-25px); }
            }
            .anim-beam {
              animation: rockBeam ${pumpDuration} infinite ease-in-out;
              transform-origin: 360px 50px;
            }
            .anim-rod {
              animation: moveRod ${pumpDuration} infinite ease-in-out;
            }
          `}
        </style>
      </defs>

      {/* Surface Terrain / Rig Floor */}
      <rect x="20" y="110" width="480" height="3" fill="var(--cds-border-subtle-01)" rx="1.5" />
      <rect x="20" y="113" width="480" height="340" fill="var(--cds-layer-01)" fillOpacity="0.6" rx="8" />

      {/* Heavy Oil Reservoir Zone */}
      <rect x="40" y="380" width="440" height="65" fill="var(--cds-support-warning)" fillOpacity="0.05" stroke="var(--cds-support-warning)" strokeOpacity="0.2" strokeDasharray="4 3" rx="4" />
      <ellipse cx="260" cy="412" rx="140" ry="26" fill="url(#steamHeatGrad)" />
      <text x="70" y="400" fill="var(--cds-support-warning)" fontSize="10" fontWeight="700" letterSpacing="0.8">
        JODHPUR FORMATION (PAYZONE DEPTH 2,847m)
      </text>
      <text x="70" y="415" fill="var(--cds-text-secondary)" fontSize="9" fontFamily="var(--cds-font-family-mono, monospace)">
        P_res: {porePressure} bar · Viscosity: 32 cP (Steam Front Heated)
      </text>

      {/* Outer Casing Pipe */}
      <rect x="238" y="110" width="44" height="290" fill="url(#casingGrad)" stroke="var(--cds-border-subtle-01)" strokeWidth="1" rx="2" />

      {/* Annular Casing Fluid Level */}
      <rect x="240" y={fluidY} width="40" height={400 - fluidY} fill="url(#fluidGrad)" opacity="0.6" />

      {/* Inner Production Tubing Pipe */}
      <rect x="248" y="90" width="24" height="310" fill="var(--cds-layer-02)" stroke="var(--cds-link-primary)" strokeWidth="1" strokeOpacity="0.5" />

      {/* Sucker Rod String */}
      <line className="anim-rod" x1="260" y1="50" x2="260" y2="395" stroke="var(--cds-text-primary)" strokeWidth="2" strokeOpacity="0.8" />

      {/* Perforations into Reservoir */}
      <line x1="230" y1="395" x2="248" y2="395" stroke="var(--cds-support-warning)" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="230" y1="405" x2="248" y2="405" stroke="var(--cds-support-warning)" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="272" y1="395" x2="290" y2="395" stroke="var(--cds-support-warning)" strokeWidth="2" strokeDasharray="2 2" />
      <line x1="272" y1="405" x2="290" y2="405" stroke="var(--cds-support-warning)" strokeWidth="2" strokeDasharray="2 2" />

      {/* Subsurface SRP Pump Barrel */}
      <rect x="245" y="380" width="30" height="25" fill="var(--cds-layer-03)" stroke="var(--cds-link-primary)" strokeWidth="1.5" rx="2" />
      <circle className="anim-rod" cx="260" cy="392" r="4" fill={isPound ? 'var(--cds-support-error)' : 'var(--cds-support-success)'} filter="url(#glowEffect)" />
      <text x="260" y="372" textAnchor="middle" fill="var(--cds-text-secondary)" fontSize="8" fontFamily="var(--cds-font-family-mono, monospace)">
        SRP PUMP BARREL
      </text>

      {/* Surface Pump Jack */}
      <polygon points="340,110 380,110 360,50" fill="var(--cds-layer-02)" stroke="var(--cds-border-subtle-01)" strokeWidth="1.5" />
      <g className="anim-beam">
        <line x1="260" y1="48" x2="410" y2="58" stroke="var(--cds-link-primary)" strokeWidth="4" strokeLinecap="round" />
        <path d="M260 48 Q250 35 242 42 Q238 60 260 52" fill="none" stroke="var(--cds-link-primary)" strokeWidth="2" />
      </g>

      {/* Polished Rod Bridle */}
      <line className="anim-rod" x1="260" y1="52" x2="260" y2="88" stroke="var(--cds-text-primary)" strokeWidth="1.5" strokeDasharray="4 2" />

      {/* Surface Wellhead Christmas Tree */}
      <rect x="238" y="85" width="44" height="25" fill="var(--cds-layer-03)" stroke="var(--cds-border-subtle-01)" strokeWidth="1" rx="3" />
      <rect x="250" y="75" width="20" height="12" fill="var(--cds-layer-02)" stroke="var(--cds-link-primary)" strokeWidth="1" rx="2" />

      {/* Flowline & Choke Valve */}
      <path d="M282 96 H330 Q335 96 335 102 V110" stroke="var(--cds-link-primary)" strokeWidth="2" fill="none" />
      <circle cx="305" cy="96" r="4" fill="var(--cds-link-primary)" />

      {/* HUD Telemetry Badges */}
      <g transform={`translate(100, ${fluidY - 10})`}>
        <rect width="130" height="26" rx="4" fill="var(--cds-layer-01)" fillOpacity="0.9" stroke="var(--cds-link-primary)" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="130" y1="13" x2="238" y2={13} stroke="var(--cds-link-primary)" strokeOpacity="0.5" strokeWidth="1" strokeDasharray="3 3" />
        <text x="8" y="17" fill="var(--cds-link-primary)" fontSize="10" fontFamily="var(--cds-font-family-mono, monospace)" fontWeight="700">
          FLUID LEVEL: {Math.round(fluidLevel)} m
        </text>
      </g>

      <g transform="translate(60, 68)">
        <rect width="120" height="26" rx="4" fill="var(--cds-layer-01)" fillOpacity="0.9" stroke="var(--cds-support-warning)" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="120" y1="13" x2="238" y2="88" stroke="var(--cds-support-warning)" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
        <text x="8" y="17" fill="var(--cds-support-warning)" fontSize="10" fontFamily="var(--cds-font-family-mono, monospace)" fontWeight="700">
          THP: {Math.round(thp)} bar
        </text>
      </g>

      <g transform="translate(350, 75)">
        <rect width="120" height="26" rx="4" fill="var(--cds-layer-01)" fillOpacity="0.9" stroke="var(--cds-support-success)" strokeOpacity="0.4" strokeWidth="1" />
        <line x1="0" y1="13" x2="-68" y2="15" stroke="var(--cds-support-success)" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
        <text x="8" y="17" fill="var(--cds-support-success)" fontSize="10" fontFamily="var(--cds-font-family-mono, monospace)" fontWeight="700">
          CHP: {Math.round(chp)} bar
        </text>
      </g>

      <g transform="translate(330, 360)">
        <rect width="150" height="26" rx="4" fill="var(--cds-layer-01)" fillOpacity="0.9" stroke={isPound ? 'var(--cds-support-error)' : 'var(--cds-support-success)'} strokeOpacity="0.6" strokeWidth="1" />
        <text x="8" y="17" fill={isPound ? 'var(--cds-support-error)' : 'var(--cds-support-success)'} fontSize="10" fontFamily="var(--cds-font-family-mono, monospace)" fontWeight="700">
          {isPound ? '⚠ FLUID POUND' : '● FULL PUMP FILLAGE'}
        </text>
      </g>
    </svg>
  );
}
