import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";

const AlphabetActivity = lazy(() => import("./activities/AlphabetActivity"));
const NumbersActivity = lazy(() => import("./activities/NumbersActivity"));
const ShapesActivity = lazy(() => import("./activities/ShapesActivity"));
const ColorsActivity = lazy(() => import("./activities/ColoursActivity"));
const AnimalsActivity = lazy(() => import("./activities/AnimalsActivity"));
const FruitsActivity = lazy(() => import("./activities/FruitsActivity"));
const VegetablesActivity = lazy(() => import("./activities/VegetablesActivity"));

const registry = {
  alphabets: AlphabetActivity,
  numbers: NumbersActivity,
  shapes: ShapesActivity,
  colors: ColorsActivity,
  animals: AnimalsActivity,
  fruits: FruitsActivity,
  vegetables: VegetablesActivity,
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
