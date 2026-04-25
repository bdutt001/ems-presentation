import { useEffect, useState } from "react";
import "./index.css";

type SlideKey =
  | "intro"
  | "what"
  | "why"
  | "problem"
  | "employee"
  | "behavior"
  | "conclusion";

export default function App() {
  const [slide, setSlide] = useState<SlideKey>("intro");

  // --- monitoring state (your meta layer) ---
  const [clicks, setClicks] = useState(0);
  const [lastMove, setLastMove] = useState(Date.now());
  const [idle, setIdle] = useState(0);

  useEffect(() => {
    const click = () => setClicks((c) => c + 1);
    const move = () => setLastMove(Date.now());

    window.addEventListener("click", click);
    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("click", click);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setIdle(Math.floor((Date.now() - lastMove) / 1000));
    }, 1000);

    return () => clearInterval(t);
  }, [lastMove]);

  const slides: Record<SlideKey, React.ReactNode> = {
    intro: (
      <div className="col">
        <h1>Employee Monitoring Software</h1>
        <h2>Productivity, Surveillance, and Behavior</h2>
        <p>This presentation is actively tracking your interaction.</p>
      </div>
    ),

    what: (
      <div className="col">
        <h2>What Is Employee Monitoring Software?</h2>
        <p>
          Software that tracks keystrokes, mouse movement, application usage,
          and screen activity to evaluate productivity and enforce oversight.
        </p>
        <h3>Why Organizations Use It</h3>
        <ul>
          <li>Cybersecurity and insider threat prevention</li>
          <li>Remote work accountability</li>
          <li>Productivity measurement</li>
        </ul>
      </div>
    ),

    why: (
      <div className="col">
        
      </div>
    ),

    problem: (
      <div className="col">
        <h2>The Core Problem</h2>
        <p>
          Activity-based metrics often fail to represent meaningful work,
          especially in knowledge-based jobs like programming.
        </p>
        <h3>Ask Yourself:</h3>
        <p>
            Are the metrics shown below representative of your engagement with this site?
        </p>
      </div>
    ),

    employee: (
      <div className="col">
        <h2>Employee Perspective</h2>
        <p>
          Research shows monitoring affects trust, autonomy, and morale,
          especially when systems are opaque or overly invasive.
        </p>
        <h3>Behavioral Effects</h3>
        <ul>
          <li>Faking activity</li>
          <li>Slower work pacing</li>
          <li>Optimizing for metrics instead of output</li>
        </ul>
      </div>
    ),

    conclusion: (
      <div className="col">
        <h2>Conclusion</h2>
        <p>
          Monitoring software reshapes behavior and evaluation. Poor
          implementation can reduce trust and distort productivity.
        </p>
        <h3>Recommendations</h3>
        <ul>
          <li>Prioritize outcomes over activity</li>
          <li>Be transparent about monitoring</li>
          <li>Use monitoring primarily for security</li>
        </ul>
      </div>
    ),
  };

  const navItems: { key: SlideKey; label: string }[] = [
    { key: "intro", label: "Intro" },
    { key: "what", label: "Background" },
    { key: "problem", label: "Problem" },
    { key: "employee", label: "Employees" },
    { key: "conclusion", label: "Conclusion" },
  ];

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const i = navItems.findIndex((n) => n.key === slide);

      if (e.key === "ArrowRight") {
        setSlide(navItems[Math.min(i + 1, navItems.length - 1)].key);
      }

      if (e.key === "ArrowLeft") {
        setSlide(navItems[Math.max(i - 1, 0)].key);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [slide]);

  return (
    <div>
      {/* HEADER NAV */}
      <header className="header">
        <h1>Employee Monitoring Software</h1>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className="nav-item"
              onClick={() => setSlide(item.key)}
              style={{
                opacity: slide === item.key ? 1 : 0.5,
                transform: slide === item.key ? "translateY(-2px)" : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* SLIDE CONTENT */}
      

      
      <main className="about">
        <div key={slide} className="timeline-item slide">
          {slides[slide]}
        </div>
        {idle > 5 && (
        <div className="warning">
          ⚠ Inactivity detected
        </div>
        )}
        <div className="hud">
          <h2>Activity</h2>
          <div className="row-apart">
            <p>Clicks:</p><p>{clicks}</p>
          </div>
          <div className="row-apart">
            <p>Idle Time:</p><p>{idle}s</p>
          </div>
          <div className="row-apart">
            <p>Productivity Score:</p><p>{Math.max(0, 100 - idle + clicks)}</p>
          </div>
          <h3>Disclaimer</h3>
          <p>All metrics are shown for demonstration purposes. This site does not collect user data.</p>
        </div>
      </main>
    </div>
  );
}