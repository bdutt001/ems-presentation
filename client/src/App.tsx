import { useEffect, useRef, useState } from "react";
import "./index.css";

type SlideKey =
  | "intro"
  | "what"
  | "why"
  | "problem"
  | "employee"
  | "conclusion";

export default function App() {
  const [slide, setSlide] = useState<SlideKey>("intro");

  // -----------------------------
  // session state
  // -----------------------------
  const [actions, setActions] = useState(0);
  const [idle, setIdle] = useState(0);

  // -----------------------------
  // backend totals
  // -----------------------------
  const [totals, setTotals] = useState({
    total_clicks: 0,
    total_idle_time: 0,
  });

  // -----------------------------
  // refs
  // -----------------------------
  const lastActionTime = useRef(Date.now());
  const lastMoveThrottle = useRef(0);

  const committedIdleRef = useRef(0);
  const idleStartRef = useRef<number | null>(null);

  const pendingIdleRef = useRef(0);
  const pendingClicksRef = useRef(0);

  const sessionIdleRef = useRef(0);

  // force UI refresh
  const [, forceRender] = useState(0);

  useEffect(() => {
    const t = setInterval(() => forceRender((x) => x + 1), 250);
    return () => clearInterval(t);
  }, []);

  // -----------------------------
  // ACTION HANDLER
  // -----------------------------
  const registerAction = () => {
    const now = Date.now();

    const secondsSinceAction = Math.floor(
      (now - lastActionTime.current) / 1000
    );

    if (secondsSinceAction > 5 && idleStartRef.current !== null) {
      const delta = Math.floor(
        (now - idleStartRef.current) / 1000
      );

      committedIdleRef.current += delta;
      pendingIdleRef.current += delta;

      idleStartRef.current = null;
    }

    lastActionTime.current = now;

    setActions((a) => a + 1);
    pendingClicksRef.current += 1;
  };

  // -----------------------------
  // INPUT EVENTS
  // -----------------------------
  useEffect(() => {
    const handleMouseMove = () => {
      const now = Date.now();

      if (now - lastMoveThrottle.current > 2000) {
        lastMoveThrottle.current = now;
        registerAction();
      }
    };

    const handleKeyDown = registerAction;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // -----------------------------
  // LIVE IDLE TIMER
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      const secondsSinceAction = Math.floor(
        (now - lastActionTime.current) / 1000
      );

      if (secondsSinceAction > 5) {
        if (idleStartRef.current === null) {
          idleStartRef.current = lastActionTime.current + 5000;
        }

        const liveIdle = Math.floor(
          (now - idleStartRef.current) / 1000
        );

        sessionIdleRef.current = committedIdleRef.current + liveIdle;
        setIdle(sessionIdleRef.current);
      } else {
        if (idleStartRef.current !== null) {
          const delta = Math.floor(
            (now - idleStartRef.current) / 1000
          );

          committedIdleRef.current += delta;
          idleStartRef.current = null;
        }

        sessionIdleRef.current = committedIdleRef.current;
        setIdle(sessionIdleRef.current);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // LIVE TOTALS
  // -----------------------------
  const liveClicks =
    totals.total_clicks + pendingClicksRef.current + actions;

  const liveIdle =
    totals.total_idle_time +
    sessionIdleRef.current +
    pendingIdleRef.current;

  // -----------------------------
  // FETCH TOTALS
  // -----------------------------
  const fetchTotals = async () => {
    const res = await fetch("https://ems-presentation.onrender.com/activity/totals");
    const data = await res.json();

    setTotals({
      total_clicks: data.total_clicks ?? 0,
      total_idle_time: data.total_idle_time ?? 0,
    });
  };

  useEffect(() => {
    fetchTotals();
  }, []);

  // -----------------------------
  // BACKEND SYNC
  // -----------------------------
  const updateServer = async (payload: {
    clicks: number;
    idle: number;
  }) => {
    await fetch("https://ems-presentation.onrender.com/activity/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (
        pendingClicksRef.current === 0 &&
        pendingIdleRef.current === 0
      ) {
        await fetchTotals();
        return;
      }

      await updateServer({
        clicks: pendingClicksRef.current,
        idle: pendingIdleRef.current,
      });

      pendingClicksRef.current = 0;
      pendingIdleRef.current = 0;

      await fetchTotals();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // SLIDES (RESTORED CONTENT)
  // -----------------------------
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
      </div>
    ),

    why: (
      <div className="col">
        <h2>Why It Exists</h2>
        <p>
          Organizations use monitoring tools to measure productivity,
          reduce risk, and ensure policy compliance in remote and in-office environments.
        </p>
      </div>
    ),

    problem: (
      <div className="col">
        <h2>The Core Problem</h2>
        <p>
          These systems blur the line between productivity tracking and surveillance,
          raising concerns about privacy, autonomy, and trust.
        </p>
      </div>
    ),

    employee: (
      <div className="col">
        <h2>Employee Perspective</h2>
        <p>
          Employees often feel pressure from constant visibility,
          which can increase stress and reduce autonomy.
        </p>
      </div>
    ),

    conclusion: (
      <div className="col">
        <h2>Conclusion</h2>
        <p>
          Monitoring tools are powerful, but they require careful balance
          between accountability and respect for privacy.
        </p>
      </div>
    ),
  };

  const navItems = [
    { key: "intro", label: "Intro" },
    { key: "what", label: "Background" },
    { key: "problem", label: "Problem" },
    { key: "employee", label: "Employees" },
    { key: "conclusion", label: "Conclusion" },
  ] as const;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div onClick={registerAction}>
      <header className="header">
        <h1>Employee Monitoring Software</h1>

        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className="nav-item"
              onClick={() => {
                setSlide(item.key);
                registerAction();
              }}
              style={{
                opacity: slide === item.key ? 1 : 0.5,
                transform:
                  slide === item.key ? "translateY(-2px)" : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="layout">
        <main className="about">
          <div key={slide} className="timeline-item slide">
            {slides[slide]}
          </div>
        </main>

        <aside>
          <div className="hud">
            <div className="column">
              <div>
                <h2>Your Activity</h2>

                <div className="row-apart">
                  <p>Actions:</p>
                  <p>{actions}</p>
                </div>

                <div className="row-apart">
                  <p>Idle Time:</p>
                  <p>{idle}s</p>
                </div>
              </div>

              <div>
                <h2>Totals</h2>

                <div className="row-apart">
                  <p>Actions:</p>
                  <p>{liveClicks}</p>
                </div>

                <div className="row-apart">
                  <p>Idle Time:</p>
                  <p>{liveIdle}s</p>
                </div>
              </div>
            </div>

            <h3>Disclaimer</h3>
            <p>
              All metrics are shown for demonstration purposes.
              This site does not collect user data.
            </p>
          </div>

          {Math.floor(
            (Date.now() - lastActionTime.current) / 1000
          ) > 5 ? (
            <div className="warning">⚠ Idle</div>
          ) : (
            <div className="active-indicator">● Active</div>
          )}
        </aside>
      </div>
    </div>
  );
}