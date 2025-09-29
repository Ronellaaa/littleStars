export default function HomeCharacters() {
  return (
    <svg className="ls-characters" viewBox="0 0 1440 280" aria-hidden="true">
      <ellipse cx="720" cy="250" rx="700" ry="40" fill="rgba(0,0,0,.06)"/>

      {/* ROBOT (left) */}
      <g transform="translate(140,70)">
        <g className="ls-char bob-slow">
          <rect x="-40" y="70" width="40" height="12" rx="6" fill="#f6a03b"/>
          <rect x="140" y="70" width="40" height="12" rx="6" fill="#f6a03b"/>
          <rect x="0" y="40" width="140" height="110" rx="16" fill="#ff8f3a"/>
          <circle cx="70" cy="95" r="18" fill="#d9312c"/>
          <rect x="28" y="0" width="84" height="52" rx="10" fill="#ffd28e" />
          <circle cx="50" cy="26" r="6" fill="#5b3713"/>
          <circle cx="90" cy="26" r="6" fill="#5b3713"/>
          <rect x="36" y="150" width="18" height="24" rx="6" fill="#ff8f3a"/>
          <rect x="86" y="150" width="18" height="24" rx="6" fill="#ff8f3a"/>
        </g>
      </g>

      {/* PENGUIN */}
      <g transform="translate(340,85)">
        <g className="ls-char bob">
          <ellipse cx="60" cy="92" rx="58" ry="70" fill="#1f2a38"/>
          <ellipse cx="60" cy="105" rx="36" ry="48" fill="#ffffff"/>
          <polygon points="60,85 76,95 44,95" fill="#f5a623"/>
          <circle cx="46" cy="72" r="6" fill="#1f2a38"/>
          <circle cx="74" cy="72" r="6" fill="#1f2a38"/>
          <ellipse cx="34" cy="120" rx="14" ry="20" fill="#1f2a38"/>
          <ellipse cx="86" cy="120" rx="14" ry="20" fill="#1f2a38"/>
          <rect x="40" y="160" width="18" height="12" rx="6" fill="#f5a623"/>
          <rect x="62" y="160" width="18" height="12" rx="6" fill="#f5a623"/>
        </g>
      </g>

      {/* BUNNY */}
      <g transform="translate(520,60)">
        <g className="ls-char bob-fast">
          <path d="M40,90 C10,100 0,130 40,142 L40,110 Z" fill="#ff4b6e" opacity=".85"/>
          <ellipse cx="60" cy="48" rx="28" ry="24" fill="#59c4ff"/>
          <rect x="44" y="-4" width="12" height="40" rx="6" fill="#59c4ff"/>
          <rect x="64" y="-4" width="12" height="40" rx="6" fill="#59c4ff"/>
          <circle cx="52" cy="46" r="4" fill="#1b3b55"/>
          <circle cx="68" cy="46" r="4" fill="#1b3b55"/>
          <rect x="38" y="70" width="44" height="56" rx="12" fill="#7fe0ff"/>
          <rect x="44" y="128" width="12" height="12" rx="6" fill="#59c4ff"/>
          <rect x="64" y="128" width="12" height="12" rx="6" fill="#59c4ff"/>
        </g>
      </g>

      {/* YETI / FRIENDLY MONSTER */}
      <g transform="translate(690,28)">
        <g className="ls-char bob-slow" opacity=".95">
          <ellipse cx="120" cy="120" rx="120" ry="110" fill="#ffffff"/>
          <circle cx="90" cy="110" r="6" fill="#2e3a46"/>
          <circle cx="150" cy="110" r="6" fill="#2e3a46"/>
          <path d="M92,132 Q120,150 148,132" stroke="#2e3a46" strokeWidth="6" fill="none" strokeLinecap="round"/>
          <ellipse cx="36" cy="128" rx="26" ry="34" fill="#ffffff"/>
          <ellipse cx="204" cy="128" rx="26" ry="34" fill="#ffffff"/>
        </g>
      </g>

      {/* CAT */}
      <g transform="translate(970,60)">
        <g className="ls-char bob">
          <ellipse cx="50" cy="80" rx="40" ry="32" fill="#ff8c3a"/>
          <circle cx="50" cy="60" r="22" fill="#ff8c3a"/>
          <circle cx="42" cy="58" r="4" fill="#5b3713"/>
          <circle cx="58" cy="58" r="4" fill="#5b3713"/>
          <path d="M32,68 Q50,76 68,68" stroke="#5b3713" strokeWidth="4" fill="none" strokeLinecap="round"/>
          <path d="M86,86 q24,-8 18,16" stroke="#ff8c3a" strokeWidth="12" fill="none" strokeLinecap="round"/>
          <rect x="36" y="110" width="12" height="14" rx="6" fill="#ff8c3a"/>
          <rect x="52" y="110" width="12" height="14" rx="6" fill="#ff8c3a"/>
        </g>
      </g>

      {/* OCTOPUS (right) */}
      <g transform="translate(1160,70)">
        <g className="ls-char bob-slow">
          <ellipse cx="70" cy="90" rx="60" ry="56" fill="#a66cff"/>
          <circle cx="52" cy="82" r="6" fill="#432b6d"/>
          <circle cx="88" cy="82" r="6" fill="#432b6d"/>
          <path d="M46,102 Q70,112 94,102" stroke="#432b6d" strokeWidth="5" fill="none" strokeLinecap="round"/>
          <path d="M20,120 q-28,20 0,36" stroke="#a66cff" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M44,126 q-20,18 6,36" stroke="#a66cff" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M72,128 q-6,22 18,36" stroke="#a66cff" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M98,126 q20,18 -6,36" stroke="#a66cff" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M126,92 l-14,26 l18,-6 z" fill="#e2a86b"/>
          <circle cx="134" cy="86" r="10" fill="#ff7cab"/>
          <circle cx="142" cy="78" r="8" fill="#fff0b8"/>
        </g>
      </g>
    </svg>
  );
}
