import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameCard from '../components/GameCard'
import SearchFilter from '../components/SearchFilter'
import Header from '../components/Header'
import './GamesHome.css'

const GamesHome = () => {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filteredGames, setFilteredGames] = useState([])
  const navigate = useNavigate()

  const API_BASE = 'http://localhost:5050'

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch(`${API_BASE}/game/`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch games')
      }
      
      const data = await response.json()
      setGames(Array.isArray(data) ? data : [])
      setFilteredGames(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching games:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (searchTerm, ageFilter, difficultyFilter, categoryFilter) => {
    let filtered = games

    // Search by title
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by age group
    if (ageFilter && ageFilter !== 'all') {
      filtered = filtered.filter(game => game.ageGroup === ageFilter)
    }

    // Filter by difficulty
    if (difficultyFilter && difficultyFilter !== 'all') {
      filtered = filtered.filter(game => game.difficultyLevel === difficultyFilter)
    }

    // Filter by category
    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(game => game.category === categoryFilter)
    }

    setFilteredGames(filtered)
  }

  const handlePlayGame = (gameUrl) => {
    if (gameUrl) {
      // Check if it's an internal route (starts with /)
      if (gameUrl.startsWith('/')) {
        navigate(gameUrl)
      } else {
        // External URL - open in new tab
        window.open(gameUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="cartoon-loading">
          <div className="loading-emoji">🎮</div>
          <div className="loading-dots">
            <span className="dot dot-1">.</span>
            <span className="dot dot-2">.</span>
            <span className="dot dot-3">.</span>
          </div>
        </div>
        <p className="loading-text">Loading amazing games...</p>
        <div className="loading-sparkles">
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">⭐</span>
          <span className="sparkle sparkle-3">🌟</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchGames} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="games-home">
      {/* Floating cartoon elements */}
      <div className="floating-elements">
        <div className="floating-star star-1">⭐</div>
        <div className="floating-star star-2">🌟</div>
        <div className="floating-star star-3">✨</div>
        <div className="floating-heart heart-1">💖</div>
        <div className="floating-heart heart-2">💝</div>
        <div className="floating-balloon balloon-1">🎈</div>
        <div className="floating-balloon balloon-2">🎈</div>
        <div className="floating-rainbow rainbow-1">🌈</div>
        <div className="floating-cloud cloud-1">☁️</div>
        <div className="floating-cloud cloud-2">☁️</div>
        <div className="floating-sun sun-1">☀️</div>
        <div className="floating-moon moon-1">🌙</div>
      </div>
      
      <Header />
      
      <main className="main-content">
        <SearchFilter 
          onSearch={handleSearch}
          games={games}
        />
        
        <section className="games-section">
          <div className="section-header">
            <h2>Available Games</h2>
            <span className="game-count">{filteredGames.length} games found</span>
          </div>
          
          {filteredGames.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎮</div>
              <h3>No games found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="games-grid">
              {filteredGames.map((game) => (
                <GameCard
                  key={game._id}
                  game={game}
                  onPlay={handlePlayGame}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default GamesHome
