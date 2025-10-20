import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
import "../../styles/virtualNurseyStyles/LearnSwitch.css";

const AlphabetLearn = lazy(() =>
  import("../virtualNursery/learn/AlphabetLearn")
);
const NumbersLearn = lazy(() =>
  import("../virtualNursery/learn/NumbersLearn")
);
const ShapesLearn = lazy(() =>
  import("../virtualNursery/learn/ShapesLearn")
);
const ColorsLearn = lazy(() =>
  import("../virtualNursery/learn/ColoursLearn")
);
const AnimalsLearn = lazy(() =>
  import("../virtualNursery/learn/AnimalsLearn")
);
const FruitsLearn = lazy(() =>
  import("../virtualNursery/learn/FruitsLearn")
);
const VegetablesLearn = lazy(() =>
  import("../virtualNursery/learn/VegetablesLearn")
);


const registry = {
  alphabets: AlphabetLearn,
  numbers: NumbersLearn,
  shapes: ShapesLearn,
  colors: ColorsLearn,
  animals: AnimalsLearn,
  fruits: FruitsLearn,
  vegetables: VegetablesLearn,
};

function Loading() {
  return (
    <>
      <div className="learn-loading">
        <div className="spinner"></div>
        <h1>Loading...</h1>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-text">
        <h1>😔 Sorry, page not found</h1>
        <p>Looks like you wandered off the path…</p>
      </div>
    </div>
  );
}

export default function LearnSwitch() {
  const { category } = useParams();
  const LearnActivity = registry[category];

  if(!LearnActivity){
   <NotFound/>
  }
  return(
    <Suspense fallback={<Loading/>}>
      <LearnActivity category={category}/>
    </Suspense>
  )
}
