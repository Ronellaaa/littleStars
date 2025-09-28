import React, { useEffect, useState } from "react";
import SpeechCard from "./SpeechCard"; 
import "../../styles/speechTherapyStyles/TherapistDashboard.css";

const TherapistDashboard = ({ therapistId = "therapist123" }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);   // distinguish between create/edit
  const [editingCard, setEditingCard] = useState(null); // store card being edited

  const [newCard, setNewCard] = useState({ title: "", category: "", image: "" });
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/cards/categories/list");
        const json = await res.json();
        if (json.success) setCategories(json.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch speech cards whenever category changes or modal closes
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const url =
          selectedCategory === "all"
            ? "http://localhost:5000/api/cards"
            : `http://localhost:5000/api/cards/${selectedCategory}`;

        const res = await fetch(url);
        const json = await res.json();

        if (json.success) {
          setCards(json.data);
        } else {
          setCards([]);
        }
      } catch (err) {
        console.error("Failed to fetch cards:", err);
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [selectedCategory, showModal]);

  // ✅ Handle form inputs
  const handleChange = (e) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

  // ✅ Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setNewCard({ ...newCard, image: json.url });
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check server logs.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Create
  const handleCreateCard = async (e) => {
    e.preventDefault();
    const { title, category, image } = newCard;
    if (!title || !category || !image) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, image, audio: "N/A" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Card created successfully!");
        closeModal();
      } else {
        alert(json.message || "Failed to create card");
      }
    } catch (err) {
      console.error("Error creating card:", err);
      alert("Server Error");
    }
  };

  // ✅ Edit
  const handleEditCard = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/cards/${editingCard._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCard),
      });
      const json = await res.json();
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

  // ✅ Delete
  const handleDeleteCard = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this card?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/api/cards/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        alert("Card deleted!");
        setCards(cards.filter((c) => c._id !== id));
      } else {
        alert(json.message || "Failed to delete card");
      }
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Server Error");
    }
  };

  // ✅ Open edit modal
  const openEditModal = (card) => {
    setIsEdit(true);
    setEditingCard(card);
    setNewCard({ title: card.title, category: card.category, image: card.image });
    setShowModal(true);
  };

  const openCreateModal = () => {
    setIsEdit(false);
    setNewCard({ title: "", category: "", image: "" });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditingCard(null);
    setNewCard({ title: "", category: "", image: "" });
  };

  return (
    <div className="therapist-dashboard">
      <h1>Therapist Dashboard</h1>

      {/* Category filter */}
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
      </div>

      {/* Cards grid */}
      <div>
        <h2>
          {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Cards
        </h2>
        {loading ? (
          <p>Loading cards...</p>
        ) : cards.length > 0 ? (
          <div className="grid">
            {cards.map((card) => (
              <div key={card._id} className="card-with-actions">
             <div className="card-actions">
              <div className="icon-btn edit-btn" onClick={() => openEditModal(card)}>✏️</div>
              <div className="icon-btn delete-btn" onClick={() => handleDeleteCard(card._id)}>❌</div>
            </div>
                <SpeechCard
                  title={card.title}
                  imageUrl={card.image}
                  category={card.category}
                />
              </div>
            ))}
          </div>
        ) : (
          <p>No cards found for this category.</p>
        )}
      </div>

      {/* ➕ Floating Add Button */}
      <button className="add-btn" onClick={openCreateModal}>
        ➕
      </button>

      {/* Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEdit ? "Edit Card" : "Create New Card"}</h2>
            <form onSubmit={isEdit ? handleEditCard : handleCreateCard} className="modal-form">
              <label>
                Title:
                <input
                  type="text"
                  name="title"
                  value={newCard.title}
                  onChange={handleChange}
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
                <input type="file" accept="image/*" onChange={handleFileUpload} />
              </label>

              {uploading && <p>Uploading image...</p>}
              {newCard.image && (
                <div className="image-preview">
                  <p>Preview:</p>
                  <img src={newCard.image} alt="preview" style={{ width: "120px", borderRadius: "8px" }} />
                </div>
              )}

              <div className="modal-actions">
                <button type="submit" className="create-btn" disabled={uploading}>
                  {isEdit ? "Update" : "Create"}
                </button>
                <button type="button" className="cancel-btn" onClick={closeModal}>
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