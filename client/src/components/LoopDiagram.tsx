import "./LoopDiagram.css";

export default function LoopDiagram() {
  return (
    <div className="diagram">
      <svg viewBox="0 0 340 350" className="loop-svg">
        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="7"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L7,3 z" fill="var(--border)" />
          </marker>
        </defs>

        
        {/* NODES */}

        <g className="node-group">
          <circle cx="170" cy="60" r="44" />
          <text x="170" y="60" textAnchor="middle" dominantBaseline="middle">
            Monitoring
          </text>
        </g>

        <g className="node-group">
          <circle cx="300" cy="175" r="44" />
          <text x="300" y="175" textAnchor="middle" dominantBaseline="middle">
            Awareness
          </text>
        </g>

        <g className="node-group">
          <circle cx="170" cy="300" r="44" />
          <text x="170" y="300" textAnchor="middle" dominantBaseline="middle">
            Behavior
          </text>
        </g>

        <g className="node-group">
          <circle cx="40" cy="175" r="44" />
          <text x="40" y="175" textAnchor="middle" dominantBaseline="middle">
            Metrics
          </text>
        </g>
        {/* LOOP PATHS (draw FIRST so nodes sit on top) */}

        {/* TOP → RIGHT */}
        <path
          d="M214,60 Q300,60 300,132"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

        {/* RIGHT → BOTTOM */}
        <path
          d="M300,220 Q300,290 214,300"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

        {/* BOTTOM → LEFT */}
        <path
          d="M125,300 Q40, 300 40,219"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

        {/* LEFT → TOP */}
        <path
          d="M40,130 Q40,60 127,60"
          fill="none"
          stroke="var(--border)"
          strokeWidth="2"
          markerEnd="url(#arrow)"
        />

      </svg>
    </div>
  );
}