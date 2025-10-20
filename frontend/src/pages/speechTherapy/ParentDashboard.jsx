import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2"; // Chart.js wrapper in React
import {
  Chart as ChartJS, 
  CategoryScale, // x-axis
  LinearScale, // y-axis
  BarElement, // bar element
  Title, // chart title
  Tooltip, // tooltip on hover
  Legend, // legend display
} from "chart.js";
import "../../styles/speechTherapyStyles/ParentDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend); // Register Chart.js components

const ParentDashboard = ({ childId = "child123" }) => {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cards/categories/list"); // Fetch all categories
        const json = await res.json();
        if (json.success) setCategories(json.data); // Set categories to state
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories(); // Call the async function
  }, []); // Run once on mount

  // Fetch weekly stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/speech/attempts/stats/category?childId=${childId}&period=week` // Fetch stats for the child for the past week
        );
        const json = await res.json();
        if (json.success) setStats(json.data); // Set stats to state
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    fetchStats(); // Call the async function
  }, [childId]); // Re-run if childId changes

  // Chart Data
  const chartData = {
    labels: stats.map((s) => s.category), // Extract the category names and display in the x axis
    datasets: [ // Single dataset for success rate
      {
        label: "Success Rate", // Label for the dataset
        data: stats.map((s) => (s.successRate * 100).toFixed(0)), //Extract the success rate and convert to percentage while rounding off
        backgroundColor: "rgba(75,192,192,0.6)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true, // Chart automatically resizes to fit container width.
    scales: { // Axis configuration
      y: {
        beginAtZero: true, //Always start axis at 0.
        max: 100, //Y axis goes up to 100
        ticks: { callback: (value) => value + "%" }, // Append % to y-axis labels
      },
    },
    plugins: { legend: { display: false } }, // Hide legend since we have only one dataset
  };

  // Fetch attempts
  const handleViewResults = async () => { // Fetch attempts based on selected filters
    try {
      const res = await fetch(
        `http://localhost:5000/api/speech/attempts?childId=${childId}&category=${selectedCategory}&period=${selectedPeriod}` // Fetch attempts for the child with filters
      );
      const json = await res.json();
      if (json.success) setAttempts(json.data); // Set attempts to state
    } catch (err) {
      console.error("Failed to fetch attempts:", err);
    }
  };

  // Delete attempt
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this attempt?"); // Confirm before deleting
    if (!confirmDelete) return; // If user cancels, do nothing
    try {
      const res = await fetch(`http://localhost:5000/api/speech/attempts/${id}`, { // Delete attempt by ID
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setAttempts((prev) => prev.filter((a) => a._id !== id)); // Remove deleted attempt from state
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
        <h2>Weekly Progress by Title</h2>
        {stats.length > 0 ? ( // Show chart only if stats are available
          <Bar data={chartData} options={chartOptions} />  // Render Bar chart by passing data and options to Chart.js Bar component
        ) : (
          <p>No stats available.</p>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <label>
          Category:
          <select
            value={selectedCategory} // Controlled select input for category
            onChange={(e) => setSelectedCategory(e.target.value)} // Update state on change
          >
            <option value="all">All</option>
            {categories.map((cat) => ( // Map over categories to create options
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)} {/* Capitalize first letter */}
              </option>
            ))}
          </select>
        </label>

        <label>
          Duration:
          <select
            value={selectedPeriod} // Controlled select input for period
            onChange={(e) => setSelectedPeriod(e.target.value)} // Update state on change
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </label>

        <button className="view-btn" onClick={handleViewResults}> {/* Button to fetch attempts based on selected filters */}
          View Results
        </button>
      </div>

      {/* Results Table */}
      {attempts.length > 0 && ( // Show table only if attempts are available
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
              {attempts.map((a) => ( // Map over attempts to create table rows
                <tr key={a._id}>
                  <td>{a.cardTitle}</td>
                  <td>{a.transcript}</td>
                  <td>{a.success ? "✔️" : "❌"}</td>
                  <td>{a.feedbackMsg}</td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td> {/* Format date */}
                  <td>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(a._id)} // Call delete handler on click
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