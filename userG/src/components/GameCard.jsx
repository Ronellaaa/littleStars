import React from 'react'
import './GameCard.css'

const GameCard = ({ game, onPlay }) => {
  const handlePlay = () => {
    if (game.Game_URL) {
      onPlay(game.Game_URL)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return '#4caf50'
      case 'Medium':
        return '#ff9800'
      case 'Hard':
        return '#f44336'
      default:
        return '#667eea'
    }
  }

  const getAgeColor = (ageGroup) => {
    switch (ageGroup) {
      case '3-5':
        return '#e91e63'
      case '6-8':
        return '#9c27b0'
      case '9-12':
        return '#3f51b5'
      default:
        return '#667eea'
    }
  }

  return (
    <div className="game-card">
      <div className="game-image-container">
        {game.Game_image ? (
          <img 
            src={game.Game_image} 
            alt={game.title}
            className="game-image"
            onError={(e) => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div 
          className="game-image-placeholder"
          style={{ display: game.Game_image ? 'none' : 'flex' }}
        >
          <span className="placeholder-icon">🎮</span>
        </div>
      </div>

      <div className="game-content">
        <div className="game-header">
          <h3 className="game-title">{game.title}</h3>
          {game.category && (
            <span className="game-category">{game.category}</span>
          )}
        </div>

        {game.description && (
          <p className="game-description">{game.description}</p>
        )}

        <div className="game-meta">
          <div className="meta-item">
            <span className="meta-label">Age:</span>
            <span 
              className="meta-value age-badge"
              style={{ backgroundColor: getAgeColor(game.ageGroup) }}
            >
              {game.ageGroup}
            </span>
          </div>
          
          <div className="meta-item">
            <span className="meta-label">Difficulty:</span>
            <span 
              className="meta-value difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(game.difficultyLevel) }}
            >
              {game.difficultyLevel}
            </span>
          </div>
          
          {game.rating && (
            <div className="meta-item">
              <span className="meta-label">Rating:</span>
              <span className="meta-value rating-badge">
                ⭐ {game.rating}/10
              </span>
            </div>
          )}
        </div>

        <div className="game-actions">
          <button 
            className="play-button"
            onClick={handlePlay}
            disabled={!game.Game_URL}
          >
            {game.Game_URL ? 'Play Game' : 'No URL Available'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default GameCard
