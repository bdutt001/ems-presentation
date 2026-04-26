import { useEffect, useRef, useState } from "react";
import "./index.css";

import LoopDiagram from "./components/LoopDiagram";
import SurveillanceTimeline from "./components/SurveillanceTimeline";

type SlideKey =
  | "intro"
  | "problem"
  | "findings"
  | "conclusion"
  | "references";

export default function App() {
  const syncLock = useRef(false);
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

  const lastSyncedActions = useRef(0);
  const lastSyncedIdle = useRef(0);

  const sessionIdleRef = useRef(0);

  // latest state refs for stable interval access
  const actionsRef = useRef(0);
  const idleRef = useRef(0);


  // -----------------------------
  // keep refs updated
  // -----------------------------
  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  useEffect(() => {
    idleRef.current = idle;
  }, [idle]);

  // -----------------------------
  // ACTION HANDLER
  // -----------------------------
  const registerAction = () => {
    const now = Date.now();

    const secondsSinceAction = Math.floor(
      (now - lastActionTime.current) / 1000
    );

    // if returning from idle, commit the live idle once
    if (secondsSinceAction > 5 && idleStartRef.current !== null) {
      const delta = Math.floor(
        (now - idleStartRef.current) / 1000
      );

      committedIdleRef.current += delta;
      idleStartRef.current = null;
    }

    lastActionTime.current = now;
    setActions((a) => a + 1);
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
        // start idle tracking once
        if (idleStartRef.current === null) {
          idleStartRef.current = lastActionTime.current + 5000;
        }

        const liveIdle = Math.floor(
          (now - idleStartRef.current) / 1000
        );

        sessionIdleRef.current =
          committedIdleRef.current + liveIdle;

        setIdle(sessionIdleRef.current);
      } else {
        // if user becomes active, finalize idle once
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
    totals.total_clicks +
    (actions - lastSyncedActions.current);

  const liveIdle =
    totals.total_idle_time +
    (idle - lastSyncedIdle.current);

  // -----------------------------
  // FETCH TOTALS
  // -----------------------------
  const fetchTotals = async () => {
    const res = await fetch(
      "https://ems-presentation.onrender.com/activity/totals"
    );

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
  useEffect(() => {
    const interval = setInterval(async () => {
      if (syncLock.current) return;

      const clickDelta =
        actionsRef.current - lastSyncedActions.current;

      const idleDelta =
        idleRef.current - lastSyncedIdle.current;

      // nothing new to sync
      if (clickDelta === 0 && idleDelta === 0) return;

      syncLock.current = true;

      await fetch(
        "https://ems-presentation.onrender.com/activity/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clicks: clickDelta,
            idle: idleDelta,
          }),
        }
      );

      // only advance markers after successful post
      lastSyncedActions.current = actionsRef.current;
      lastSyncedIdle.current = idleRef.current;

      await fetchTotals();

      syncLock.current = false;
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // -----------------------------
  // SLIDES
  // -----------------------------
  const slides: Record<SlideKey, React.ReactNode> = {
    intro: (
      <div className="col">
        <div className="card">
          <h1>Employee Monitoring Software</h1>
          <h2>Productivity, Surveillance, and Behavior</h2>
          <p>This presentation is actively tracking your interaction.</p>
        </div>
        <div className="card">
          <h2>What Is Employee Monitoring Software?</h2>
          <p>
            Employee monitoring software tracks keystrokes, mouse movement,
            application usage, and screen activity to evaluate
            productivity and enforce oversight 
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
              (Cinque, 2024; Munn, 2024)
            </span>
            .
          </p>
          <h3>Why Organizations Use It</h3>
          <ul>
            <li>Cybersecurity and insider threat prevention</li>
            <li>Remote work accountability</li>
            <li>Productivity measurement</li>
          </ul>
        </div>
      </div>
    ),


    problem: (
      <div className="col">
        <div className="card">
          <h2>The Core Problem</h2>
          <p>
            Activity-based monitoring systems assume that productivity can be accurately inferred from digital behavior such as keystrokes, mouse movement, and screen time {" "}
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
            (Andrejevic, 2024)
            </span>
            . However, in knowledge-based work, meaningful output is separate from continuous observable activity 
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
              (Vitak & Zimmer, 2023; Munn, 2024)
              </span>
              .
          </p>
          <p>
            For instance, much of the work of a programmer involves non-linear processes like problem-solving, planning, and debugging. In these cases, periods of inactivity may reflect deep engagement rather than disengagement. As a result, activity-based metrics risk misrepresenting productive work as inactivity, while overvaluing superficial interaction with systems.
          </p>
          <h3>Ask Yourself</h3>
          <p>
              Are the metrics shown meaningfully representative of your engagement with the material on this site?
          </p>
        </div>
        
      </div>
    ),

    findings: (
      <div className="col">
        <div className="card">
          <h2>Escalation of Surveillance</h2>
          <p>The extent of monitoring generally exhibited by organizations has increased over time. This progression illustrates a shift from periodic managerial evaluation to continuous, algorithmic evaluation of workplace behavior.</p>
          <div className="row-apart three">
            <div className="column text">
              <h3>1. Trust (Pre-Digital Oversight)</h3>
              <p>Productivity and security are ensured through human supervision and judgement.</p>
              <h3>2. Light Monitoring (Early Digital Tools)</h3>
              <p>Early digital tools still hardly constituted surveillance, most providing login systems for security and simple online/offline indicators.</p>
              <h3>3. Quantified Behavior Tracking</h3>
              <p>This marks the shift towards workplace surveillance systems. Collecting data like keystrokes and mouse movements transforms how productivity is measured 
                {" "}
                <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >(Cinque, 2024)</span>. </p>
              <h3>4. Algorithmic Scoring</h3>
              <p>Productivity is reduced to a single computed quantity based on an aggregation of metrics, eliminating human judgement entirely 
                {" "}
                <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >(Andrejevic, 2024)</span>. </p>
              <h3>5. Continuous Surveillance (Fully Integrated Systems)</h3>
              <p>Systems continuously monitor and update metrics, including predictive algorithms, idle detection and alerts 
               {" "}
                <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >(Munn, 2024; Cinque, 2024)</span>. Productivity becomes defined by what can be monitored.</p>
              
            </div>
            <SurveillanceTimeline></SurveillanceTimeline>
          </div>
          
        </div>
        <div className="card">
          <h2>Employee Perspective</h2>
          <p>
            Monitoring affects employee trust, autonomy, and morale,
            especially when systems are opaque or overly invasive 
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
              (Munn, 2024; Vitak & Zimmer, 2023)
            </span>
            . 
          </p>
          <p>Furthermore, the perceived legitimacy of monitoring practices is highly dependent on an organization's transparency and extent of enforcement 
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
              (Vitak & Zimmer, 2023)
            </span>  
              . Opaque or extensive methods of monitoring lead to a lack of employee cooperation, which can have subsequent effects on monitoring efficacy 
              {" "}
              <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
              (Goh, 2023; Cinque, 2024)
              </span>
              . </p>
          <h3>Behavioral Effects</h3>
          <ul>
            <li>Faking activity via automation</li>
            <li>Slower work pacing to avoid idle time</li>
            <li>Optimizing behavior for metrics instead of output</li>
          </ul>
          
        </div>
        <div className="card">
          <h2>Behavioral Loop</h2>
        
          <p>Employee monitoring systems create a continuous feedback loop where tracked behavior is converted into metrics that influence future behavior.</p>
          <p>These systems do not just passively measure productivity, they redefine it 
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >
              (Andrejevic, 2024; Cinque, 2024)
              </span>
              .</p>
        
        
          <div className="row-apart two">
        
            <div className="column text">
              <h3>Step 1: Monitoring Practices → Employee Awareness</h3>
              <p>Software collects employee data. This data is then used to evaluate performance, making employees aware of how they will be monitored.</p>
              <h3>Step 2: Employee Awareness → Adjusted Behavior</h3>
              <p>Employee awareness of specific monitoring practices informs new behavior. This may include exploiting the system with mouse and keyboard automation.</p>
              <h3>Step 3: Adjusted Behavior → Distorted Metrics</h3>
              <p>When exploitative behaviors go undetected, the data becomes skewed.</p>
              <p>The accuracy of these metrics as measurements of productivity is already up for debate, but their susceptibility to manipulation raises further concerns. </p>
              <h3>Step 4: Metrics → Monitoring Practices</h3>
              <p>Data is used to justify continued or expanded monitoring.</p>
               <p>This creates the positive feedback loop: what is measurable becomes treated as what matters, even as it diverges from actual productivity.</p>
            </div>
            <div>
              <LoopDiagram></LoopDiagram>
            </div>
          </div>         
        </div>
        <div className="card">
          <h2>Structural Change</h2>
          <p>Not only does employee monitoring software influence behavior, it redistributes power in the workplace. Monitoring shifts power away from employees toward those who control and enforce the monitoring system, i.e., management 
            {" "}
            <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >(Munn, 2024; Andrejevic, 2024)</span>. </p>
          <h3>Power Shift</h3>
          <ul>
            <li>Management controls what data is collected.</li>
            <li>Management controls how that data is interpeted.</li>
            <li>Employees have disparate or no knowledge of monitoring metrics 
              {" "}
              <span
                className="citation-link"
                onClick={() => setSlide("references")}
              >
                (Vitak & Zimmer, 2023)
              </span>
              .
            </li>
          </ul>
        </div>
        
        
      </div>
    ),

    conclusion: (
      <div className="card">
        <h2>Conclusion</h2>
        <p>
          Monitoring software does not simply measure productivity. It actively reshapes how productivity is defined, perceived, and enacted within organizations
           {" "}
           <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >(Andrejevic, 2024)</span> . Across the literature, a consistent pattern emerges: as monitoring becomes more data-driven and continuous, it prioritizes measurable activity over meaningful work, encouraging employees to adapt their behavior to the metrics being tracked.
        </p>
        <p>
          This produces a feedback loop in which surveillance systems both generate and reinforce their own definitions of productivity 
          {" "}
          <span
              className="citation-link"
              onClick={() => setSlide("references")}
            >(Cinque, 2024; Munn, 2024)</span>. As a result, organizational evaluation becomes increasingly detached from actual output, while trust and autonomy are reduced.
        </p>
        <h3>Recommendations</h3>
        <ul>
          <li>Prioritize outcome-based evaluation over activity-based metrics</li>
          <li>Ensure transparency in what data is collected and how it will be used</li>
          <li>Treat monitoring as a targeted security tool rather than a method of enforcing productivity</li>
          <li>Recognize that metrics are not neutral, they shape behavior and therefore require critical interpretation</li>
        </ul>
      </div>
    ),

    references: (
      <div className="card">
        <h2>References</h2>
        <p className="hanging-indent">Andrejevic, M. (2024). Automated Monitoring in the Workplace: The Devolution of Recognition. <span style={{ fontStyle: 'italic'}}>International Journal of Communication (19328036), 18</span>, 3205–3211. </p>
        <p className="hanging-indent">Cinque, T. (2024). Rise of the Performance and Assessment Filter: Microsoft Viva “Bossware,” Presence Status, and the Power of Surveillance Machines— Sleepers Awake! <span style={{ fontStyle: 'italic'}}> International Journal of Communication (19328036), 18</span>, 3162–3181. </p>
        <p className="hanging-indent">Goh, C.T. (2023). Employee surveillance is on the rise — and that could backfire on employers.<span style={{ fontStyle: 'italic'}}> CNBC </span>. <a href="https://www.cnbc.com/2023/04/24/employee-surveillance-is-on-the-rise-that-could-backfire-on-employers.html">https://www.cnbc.com/2023/04/24/employee-surveillance-is-on-the-rise-that-could-backfire-on-employers.html</a> </p>
        <p className="hanging-indent">Munn, L. (2024). More Than Monitoring: Grappling With Bossware Introduction. <span style={{ fontStyle: 'italic'}}> International Journal of Communication (19328036), 18</span>, 3128–3139. </p>
        <p className="hanging-indent">Vitak, J., & Zimmer, M. (2023). Surveillance and the future of work: exploring employees’ attitudes toward monitoring in a post-COVID workplace.<span style={{ fontStyle: 'italic'}}> Journal of Computer-Mediated Communication, 28</span>(4). <a href="https://doi.org/10.1093/jcmc/zmad007">https://doi.org/10.1093/jcmc/zmad007</a> </p>
      
      </div>
    )
  };

  const navItems = [
    { key: "intro", label: "Intro" },
    { key: "problem", label: "Problem" },
    { key: "findings", label: "Findings" },
    { key: "conclusion", label: "Conclusion" },
    { key: "references", label: "References"},
  ] as const;

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div onClick={registerAction}>
      <header className="header">
        <h1>Workplace Surveillance</h1>

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
                  slide === item.key
                    ? "translateY(-2px)"
                    : "none",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="layout">
        <main className="about">
          <div
            key={slide}
            className="timeline-item slide"
          >
            {slides[slide]}
          </div>
        </main>

        <aside>
          <div className="hud">
            <div className="column">
              <div className="activity current">
                <h2>Your Activity</h2>

                <div>
                  <div className="row-apart">
                    <p>Actions:</p>
                    <p>{actions}</p>
                  </div>
                  <div className="row-apart">
                    <p>Idle Time:</p>
                    <p>{idle}s</p>
                  </div>
                </div>
              </div>

              <div className="activity totals">
                <h2>Global</h2>

                <div>
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
            </div>
          </div>
          <div className="card disc">
            <h3>Disclaimer</h3>
            <p>
              Data is collected for demonstration purposes. Only anonymous activity data (clicks and idle time) is recorded.
            </p>
          </div>

          {Math.floor(
            (Date.now() - lastActionTime.current) / 1000
          ) > 5 ? (
            <div className="warning">⚠ Idle</div>
          ) : (
            <div className="active-indicator">
              ● Active
            </div>
          )}

          
        </aside>
      </div>
      <footer className="footer">
        <div className="row-apart two">
          <div className="footer-text">
            <h3>Copyright</h3>
            <p>© 2026 Ben Dutton, Old Dominion University. For educational use only.</p>
            <h3>Disclaimer</h3>
            <p>This site is a student project created for educational and research purposes only.
                It does not represent a real employee monitoring system.
            </p>
            <h3>Privacy Statement</h3>
            <p>This site collects anonymous interaction data (clicks and idle time) for demonstration purposes.
                No personal data is stored or shared.
            </p>
          </div>
          <div>
            <a href="mailto:bendutton9@gmail.com">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}