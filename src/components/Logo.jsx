/* AI Edge hexagon logo — matches brand identity */
export default function Logo({ size = 24 }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon */}
      <polygon
        points="50,5 91,27.5 91,72.5 50,95 9,72.5 9,27.5"
        stroke="#4a9ece" strokeWidth="2" fill="none"
      />
      {/* Inner hexagon */}
      <polygon
        points="50,22 77,38 77,62 50,78 23,62 23,38"
        stroke="#4a9ece" strokeWidth="1.5" fill="none"
      />
      {/* Corner nodes — outer */}
      <circle cx="50" cy="5" r="2.5" fill="#4a9ece" />
      <circle cx="91" cy="27.5" r="2.5" fill="#4a9ece" />
      <circle cx="91" cy="72.5" r="2.5" fill="#4a9ece" />
      <circle cx="50" cy="95" r="2.5" fill="#4a9ece" />
      <circle cx="9" cy="72.5" r="2.5" fill="#4a9ece" />
      <circle cx="9" cy="27.5" r="2.5" fill="#4a9ece" />
      {/* Corner nodes — inner */}
      <circle cx="50" cy="22" r="2" fill="#4a9ece" />
      <circle cx="77" cy="38" r="2" fill="#4a9ece" />
      <circle cx="77" cy="62" r="2" fill="#4a9ece" />
      <circle cx="50" cy="78" r="2" fill="#4a9ece" />
      <circle cx="23" cy="62" r="2" fill="#4a9ece" />
      <circle cx="23" cy="38" r="2" fill="#4a9ece" />
      {/* Connecting lines — outer to inner */}
      <line x1="50" y1="5" x2="50" y2="22" stroke="#4a9ece" strokeWidth="1" opacity="0.5" />
      <line x1="91" y1="27.5" x2="77" y2="38" stroke="#4a9ece" strokeWidth="1" opacity="0.5" />
      <line x1="91" y1="72.5" x2="77" y2="62" stroke="#4a9ece" strokeWidth="1" opacity="0.5" />
      <line x1="50" y1="95" x2="50" y2="78" stroke="#4a9ece" strokeWidth="1" opacity="0.5" />
      <line x1="9" y1="72.5" x2="23" y2="62" stroke="#4a9ece" strokeWidth="1" opacity="0.5" />
      <line x1="9" y1="27.5" x2="23" y2="38" stroke="#4a9ece" strokeWidth="1" opacity="0.5" />
      {/* "A" letter */}
      <text x="50" y="58" textAnchor="middle" fill="#4abaff"
        fontSize="36" fontWeight="300" fontFamily="Inter, -apple-system, sans-serif"
      >A</text>
    </svg>
  );
}
