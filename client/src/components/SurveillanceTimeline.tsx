import "./SurveillanceTimeline.css";
export default function SurveillanceTimeline() {
  return (
    <div className="diagram">
      <svg viewBox="0 0 400 600" className="timeline-svg">

        <defs>
          <marker
            id="arrow"
            markerWidth="10"
            markerHeight="10"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="var(--border)" />
          </marker>
        </defs>

        {/* spine */}
        <line
          x1="200"
          y1="120"
          x2="200"
          y2="180"
          stroke="var(--border)"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />

        <line
          x1="200"
          y1="220"
          x2="200"
          y2="280"
          stroke="var(--border)"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />

        <line
          x1="200"
          y1="320"
          x2="200"
          y2="380"
          stroke="var(--border)"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />

        <line
          x1="200"
          y1="420"
          x2="200"
          y2="480"
          stroke="var(--border)"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />

        {/* NODE COMPONENT STYLE */}
        <g className="node" transform="translate(200 100)">
          <rect x="-80" y="-20" width="160" height="40" rx="16" />
          <text textAnchor="middle" dominantBaseline="middle">
            Trust
          </text>
        </g>

        <g className="node" transform="translate(200 200)">
          <rect x="-120" y="-20" width="240" height="40" rx="16" />
          <text textAnchor="middle" dominantBaseline="middle">
            Light Monitoring
          </text>
        </g>

        <g className="node" transform="translate(200 300)">
          <rect x="-130" y="-20" width="260" height="40" rx="16" />
          <text textAnchor="middle" dominantBaseline="middle">
            Behavior Tracking
          </text>
        </g>

        <g className="node" transform="translate(200 400)">
          <rect x="-140" y="-20" width="280" height="40" rx="16" />
          <text textAnchor="middle" dominantBaseline="middle">
            Algorithmic Scoring
          </text>
        </g>

        <g className="node" transform="translate(200 500)">
          <rect x="-160" y="-20" width="320" height="40" rx="16" />
          <text textAnchor="middle" dominantBaseline="middle">
            Continuous Surveillance
          </text>
        </g>

      </svg>
    </div>
  );
}