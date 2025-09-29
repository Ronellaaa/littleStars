import { useState, useEffect, useMemo } from "react";
import "../../styles/virtualNurseyStyles/NurseryDashboard.css";
import alphabets from "../../assets/alphabet.png";
import numbers from "../../assets/numbers.png";
import colors from "../../assets/colours.png";
import shapes from "../../assets/shapes.png";
import animals from "../../assets/animals.png";
import fruits from "../../assets/fruits.png";
import vegetables from "../../assets/vegetables.png";
import tigerLottie from "../../assets/animations/tiger.json";
import Lottie from "lottie-react";
import { Link } from "react-router-dom";

export default function NurseyDashboard() {
    const handleBack = () => window.history.back();

  const lessons = [
    {
      id: "alphabets",
      title: "Alphabets",
      img: alphabets,
      x: 70,
      y: 10,
    },
    {
      id: "numbers",
      title: "Numbers",
      img: numbers,
      x: 20,
      y: 28,
    },
    {
      id: "colors",
      title: "Colors",
      img: colors,
      x: 72,
      y: 48,
    },
    {
      id: "shapes",
      title: "Shapes",
      img: shapes,
      x: 24,
      y: 70,
    },
    {
      id: "animals",
      title: "Animals",
      img: animals,
      x: 72,
      y: 90,
    },
    {
      id: "fruits",
      title: "Fruits",
      img: fruits,
      x: 28,
      y: 110,
    },
    {
      id: "vegetables",
      title: "Vegetables",
      img: vegetables,
      x: 70,
      y: 128,
    },
  ];
  const maxY = Math.max(...lessons.map((l) => l.y));
  const svgHeightVh = maxY + 20;

  function buildSmoothPath(points, tension = 0.55) {
    if (!points.length) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1],
        p1 = points[i];
      const cx = p0.x + (p1.x - p0.x) * tension;
      const cy = p0.y + (p1.y - p0.y) * tension;
      d += ` Q ${cx} ${cy}, ${p1.x} ${p1.y}`;
    }
    return d;
  }

  const pathD = useMemo(() => buildSmoothPath(lessons), [lessons]);

  return (
    <>
      <main className="nurseryD-learning-path">
        <button className="nurseryD-bp-back" onClick={handleBack}type="button"> back</button>
        <svg
          className="nurseryD-path-svg"
          viewBox={`0 0 100 ${svgHeightVh}`}
          preserveAspectRatio="none"
          style={{ height: `${svgHeightVh}vh` }}
        >
          <path
            d={pathD}
            fill="none"
            stroke="#3d3d3d"
            strokeWidth="60"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="10 12"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="nurseryD-duck" />
        <div className="nurseryD-cart">
          <Lottie
            animationData={tigerLottie}
            loop
            autoplay
            className="tiger-lottie-1"
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            to={`/nursery/${lesson.id}/select`}
            className="nurseryD-lesson-link"
          >
            <button
              key={lesson.id}
              className="nurseryD-lesson"
              style={{ left: `${lesson.x}%`, top: `${lesson.y}vh` }}
              onClick={() => console.log("open lesson", lesson.id)}
            >
              <img src={lesson.img} alt={lesson.title} className="nurseryD-lesson-img" />
              <span className="nurseryD-lesson-label">{lesson.title}</span>
            </button>
          </Link>
        ))}
      </main>
    </>
  );
}
