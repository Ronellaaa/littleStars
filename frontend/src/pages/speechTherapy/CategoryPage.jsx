import React, { useEffect, useState } from "react";
import SpeechCard from "./SpeechCard";
import { useParams } from "react-router-dom";
import "../../styles/speechTherapyStyles/CategoryPage.css";

const CategoryPage = () => {
  const { category } = useParams(); // /cards/animals -> "animals"
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await fetch(`http://localhost:5050/api/cards/${category}`);
        const json = await res.json();
        if (json.success) {
          setCards(json.data);
        }
      } catch (err) {
        console.error("Error fetching cards:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, [category]);

  if (loading) return <p className="speech-therapy-loading">Loading cards...</p>;

  return (
    <div className="speech-therapy-category-page">
      <h1 className="speech-therapy-category-title">
        {category.charAt(0).toUpperCase() + category.slice(1)} Cards
      </h1>

      {/* Grid of Speech Cards */}
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
