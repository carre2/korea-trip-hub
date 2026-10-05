// Original decorative SVG plush friends. No interactive or accessible content.
export default function PeekMascot({ animal = 'bunny' }) {
  const bunny = animal === 'bunny', cat = animal === 'cat';
  const fur = bunny ? '#fff4ee' : cat ? '#fce1c6' : '#d4b2a0';
  return <span className={`peek-mascot peek-${animal}`} aria-hidden="true">
    <span className="peek-sparkle">{cat ? '🌷' : bunny ? '💕' : '✨'}</span>
    <svg viewBox="0 0 120 112" fill="none" focusable="false">
      {bunny ? <><ellipse cx="42" cy="32" rx="12" ry="29" transform="rotate(-12 42 32)" fill={fur} stroke="#ac8582" strokeWidth="2"/><ellipse cx="77" cy="31" rx="12" ry="29" transform="rotate(12 77 31)" fill={fur} stroke="#ac8582" strokeWidth="2"/><ellipse cx="42" cy="30" rx="5" ry="19" transform="rotate(-12 42 30)" fill="#f2bccb"/><ellipse cx="77" cy="29" rx="5" ry="19" transform="rotate(12 77 29)" fill="#f2bccb"/></>
        : cat ? <><path d="M27 51 26 17Q26 11 32 15L52 35M69 35l20-20q6-4 6 2l-1 34" fill={fur} stroke="#ac8582" strokeWidth="2" strokeLinejoin="round"/><path d="m32 23 3 22 12-8M89 23l-3 22-12-8" fill="#efb0bb"/></>
        : <><circle cx="30" cy="35" r="16" fill={fur} stroke="#95776d" strokeWidth="2"/><circle cx="90" cy="35" r="16" fill={fur} stroke="#95776d" strokeWidth="2"/><circle cx="30" cy="35" r="8" fill="#f0c3c6"/><circle cx="90" cy="35" r="8" fill="#f0c3c6"/></>}
      <path d="M27 110V89q0-22 33-22t33 22v21" fill={bunny ? '#e8dff6' : cat ? '#d5ece0' : '#f5d9e2'}/>
      <ellipse cx="60" cy="62" rx="38" ry="33" fill={fur} stroke="#ac8582" strokeWidth="2"/>
      {!bunny && !cat && <ellipse cx="60" cy="71" rx="18" ry="12" fill="#f9eadf"/>}
      <ellipse cx="36" cy="70" rx="8" ry="5" fill="#eea9bb" opacity=".7"/><ellipse cx="84" cy="70" rx="8" ry="5" fill="#eea9bb" opacity=".7"/>
      <ellipse cx="46" cy="58" rx="3" ry="4" fill="#614647"/><ellipse cx="74" cy="58" rx="3" ry="4" fill="#614647"/>
      <path d="M56 68q4-5 8 0l-4 4z" fill="#98616c"/><path d="M60 72q-5 7-10 2m10-2q5 7 10 2" stroke="#80595b" strokeWidth="2" strokeLinecap="round"/>
      {cat && <path d="m31 65-14-3m15 10-13 3m70-10 14-3m-15 10 13 3" stroke="#ac8582" strokeWidth="1.7" strokeLinecap="round"/>}
      <path d="m51 91 9 5 9-5v12l-9-4-9 4z" fill="#bf83ae"/><circle cx="60" cy="97" r="3" fill="#e8bdce"/>
      <ellipse cx="31" cy="98" rx="13" ry="9" fill={fur} stroke="#ac8582" strokeWidth="2"/><ellipse cx="89" cy="98" rx="13" ry="9" fill={fur} stroke="#ac8582" strokeWidth="2"/>
      <path d="M28 97v4m6-4v4m52-4v4m6-4v4" stroke="#c49c98" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  </span>;
}
