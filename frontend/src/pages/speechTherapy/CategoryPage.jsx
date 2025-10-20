import React, { useEffect, useState } from "react";
import SpeechCard from "./SpeechCard";
import { useParams } from "react-router-dom";
import "../../styles/speechTherapyStyles/CategoryPage.css";

const CategoryPage = () => {
  const { category } = useParams(); // /cards/animals -> "animals"
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { // Fetch cards for the given category in the background
    const fetchCards = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/cards/${category}`); // Fetch cards by category
        const json = await res.json();
        if (json.success) {
          setCards(json.data); // Set fetched cards to state
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false); // Stop loading spinner
      }
    };
    fetchCards(); // Call the async function
  }, [category]); // Re-run effect if category changes and on mount

  if (loading) return <p className="speech-therapy-loading">Loading cards...</p>; // Show loading state

  return (
    <div className="speech-therapy-category-page">
      <h1 className="speech-therapy-category-title">
        {category.charAt(0).toUpperCase() + category.slice(1)} Cards {/* Capitalize first letter */}
      </h1>

      {/* Grid of Speech Cards */}
      {/* Map over cards and render SpeechCard components */}
      <div className="speech-therapy-grid">
        {cards.map((card) => ( 
          <SpeechCard
            key={card._id}
            title={card.title}
            imageUrl={card.image}
            category={card.category}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
