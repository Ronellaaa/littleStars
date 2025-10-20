import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../../styles/speechTherapyStyles/TherapistDashboardSpeechStats.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TherapistDashboardSpeechStats = () => {
  const [categories, setCategories] = useState([]);        // All available card categories
  const [selectedCategory, setSelectedCategory] = useState("all"); // Currently chosen category filter
  const [selectedPeriod, setSelectedPeriod] = useState("week");    // Currently chosen time period
  const [stats, setStats] = useState([]);                  // Stats returned from backend

  // -------- FETCH ALL CATEGORIES ON MOUNT --------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cards/categories/list"); // endpoint from your Speech routes
        const json = await res.json();
        if (json.success) setCategories(json.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // -------- FETCH STATS BASED ON FILTERS --------
  const fetchStats = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/speech/attempts/stats/therapist?period=${selectedPeriod}&category=${selectedCategory.toLowerCase()}`
      ); // Endpoint handled by getTherapistStatsByCategory
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error("Failed to fetch therapist stats:", err);
    }
  };

  // -------- AUTO-FETCH WHEN FILTERS CHANGE --------
  useEffect(() => {
    fetchStats();
  }, [selectedCategory, selectedPeriod]);

  // -------- CHART CONFIGURATION --------
  const chartData = {
    labels: stats.map((item) => item.category), // card titles: Dog, Cow, etc.
    datasets: [
      {
        label: "Success Rate (%)",
        data: stats.map((item) => (item.successRate * 100).toFixed(0)), // convert ratio → percentage
        backgroundColor: "rgba(142, 68, 173, 0.6)",
        borderColor: "rgba(142, 68, 173, 1)",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (val) => val + "%" },
      },
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Success Rate by Card Title (${selectedPeriod})`,
        font: { size: 16 },
      },
    },
  };

  return (
    <div className="therapist-stats-dashboard">
      <h1>Therapist Speech Stats</h1>

      {/* -------- FILTERS -------- */}
      <div className="filters-area">
        <label>
          Category:
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Duration:
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </label>

        <button className="view-btn" onClick={fetchStats}>
          View Stats
        </button>
      </div>

      {/* -------- CHART DISPLAY -------- */}
      <div className="chart-container">
        {stats.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p>No statistics available for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default TherapistDashboardSpeechStats;