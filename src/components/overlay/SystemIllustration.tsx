import type { ReactNode } from 'react';

export type SystemVisual = 'cerbrain' | 'rag' | 'db' | 'load' | 'micro';

const descriptions: Record<SystemVisual, string> = {
  cerbrain: 'Company documents and email connect to shared AI memory, search, operational records and governed tools.',
  rag: 'Technical documents are retrieved as evidence for an answer with source references.',
  db: 'Duplicate contact records become a validated, reusable contact directory.',
  load: 'Crates are arranged within a container and checked against loading constraints.',
  micro: 'Raw exports pass through cleaning and aggregation into a structured report.',
};

function Tile({ x, y, width, title, subtitle, color = '#99e5d6' }: { x: number; y: number; width: number; title: string; subtitle: string; color?: string }) {
  return <g transform={`translate(${x} ${y})`}>
    <rect width={width} height="54" rx="10" fill={color} fillOpacity=".07" stroke={color} strokeOpacity=".3" />
    <rect x="10" y="12" width="3" height="29" rx="1.5" fill={color} />
    <text x="22" y="24" fill="#f1f5f9" fontSize="11" fontWeight="600">{title}</text>
    <text x="22" y="40" fill="#94a3b8" fontSize="8">{subtitle}</text>
  </g>;
}

function Route({ d, color = '#99e5d6' }: { d: string; color?: string }) {
  return <path d={d} fill="none" stroke={color} strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />;
}

/** Public conceptual illustrations, not screenshots or implementation diagrams. */
export function SystemIllustration({ kind, className = '' }: { kind: SystemVisual; className?: string }) {
  let scene: ReactNode;
  if (kind === 'cerbrain') scene = <>
    <text x="20" y="27" fill="#99e5d6" fontSize="9" letterSpacing="2">CONNECTED COMPANY MEMORY</text>
    <Tile x={20} y={49} width={113} title="Documents" subtitle="Synced archive" />
    <Tile x={20} y={119} width={113} title="Email" subtitle="Business context" color="#b9c6fa" />
    <Route d="M133 76 H150 V111 H174 M133 146 H150 V111" />
    <rect x="174" y="55" width="132" height="113" rx="17" fill="#99e5d6" fillOpacity=".1" stroke="#99e5d6" strokeOpacity=".65" />
    <path d="M227 78 L240 70 L253 78 V94 L240 102 L227 94 Z M240 70 V86 L253 94 M227 78 L240 86 V102" fill="none" stroke="#99e5d6" strokeWidth="1.5" />
    <text x="240" y="125" textAnchor="middle" fill="#f1f5f9" fontSize="12" fontWeight="600">Shared AI memory</text>
    <text x="240" y="145" textAnchor="middle" fill="#b2c4d4" fontSize="9">Evidence + company context</text>
    <Route d="M306 111 H326 V45 H342 M326 111 H342 M326 111 V177 H342" color="#c4b5fd" />
    <Tile x={342} y={18} width={118} title="Search" subtitle="Relevant evidence" color="#c4b5fd" />
    <Tile x={342} y={84} width={118} title="CRM / ERP" subtitle="Connected operations" color="#b9c6fa" />
    <Tile x={342} y={150} width={118} title="Tools + agents" subtitle="Reviewed actions" />
    <rect x="20" y="190" width="286" height="20" rx="10" fill="#ffffff" fillOpacity=".04" />
    <text x="163" y="204" textAnchor="middle" fill="#94a3b8" fontSize="8" letterSpacing="1">SYNCED · SEARCHABLE · GOVERNED</text>
  </>;
  else if (kind === 'rag') scene = <>
    <text x="20" y="27" fill="#c4b5fd" fontSize="9" letterSpacing="2">FROM DOCUMENTS TO EVIDENCE</text>
    {[0, 1, 2].map(i => <g key={i} transform={`translate(${24 + i * 8} ${58 + i * 10})`}>
      <rect width="89" height="107" rx="9" fill="#192033" stroke="#c4b5fd" strokeOpacity=".35" />
      {[0, 1, 2, 3].map(line => <rect key={line} x="14" y={23 + line * 17} width={line === 2 ? 48 : 61} height="4" rx="2" fill={line === 2 ? '#c4b5fd' : '#64748b'} />)}
    </g>)}
    <Route d="M135 118 H159 M151 111 L159 118 L151 125" color="#c4b5fd" />
    <Tile x={170} y={91} width={130} title="Retrieve evidence" subtitle="Relevant passages" color="#c4b5fd" />
    <Route d="M300 118 H323 M315 111 L323 118 L315 125" color="#c4b5fd" />
    <rect x="334" y="56" width="126" height="121" rx="12" fill="#c4b5fd" fillOpacity=".06" stroke="#c4b5fd" strokeOpacity=".3" />
    <text x="348" y="80" fill="#f1f5f9" fontSize="11" fontWeight="600">Grounded answer</text>
    {[0, 1, 2].map(i => <rect key={i} x="348" y={95 + i * 13} width={i === 2 ? 68 : 94} height="4" rx="2" fill="#94a3b8" fillOpacity=".5" />)}
    <text x="348" y="154" fill="#c4b5fd" fontSize="9">[1] Source  [2] Source</text>
    <text x="240" y="206" textAnchor="middle" fill="#94a3b8" fontSize="9">Source gaps stay visible. Evidence comes first.</text>
  </>;
  else if (kind === 'db') scene = <>
    <text x="20" y="27" fill="#99e5d6" fontSize="9" letterSpacing="2">CONTACT QUALITY, NOT JUST STORAGE</text>
    <Tile x={20} y={55} width={143} title="Contact A" subtitle="Incomplete record" color="#b9c6fa" />
    <Tile x={20} y={125} width={143} title="Contact A" subtitle="Duplicate entry" color="#b9c6fa" />
    <Route d="M163 82 H187 V117 H217 M163 152 H187 V117" />
    <circle cx="236" cy="117" r="19" fill="#99e5d6" fillOpacity=".12" stroke="#99e5d6" strokeOpacity=".5" />
    <path d="M228 117 L234 123 L245 111" fill="none" stroke="#99e5d6" strokeWidth="2" />
    <Route d="M255 117 H283 M275 110 L283 117 L275 124" />
    <rect x="294" y="55" width="166" height="123" rx="12" fill="#99e5d6" fillOpacity=".06" stroke="#99e5d6" strokeOpacity=".3" />
    <text x="308" y="78" fill="#f1f5f9" fontSize="11" fontWeight="600">Validated directory</text>
    {[0, 1, 2].map(i => <g key={i}><circle cx="316" cy={100 + i * 25} r="6" fill="#99e5d6" fillOpacity=".6" /><rect x="330" y={97 + i * 25} width="91" height="5" rx="2" fill="#94a3b8" fillOpacity=".5" /><path d={`M437 ${98 + i * 25} l3 3 l5 -6`} fill="none" stroke="#99e5d6" /></g>)}
    <text x="240" y="207" textAnchor="middle" fill="#94a3b8" fontSize="9">Deduplicate · validate · segment · reuse</text>
  </>;
  else if (kind === 'load') scene = <>
    <text x="20" y="27" fill="#bae6fd" fontSize="9" letterSpacing="2">CONFIRMED CRATES · LOADING CHECK</text>
    <rect x="20" y="51" width="294" height="132" rx="10" fill="#bae6fd" fillOpacity=".03" stroke="#bae6fd" strokeOpacity=".45" />
    <path d="M32 64 H303 M32 170 H303 M33 64 V170 M302 64 V170" stroke="#bae6fd" strokeOpacity=".15" fill="none" />
    {[[41,75,76,39],[123,75,57,39],[186,75,100,39],[41,120,57,38],[104,120,76,38],[186,120,57,38]].map(([x,y,w,h],i) => <g key={i}><rect x={x} y={y} width={w} height={h} rx="4" fill={i % 2 ? '#99e5d6' : '#bae6fd'} fillOpacity=".2" stroke="#bae6fd" strokeOpacity=".35" /><path d={`M${x+8} ${y+8} h${w-16} M${x+w/2} ${y+4} v${h-8}`} stroke="#bae6fd" strokeOpacity=".18" /></g>)}
    <Tile x={333} y={51} width={127} title="Dimensions" subtitle="Checked against load" color="#bae6fd" />
    <Tile x={333} y={117} width={127} title="Compatibility" subtitle="Operational constraints" />
    <text x="20" y="207" fill="#94a3b8" fontSize="9">Illustrative load layout · not a customer shipment</text>
  </>;
  else scene = <>
    <text x="20" y="27" fill="#fed7aa" fontSize="9" letterSpacing="2">SMALL TOOLS, REPEATABLE OUTPUTS</text>
    <Tile x={20} y={74} width={120} title="Raw exports" subtitle="Files + spreadsheets" color="#fed7aa" />
    <Route d="M140 101 H164 M156 94 L164 101 L156 108" color="#fed7aa" />
    <Tile x={175} y={74} width={125} title="Clean + combine" subtitle="Repeatable processing" color="#fed7aa" />
    <Route d="M300 101 H323 M315 94 L323 101 L315 108" />
    <rect x="334" y="51" width="126" height="121" rx="12" fill="#99e5d6" fillOpacity=".06" stroke="#99e5d6" strokeOpacity=".3" />
    <text x="348" y="75" fill="#f1f5f9" fontSize="11" fontWeight="600">Structured report</text>
    {[35, 53, 42, 65].map((h,i) => <rect key={i} x={350+i*24} y={153-h} width="13" height={h} rx="3" fill={i===3 ? '#99e5d6' : '#fed7aa'} fillOpacity=".6" />)}
    <text x="240" y="207" textAnchor="middle" fill="#94a3b8" fontSize="9">Less copying. Consistent information.</text>
  </>;

  return <svg role="img" aria-label={descriptions[kind]} viewBox="0 0 480 228" className={`h-full w-full ${className}`} fontFamily="Arial, sans-serif">
    <rect x="1" y="1" width="478" height="226" rx="16" fill="#ffffff" fillOpacity=".025" stroke="#ffffff" strokeOpacity=".08" />
    {scene}
  </svg>;
}
