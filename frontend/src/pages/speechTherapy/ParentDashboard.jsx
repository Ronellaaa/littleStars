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
import "../../styles/speechTherapyStyles/ParentDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ParentDashboard = ({ childId = "child123" }) => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/cards/categories/list");
        const json = await res.json();
        if (json.success) setCategories(json.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch weekly stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `http://localhost:5050/api/speech/attempts/stats/category?childId=${childId}&period=week`
        );
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats();
  }, [childId]);

  // ✅ Chart Data
  const chartData = {
    labels: stats.map((s) => s.category),
    datasets: [
      {
        label: "Success Rate",
        data: stats.map((s) => (s.successRate * 100).toFixed(0)),
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => value + "%" },
      },
    },
    plugins: { legend: { display: false } },
  };

  // ✅ Fetch attempts
  const handleViewResults = async () => {
    try {
      const res = await fetch(
        `http://localhost:5050/api/speech/attempts?childId=${childId}&category=${selectedCategory}&period=${selectedPeriod}`
      );
      const json = await res.json();
      if (json.success) setAttempts(json.data);
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
    }
  };

  // ✅ Delete attempt
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this attempt?");
    if (!confirmDelete) return;
    try {
      const res = await fetch(`http://localhost:5050/api/speech/attempts/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setAttempts((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete attempt:", err);
    }
  };

  return (
    <div className="parent-dashboard">
      <h1>Parent Dashboard</h1>

      {/* Chart */}
      <div className="chart-area">
        <h2>Weekly Progress by Category</h2>
        {stats.length > 0 ? (
          <Bar data={chartData} options={chartOptions} />
        ) : (
          <p>No stats available.</p>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
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

        <button className="view-btn" onClick={handleViewResults}>
          View Results
        </button>
      </div>

      {/* Results Table */}
      {attempts.length > 0 && (
        <div className="results-table">
          <h3>Attempts Details</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Transcript</th>
                <th>Success</th>
                <th>Feedback</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a._id}>
                  <td>{a.cardTitle}</td>
                  <td>{a.transcript}</td>
                  <td>{a.success ? "✔️" : "❌"}</td>
                  <td>{a.feedbackMsg}</td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                  <td>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(a._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;