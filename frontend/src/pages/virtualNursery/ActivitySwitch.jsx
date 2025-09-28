import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";

const AlphabetActivity = lazy(() => import("./activities/AlphabetActivity"));

const registry = {
  alphabets: AlphabetActivity,
  // add more later: numbers: NumbersActivity, etc.
};

export default function ActivitySwitch() {
  const { category } = useParams();
  const Activity = registry[category];

  if (!Activity) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Coming soon</h2>
        <p>No activity found for “{category}”.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading activity…</div>}>
      <Activity category={category} />
    </Suspense>
  );
}
