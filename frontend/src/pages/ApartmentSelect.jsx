import { useState, useRef } from "react";

/**
 * ApartmentSelect — kid‑friendly feature picker styled as an apartment façade.
 *
 * Router‑safe: does NOT call `useNavigate` directly, so it won’t crash when
 * rendered outside a <Router>. If you're inside react‑router and want SPA
 * navigation, pass a `navigate` prop from the parent (e.g.,
 *   const nav = useNavigate();
 *   <ApartmentSelect features={FEATURES} navigate={(to)=>nav(to)} />)
 *
 * Props
 * - features: Array<{ id, label, to, bg, char, icon }>
 * - title?: string
 * - routeOnClick?: boolean (default true)
 * - onOpen?: (feature) => void             // priority action when provided
 * - navigate?: (to: string) => void        // SPA navigation function (from parent)
 */
export default function ApartmentSelect({
  features = [],
  title = "Pick a door to explore!",
  routeOnClick = true,
  onOpen,
  navigate,
}) {
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);
  const buildingRef = useRef(null);

  const onEnter = (f) => setHovered(f.id);
  const onLeave = () => setHovered(null);
  const onFocus = (f) => setFocused(f.id);
  const onBlur = () => setFocused(null);

  const handleOpen = (f) => {
    const action = resolveOpenAction({
      routeOnClick,
      hasOnOpen: typeof onOpen === "function",
      hasNavigate: typeof navigate === "function",
      hasTo: Boolean(f?.to),
    });

    switch (action) {
      case "callback":
        onOpen?.(f);
        break;
      case "navigate":
        navigate?.(f.to);
        break;
      case "location":
        // Router-agnostic fallback
        if (f?.to) window.location.assign(f.to);
        break;
      default:
        // no-op; maybe show a tooltip later
        break;
    }
  };

  return (
    <section className="apt-wrap" aria-label="Feature apartment">
      {/* Street / background scene */}
      <div className="apt-scene" aria-hidden>
        <div className="apt-cloud a" />
        <div className="apt-cloud b" />
        <div className="apt-birds" />
        <div className="apt-street" />
      </div>

      {/* Building */}
      <div ref={buildingRef} className="apt-building" role="group" aria-labelledby="apt-title">
        <AptRoof />

        <header className="apt-header">
          <h3 id="apt-title">{title}</h3>
          <p className="apt-sub">Tap a window or door. Use arrow keys to move, Enter to open.</p>
        </header>

        {/* Elevator (just for fun) */}
        <div className="apt-elevator" aria-hidden>
          <div className="car">
            <span className="light" />
          </div>
          <div className="shaft" />
        </div>

        {/* Windows grid */}
        <div className="apt-grid" role="list">
          {features.map((f, i) => (
            <button
              key={f.id}
              role="listitem"
              className={[
                "apt-window",
                i === features.length - 1 ? "door" : "",
                hovered === f.id || focused === f.id ? "is-hot" : "",
              ].join(" ")}
              onMouseEnter={() => onEnter(f)}
              onMouseLeave={onLeave}
              onFocus={() => onFocus(f)}
              onBlur={onBlur}
              onClick={() => handleOpen(f)}
              aria-label={f.label}
            >
              <span className="apt-sill" aria-hidden />

              {/* glass + bg + char */}
              <span className="apt-arch">
                <span className="apt-bg" style={{ backgroundImage: f.bg ? `url(${f.bg})` : undefined }} />
                {f.char && <img className="apt-char" src={f.char} alt="" />}
              </span>

              <span className="apt-badge" aria-hidden>
                <span className="ic" role="img" aria-label={f.label}>
                  {f.icon || "⭐"}
                </span>
              </span>

              <span className="apt-tag">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Ground floor shrubs for cozy vibe */}
        <div className="apt-garden" aria-hidden>
          <span className="bush" />
          <span className="bush" />
          <span className="bush" />
        </div>
      </div>

      <style>{styles}</style>
    </section>
  );
}

function AptRoof() {
  return (
    <div className="apt-roof" aria-hidden>
      <div className="ridge" />
      <div className="chimney">
        <span className="smoke s1" />
        <span className="smoke s2" />
        <span className="smoke s3" />
      </div>
      <div className="sign">
        <span className="brand">
          Little<span>Stars</span>
        </span>
      </div>
    </div>
  );
}

// ——————————————————————————————
// Logic helpers + lightweight self-tests
// ——————————————————————————————
export function resolveOpenAction({ routeOnClick, hasOnOpen, hasNavigate, hasTo }) {
  if (hasOnOpen) return "callback";        // highest priority
  if (hasNavigate && hasTo) return "navigate"; // SPA path
  if (routeOnClick && hasTo) return "location"; // fallback full reload
  return "noop";
}

// Minimal test runner (no DOM). Call runApartmentSelectTests() from console if desired.
export function runApartmentSelectTests() {
  const cases = [
    { name: "uses onOpen when provided", input: { routeOnClick: true, hasOnOpen: true, hasNavigate: true, hasTo: true }, expect: "callback" },
    { name: "uses navigate when no onOpen", input: { routeOnClick: true, hasOnOpen: false, hasNavigate: true, hasTo: true }, expect: "navigate" },
    { name: "falls back to location when routeOnClick & to", input: { routeOnClick: true, hasOnOpen: false, hasNavigate: false, hasTo: true }, expect: "location" },
    { name: "noop when no to and nothing else", input: { routeOnClick: true, hasOnOpen: false, hasNavigate: false, hasTo: false }, expect: "noop" },
    { name: "noop when routeOnClick=false and no navigate/onOpen", input: { routeOnClick: false, hasOnOpen: false, hasNavigate: false, hasTo: true }, expect: "noop" },
  ];
  const results = cases.map(({ name, input, expect }) => ({ name, pass: resolveOpenAction(input) === expect }));
  if (typeof window !== "undefined") {
    // pretty-print to console without breaking apps
    const ok = results.every(r => r.pass);
    // eslint-disable-next-line no-console
    console.log("ApartmentSelect self-tests:", { ok, results });
  }
  return results;
}

// ——————————————————————————————
// Styles (you can move this string into bug-tower.css later)
// ——————————————————————————————
const styles = `
:root{
  --apt-stone:#f7c88c; /* warm facade */
  --apt-brick:#dba86c;
  --apt-brick-dark:#c78346;
  --apt-roof:#d46a3a;
  --apt-roof-dark:#b24f24;
  --ink:#15354a;
  --shadow: rgba(0,0,0,.14);
  --glass:#e9f3ff;
  --badge:#ffffff;
  --focus:#ffde7a;
}

.apt-wrap{ position:relative; padding: 28px 16px 64px; font-family: "Baloo 2", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial; color:var(--ink); }

/* scene */
.apt-scene .apt-cloud{ position:absolute; top: 24px; width: 160px; height: 60px; background:#fff; border-radius:40px; filter: drop-shadow(0 6px 8px rgba(0,0,0,.06)); }
.apt-scene .apt-cloud::before,.apt-scene .apt-cloud::after{ content:""; position:absolute; background:#fff; border-radius:50px; }
.apt-scene .apt-cloud::before{ width: 90px; height:60px; left:20px; top:-24px; }
.apt-scene .apt-cloud::after{ width: 70px; height:50px; right:10px; top:-18px; }
.apt-scene .a{ left:6%; animation: drift 48s linear infinite; }
.apt-scene .b{ right:8%; top:56px; animation: drift 36s linear infinite reverse; }
.apt-birds{ position:absolute; top:80px; left:50%; width:120px; height:32px; opacity:.2; background: radial-gradient(8px 4px at 12px 16px, #0004 40%, transparent 41%), radial-gradient(8px 4px at 52px 16px, #0004 40%, transparent 41%), radial-gradient(8px 4px at 92px 16px, #0004 40%, transparent 41%); transform: translateX(-50%); animation: soar 14s ease-in-out infinite; }
.apt-street{ position:absolute; left:0; right:0; bottom:0; height:64px; background: linear-gradient(180deg, #cbe7ff, #b8defc); }
@keyframes drift{ from{transform:translateX(0)} to{transform:translateX(-6%)} }
@keyframes soar{ 0%,100%{ transform: translateX(-50%) translateY(0);} 50%{ transform: translateX(-48%) translateY(-6px);} }

/* building */
.apt-building{ position:relative; width:min(980px, 88%); margin:0 auto; background:var(--apt-stone); border: 2px solid var(--apt-brick-dark); border-radius: 16px; box-shadow: 0 16px 40px var(--shadow), inset 0 3px 0 rgba(255,255,255,.5); overflow:hidden; }

/* subtle brick dots */
.apt-building::after{ content:""; position:absolute; inset:0; pointer-events:none; background-image: radial-gradient(#e6a964 2px, transparent 2px), radial-gradient(#e6a964 2px, transparent 2px); background-position: 20px 24px, 80px 64px; background-size: 80px 80px; opacity:.45; }

/* roof */
.apt-roof{ position:relative; height:56px; background:var(--apt-roof); border-bottom: 4px solid var(--apt-roof-dark); display:flex; align-items:center; justify-content:center; }
.apt-roof .ridge{ position:absolute; inset:auto 16px 8px; height:6px; background:#0002; border-radius:99px; }
.apt-roof .chimney{ position:absolute; left:24px; top:8px; width:28px; height:34px; background:#b1572e; border:2px solid #8f3e1d; border-radius:4px; }
.apt-roof .chimney .smoke{ position:absolute; width:10px; height:10px; background:#fff; border-radius:50%; left:9px; top:-8px; opacity:.6; }
.apt-roof .chimney .s1{ animation: puff 2.2s ease-in-out infinite; }
.apt-roof .chimney .s2{ animation: puff 2.2s .6s ease-in-out infinite; }
.apt-roof .chimney .s3{ animation: puff 2.2s 1.2s ease-in-out infinite; }
@keyframes puff{ 0%{ transform: translateY(0) scale(1); opacity:.6;} 100%{ transform: translateY(-18px) scale(1.4); opacity:0;} }
.apt-roof .sign{ position:absolute; right:16px; top:8px; background:#ffffffdd; border:2px dashed #8fb9d7; border-radius:10px; padding:6px 10px; box-shadow:0 3px 10px rgba(0,0,0,.08); }
.apt-roof .sign .brand{ font-weight:900; letter-spacing:.2px; }
.apt-roof .sign .brand span{ color:#ffbe5e; }

/* header */
.apt-header{ text-align:center; padding: 12px 12px 0; }
.apt-header h3{ margin:.25rem 0 0; font-size: clamp(20px, 3.2vw, 28px); }
.apt-header .apt-sub{ margin:.35rem 0 10px; opacity:.8; font-weight:700; font-size: 14px; }

/* elevator */
.apt-elevator{ position:absolute; right:6px; top:64px; bottom:72px; width:46px; display:flex; align-items:flex-end; justify-content:center; }
.apt-elevator .shaft{ position:absolute; inset:10px 16px 12px 20px; background: repeating-linear-gradient( to bottom, #d2b08a, #d2b08a 10px, #c79b6e 10px, #c79b6e 20px ); border-left:2px solid #b07b49; border-right:2px solid #b07b49; border-radius: 8px; opacity:.5; }
.apt-elevator .car{ z-index:2; width:38px; height:46px; background:#f9f9fb; border:2px solid #93b8d6; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,.12); animation: lift 6.5s ease-in-out infinite alternate; display:grid; place-items:center; }
.apt-elevator .car .light{ width:6px; height:6px; border-radius:50%; background:#ffca5c; box-shadow:0 0 10px #ffca5c; }
@keyframes lift{ 0%{ transform: translateY(0);} 100%{ transform: translateY(-60%);} }

/* grid */
.apt-grid{ display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; padding: 14px; }
@media (max-width: 900px){ .apt-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 560px){ .apt-grid{ grid-template-columns: 1fr; } }

/* window/door */
.apt-window{ position:relative; border:2px solid var(--apt-brick-dark); background:#fff3; border-radius: 14px; padding: 12px; box-shadow: 0 10px 24px var(--shadow); cursor:pointer; text-align:center; overflow:hidden; isolation:isolate; min-height: 220px; }
.apt-window .apt-sill{ position:absolute; left:8%; right:8%; bottom:8px; height:10px; background:#f3b46c; border:2px solid var(--apt-brick-dark); border-radius:6px; box-shadow: inset 0 2px 0 rgba(255,255,255,.55); }
.apt-window .apt-arch{ position:relative; display:block; height: 160px; border-radius: 16px 16px 12px 12px / 30px 30px 12px 12px; background: var(--glass); box-shadow: inset 0 8px 18px rgba(255,255,255,.65); overflow:hidden; }
.apt-window .apt-bg{ position:absolute; inset:0; background-position:center; background-size:cover; background-repeat:no-repeat; filter: saturate(1.05) contrast(1.02); }
.apt-window .apt-bg::after{ content:""; position:absolute; inset:0; background: linear-gradient(to bottom, rgba(0,0,0,0.28), rgba(0,0,0,0.28)); }
.apt-window .apt-char{ position:absolute; left:50%; bottom:6px; transform: translateX(-50%); width: 88%; height: auto; object-fit:contain; filter: drop-shadow(0 6px 10px rgba(0,0,0,.28)); z-index:2; }
.apt-window .apt-badge{ position:absolute; top:14px; left:14px; width:56px; height:56px; border-radius:14px; background:var(--badge); display:grid; place-items:center; box-shadow:0 6px 14px rgba(0,0,0,.08); z-index:3; }
.apt-window .apt-badge .ic{ font-size: 26px; }
.apt-window .apt-tag{ display:inline-block; margin-top:8px; background:#fff; border:1px solid #d7e0ea; padding: 6px 10px; border-radius:10px; font-weight:800; }

/* door variant (last item) */
.apt-window.door{ grid-column: span 3; min-height: 240px; }
@media (max-width:900px){ .apt-window.door{ grid-column: span 2; } }
@media (max-width:560px){ .apt-window.door{ grid-column: span 1; } }

/* states */
.apt-window.is-hot .apt-char{ transform: translateX(-52%) translateY(-4%) scale(1.04); transition: transform .15s ease; }
.apt-window:focus-visible{ outline: 3px solid var(--focus); outline-offset: 3px; }
.apt-window:hover{ transform: translateY(-2px); transition: transform .15s ease; }

/* garden */
.apt-garden{ position:relative; height: 72px; display:flex; gap: 12px; align-items:flex-end; justify-content:center; padding: 8px 0 12px; }
.apt-garden .bush{ width: 76px; height: 28px; background: radial-gradient(70% 100% at 50% 100%, #9fd88d 0%, #79c06f 60%, #4fa457 100%); border-radius: 99px; filter: drop-shadow(0 6px 10px rgba(0,0,0,.08)); }

@media (prefers-reduced-motion: reduce){
  .apt-cloud,.apt-birds,.apt-elevator .car{ animation:none !important; }
}
`;
