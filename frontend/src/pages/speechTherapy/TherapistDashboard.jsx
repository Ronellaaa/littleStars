import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ added import for navigation
import SpeechCard from "./SpeechCard"; 
import "../../styles/speechTherapyStyles/TherapistDashboard.css";

const TherapistDashboard = ({ therapistId = "therapist123" }) => {
  const [categories, setCategories] = useState([]); // All available categories
  const [selectedCategory, setSelectedCategory] = useState("all"); // Currently selected category filter
  const [cards, setCards] = useState([]); // Speech cards to display
  const [loading, setLoading] = useState(false); // Loading state for fetching cards

  // Modal State
  const [showModal, setShowModal] = useState(false); // control modal visibility
  const [isEdit, setIsEdit] = useState(false);   // distinguish between create/edit
  const [editingCard, setEditingCard] = useState(null); // store card being edited

  const [newCard, setNewCard] = useState({ title: "", category: "", image: "" }); // Form state for new/edit card
  const [uploading, setUploading] = useState(false); // Image upload state

  const navigate = useNavigate(); // ✅ hook for page redirection

  // Fetch categories on mount
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
    fetchCategories();// Call the async function
  }, []); // Run once on mount

  // Fetch speech cards whenever category changes or modal closes
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true); // Start loading
        // Determine URL based on selected category
        const url =
          selectedCategory === "all"
            ? "http://localhost:5000/api/cards" // Fetch all cards
            : `http://localhost:5000/api/cards/${selectedCategory}`; // Fetch cards by category

        const res = await fetch(url); // Fetch cards from backend
        const json = await res.json(); // Parse the JSON response

        if (json.success) {
          setCards(json.data); // Set fetched cards to state
        } else {
          setCards([]); // Clear cards if fetch failed
        }
      } catch (err) {
        console.error("Failed to fetch cards:", err); // Log any errors
        setCards([]); // Clear cards on error
      } finally {
        setLoading(false); // Stop loading
      }
    };
    fetchCards(); // Call the async function
  }, [selectedCategory, showModal]); // Re-run if category changes or modal visibility changes and on mount

  // Handle form inputs
  const handleChange = (e) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value }); // Update newCard state
  };

  //  Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; // Get the selected file
    if (!file) return;

    setUploading(true); // Start uploading
    const formData = new FormData(); // Create FormData object
    formData.append("image", file); // Append file to form data

    try {
      const res = await fetch("http://localhost:5000/api/upload", { // Upload endpoint to backend Cloudinary
        method: "POST",
        body: formData,
      });
      const json = await res.json(); // Parse the JSON response
      if (json.success) {
        setNewCard({ ...newCard, image: json.url }); // Set image URL to state
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check server logs.");
    } finally {
      setUploading(false); // Stop uploading
    }
  };

  // Create
  const handleCreateCard = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    const { title, category, image } = newCard;
    if (!title || !category || !image) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/cards", { // Create card endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, image, audio: "N/A" }), // Send card data to backend 
      });
      const json = await res.json(); // Parse the JSON response
      if (json.success) {
        alert("Card created successfully!");
        closeModal(); // Close modal on success
      } else {
        alert(json.message || "Failed to create card");
      }
    } catch (err) {
      console.error("Error creating card:", err);
      alert("Server Error");
    }
  };

  //  Edit
  const handleEditCard = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    try {
      const res = await fetch(`http://localhost:5000/api/cards/${editingCard._id}`, { // Update card endpoint
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard), // Send updated card data to backend
      });
      const json = await res.json(); // Parse the JSON response
      if (json.success) {
        alert("Card updated successfully!");
        closeModal();
      } else {
        alert(json.message || "Failed to update card");
      }
    } catch (err) {
      console.error("Error updating card:", err);
      alert("Server Error");
    }
  };

  // Delete
  const handleDeleteCard = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this card?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/cards/${id}`, { method: "DELETE" }); // Delete card by ID by calling backend
      const json = await res.json();
      if (json.success) {
        alert("Card deleted!");
        setCards(cards.filter((c) => c._id !== id)); // Remove deleted card from state
      } else {
        alert(json.message || "Failed to delete card");
      }
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Server Error");
    }
  };

  // Open edit modal
  const openEditModal = (card) => {
    setIsEdit(true); // Set modal to edit mode
    setEditingCard(card); // Store card being edited
    setNewCard({ title: card.title, category: card.category, image: card.image }); // Pre-fill form with existing data
    setShowModal(true); // Show the modal
  };

  const openCreateModal = () => {
    setIsEdit(false); // Set modal to create mode
    setNewCard({ title: "", category: "", image: "" }); // Clear form
    setShowModal(true); // Show the modal
  };

  const closeModal = () => {
    setShowModal(false); // Hide the modal
    setIsEdit(false); // Reset to create mode
    setEditingCard(null); // Clear editing card
    setNewCard({ title: "", category: "", image: "" }); // Clear form
  };

  return (
    <div className="speech-therapy-therapist-dashboard">
      <h1>Therapist Dashboard</h1>

      {/* -------- VIEW STATS BUTTON -------- */}
      <button
        className="speech-therapy-view-stats-btn"
        onClick={() => navigate("/TherapistDashboardSpeechStats")} // redirect to the stats page
      >
        📊 View Stats
      </button>

      {/* Category filter */}
      <div className="speech-therapy-filters">
        <label>
          Category:
          <select
            value={selectedCategory} // Controlled select input for category
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
      </div>

      {/* Cards grid */}
      <div>
        <h2>
          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Cards {/* Capitalize first letter */}
        </h2>
        {loading ? (
          <p>Loading cards...</p>
        ) : cards.length > 0 ? (
          <div className="speech-therapy-grid">
            {/* Map over cards and render SpeechCard components with edit/delete actions */}
            {cards.map((card) => (
              <div key={card._id} className="speech-therapy-card-with-actions">
                <div className="speech-therapy-card-actions">
                  <div className="speech-therapy-icon-btn speech-therapy-edit-btn" onClick={() => openEditModal(card)}>✏️</div>
                  <div className="speech-therapy-icon-btn speech-therapy-delete-btn" onClick={() => handleDeleteCard(card._id)}>❌</div>
                </div>
                <SpeechCard
                  title={card.title}
                  imageUrl={card.image}
                  category={card.category}
                />
              </div>
            ))}
          </div>
        ) : ( // No cards found message
          <p>No cards found for this category.</p>
        )}
      </div>

      {/* ➕ Floating Add Button */}
      <button className="speech-therapy-add-btn" onClick={openCreateModal}>
        ➕
      </button>

      {/* Modal Overlay */}
      {showModal && ( // Show modal for creating/editing cards
        <div className="speech-therapy-modal-overlay">
          <div className="speech-therapy-modal-content">
            <h2>{isEdit ? "Edit Card" : "Create New Card"}</h2> {/* Change title based on mode */}
            <form onSubmit={isEdit ? handleEditCard : handleCreateCard} className="speech-therapy-modal-form"> {/* Form submission handled based on mode */}
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={newCard.title} 
                  onChange={handleChange} // Handle input change
                  required
                />
              </label>

              <label>
                Category:
                <select
                  name="category"
                  value={newCard.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Image:
                <input type="file" accept="image/*" onChange={handleFileUpload} />  {/* Handle file selection */}
              </label>

              {uploading && <p>Uploading image...</p>} {/* Show uploading state */}
              {newCard.image && ( // Show image preview if available
                <div className="speech-therapy-image-preview">
                  <p>Preview:</p>
                  <img src={newCard.image} alt="preview" style={{ width: "120px", borderRadius: "8px" }} /> 
                </div>
              )}

              <div className="speech-therapy-modal-actions">
                <button type="submit" className="speech-therapy-create-btn" disabled={uploading}> {/* Disable button if uploading */}
                  {isEdit ? "Update" : "Create"} {/* Change button text based on mode */}
                </button>
                <button type="button" className="speech-therapy-cancel-btn" onClick={closeModal}> {/* Close modal on cancel */}
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistDashboard;