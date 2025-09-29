import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/speechTherapyStyles/SpeechHome.css";

const SpeechHome = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/cards/categories/list");
        const json = await res.json();
        if (json.success) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    navigate(`/cards/${category}`);
  };

  const handleParentDashboardClick = () => {
    navigate("/parent-dashboard");
  };

  const handleTherapistDashboardClick = () => {
    navigate("/therapist-dashboard");
  };

  return (
    <div className="home-container">
      {/* Header with Therapist + Parent Dashboards */}
      <div className="home-header">
        <button className="therapist-btn" onClick={handleTherapistDashboardClick}>
          Therapist Dashboard
        </button>

        <h1 className="home-title">👋 Welcome to <span>Speech Therapy Tool</span></h1>

        <button className="dashboard-btn" onClick={handleParentDashboardClick}>
          Parent Dashboard
        </button>
      </div>

      {/* Categories Grid */}
      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat}
            className="category-btn"
            onClick={() => handleCategoryClick(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeechHome;