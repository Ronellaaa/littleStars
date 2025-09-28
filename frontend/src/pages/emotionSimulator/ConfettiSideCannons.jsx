// ConfettiSideCannons.jsx
import confetti from "canvas-confetti";

export default function ConfettiSideCannons({ label = "🎁 Surprise", onAfter }) {
  const handleClick = () => {
    const end = Date.now() + 3 * 1000; // 3 seconds
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    (function frame() {
      if (Date.now() > end) {
        onAfter?.(); // call after confetti ends (e.g., open your modal)
        return;
      }
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.6 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.6 },
        colors,
      });
      requestAnimationFrame(frame);
    })();
  };

  return (
    <button type="button" className="surpriseBtn" onClick={handleClick}>
      {label}
    </button>
  );
}
