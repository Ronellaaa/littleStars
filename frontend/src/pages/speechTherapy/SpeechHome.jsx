import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/speechTherapyStyles/SpeechHome.css";

const SpeechHome = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cards/categories/list"); // Fetch all categories
        const json = await res.json();
        if (json.success) {
          setCategories(json.data); // Set categories to state
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories(); // Call the async function
  }, []); // Run once on mount

  const handleCategoryClick = (category) => { // Navigate to category page
    navigate(`/cards/${category}`); // change the browser’s URL
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
        <button className="therapist-btn" onClick={handleTherapistDashboardClick}> {/* Therapist Dashboard Button */}
          Therapist Dashboard
        </button>

        <h1 className="home-title">👋 Welcome to <span>Speech Therapy Tool</span></h1>

        <button className="dashboard-btn" onClick={handleParentDashboardClick}> {/* Parent Dashboard Button */}
          Parent Dashboard
        </button>
      </div>

      {/* Categories Grid */}
      <div className="category-grid">
        {categories.map((cat) => ( // Map over categories and render buttons
          <button
            key={cat}
            className="category-btn"
            onClick={() => handleCategoryClick(cat)} // Navigate on click to category page
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)} {/* Capitalize first letter */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeechHome;