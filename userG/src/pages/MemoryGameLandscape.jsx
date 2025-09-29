import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './MemoryGameLandscape.css'

// Audio utilities for sound effects
const AudioUtils = {
  audioContext: null,
  soundEnabled: true,
  
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    }
  },

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled
  },

  playTone(frequency, duration = 0.2, type = 'sine', volume = 0.3) {
    if (!this.soundEnabled) return
    
    this.init()
    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)
    
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
    oscillator.type = type
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)
    
    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  },

  playCardFlip() {
    this.playTone(800, 0.1, 'sine', 0.2)
  },

  playMatch() {
    this.playTone(523, 0.3, 'sine', 0.4)
    setTimeout(() => this.playTone(659, 0.3, 'sine', 0.4), 50)
    setTimeout(() => this.playTone(784, 0.3, 'sine', 0.4), 100)
  },

  playVictory() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note, 0.4, 'sine', 0.5)
      }, index * 200)
    })
  },

  playClick() {
    this.playTone(1000, 0.1, 'square', 0.2)
  },

  playWrong() {
    this.playTone(200, 0.3, 'sawtooth', 0.3)
  },

  playGameStart() {
    const notes = [440, 554, 659]
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playTone(note, 0.3, 'sine', 0.4)
      }, index * 150)
    })
  },

  playNiceWork() {
    if (!this.soundEnabled) return
    
    // Play "Nice work" using text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Nice work!')
      utterance.rate = 0.9
      utterance.pitch = 1.2
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
    
    // Also play a cheerful musical tone
    this.playTone(523, 0.2, 'sine', 0.3)
    setTimeout(() => this.playTone(659, 0.2, 'sine', 0.3), 100)
    setTimeout(() => this.playTone(784, 0.3, 'sine', 0.4), 200)
  }
}

// Game data and utilities
const CARD_SETS = {
  easy: [
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'bird', emoji: '🐦', name: 'Bird' },
    { id: 'fish', emoji: '🐠', name: 'Fish' },
    { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
    { id: 'bear', emoji: '🐻', name: 'Bear' }
  ],
  medium: [
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'bird', emoji: '🐦', name: 'Bird' },
    { id: 'fish', emoji: '🐠', name: 'Fish' },
    { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
    { id: 'bear', emoji: '🐻', name: 'Bear' },
    { id: 'lion', emoji: '🦁', name: 'Lion' },
    { id: 'elephant', emoji: '🐘', name: 'Elephant' }
  ],
  hard: [
    { id: 'cat', emoji: '🐱', name: 'Cat' },
    { id: 'dog', emoji: '🐶', name: 'Dog' },
    { id: 'bird', emoji: '🐦', name: 'Bird' },
    { id: 'fish', emoji: '🐠', name: 'Fish' },
    { id: 'rabbit', emoji: '🐰', name: 'Rabbit' },
    { id: 'bear', emoji: '🐻', name: 'Bear' },
    { id: 'lion', emoji: '🦁', name: 'Lion' },
    { id: 'elephant', emoji: '🐘', name: 'Elephant' },
    { id: 'tiger', emoji: '🐅', name: 'Tiger' },
    { id: 'panda', emoji: '🐼', name: 'Panda' }
  ]
}

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const getFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

const generateCards = (difficulty) => {
  const selectedCards = CARD_SETS[difficulty] || CARD_SETS.easy
  
  const cards = [...selectedCards, ...selectedCards].map((card, index) => ({
    id: `${card.id}-${index}`,
    value: card.emoji,
    name: card.name,
    matched: false,
    flipped: false
  }))

  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return cards
}

// Game Start Component
const GameStart = ({ onStartGame }) => {
  const [playerName, setPlayerName] = useState('')
  const [difficulty, setDifficulty] = useState('easy')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!playerName.trim()) return

    AudioUtils.playGameStart()

    const cards = generateCards(difficulty)
    const gameData = {
      sessionId: Date.now().toString(),
      playerName: playerName.trim(),
      difficulty,
      cards,
      totalPairs: cards.length / 2,
      score: 0,
      moves: 0,
      foundPairs: 0,
      startTime: Date.now()
    }

    onStartGame(gameData)
  }

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', description: '6 pairs', emoji: '😊' },
    { value: 'medium', label: 'Medium', description: '8 pairs', emoji: '🤔' },
    { value: 'hard', label: 'Hard', description: '10 pairs', emoji: '🧠' }
  ]

  return (
    <div className="game-start">
      <h2>🧩 Memory Card Game</h2>
      <p>Test your memory by matching pairs of cards!</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="playerName">Your Name:</label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            required
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label>Difficulty Level:</label>
          <div className="difficulty-options">
            {difficultyOptions.map((option) => (
              <div
                key={option.value}
                className={`difficulty-option ${difficulty === option.value ? 'selected' : ''}`}
                onClick={() => setDifficulty(option.value)}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '0.3rem' }}>
                  {option.emoji}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{option.label}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  {option.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="start-button">
          Start Game! 🎮
        </button>
      </form>
    </div>
  )
}

// Memory Game Component
const MemoryGame = ({ gameData, onGameEnd }) => {
  const [cards, setCards] = useState(gameData.cards || [])
  const [score, setScore] = useState(gameData.score || 0)
  const [moves, setMoves] = useState(gameData.moves || 0)
  const [foundPairs, setFoundPairs] = useState(gameData.foundPairs || 0)
  const [flippedCards, setFlippedCards] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [gameCompleted, setGameCompleted] = useState(false)

  useEffect(() => {
    if (gameCompleted) {
      const endTime = Date.now()
      const timeSpent = Math.floor((endTime - gameData.startTime) / 1000)
      onGameEnd({ 
        score, 
        moves, 
        foundPairs, 
        totalPairs: gameData.totalPairs,
        timeSpent,
        playerName: gameData.playerName,
        difficulty: gameData.difficulty
      })
    }
  }, [gameCompleted, score, moves, foundPairs, gameData, onGameEnd])

  const handleCardClick = (cardId) => {
    if (isProcessing || flippedCards.length >= 2) return

    const card = cards.find(c => c.id === cardId)
    if (!card || card.flipped || card.matched) return

    setIsProcessing(true)
    AudioUtils.playCardFlip()
    
    const updatedCards = cards.map(c => 
      c.id === cardId ? { ...c, flipped: true } : c
    )
    setCards(updatedCards)
    
    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)
    
    setMoves(prev => prev + 1)

    if (newFlippedCards.length === 2) {
      const [card1Id, card2Id] = newFlippedCards
      const card1 = updatedCards.find(c => c.id === card1Id)
      const card2 = updatedCards.find(c => c.id === card2Id)
      
      if (card1.value === card2.value) {
        AudioUtils.playMatch()
        AudioUtils.playNiceWork()
        
        const matchedCards = updatedCards.map(c => 
          c.id === card1Id || c.id === card2Id ? { ...c, matched: true } : c
        )
        setCards(matchedCards)
        setFoundPairs(prev => prev + 1)
        setScore(prev => prev + 10)
        
        if (foundPairs + 1 === gameData.totalPairs) {
          setScore(prev => prev + 50)
          setTimeout(() => {
            AudioUtils.playVictory()
          }, 500)
          setGameCompleted(true)
        }
        
        setFlippedCards([])
        setIsProcessing(false)
      } else {
        AudioUtils.playWrong()
        setTimeout(() => {
          const resetCards = updatedCards.map(c => 
            c.id === card1Id || c.id === card2Id ? { ...c, flipped: false } : c
          )
          setCards(resetCards)
          setFlippedCards([])
          setIsProcessing(false)
        }, 1000)
      }
    } else {
      setIsProcessing(false)
    }
  }

  const handleRestart = () => {
    AudioUtils.playClick()
    window.location.reload()
  }

  const handleQuit = () => {
    AudioUtils.playClick()
    if (window.confirm('Are you sure you want to quit the game?')) {
      window.location.reload()
    }
  }

  return (
    <div className="memory-game">
      <div className="game-info">
        <div>
          <h3>👤 {gameData.playerName}</h3>
          <p>Player</p>
        </div>
        <div>
          <h3>⭐ {score}</h3>
          <p>Score</p>
        </div>
        <div>
          <h3>🔄 {moves}</h3>
          <p>Moves</p>
        </div>
        <div>
          <h3>🎯 {foundPairs}/{gameData.totalPairs}</h3>
          <p>Pairs Found</p>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`memory-card ${card.flipped ? 'flipped' : ''} ${card.matched ? 'matched' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-content">
              {card.flipped || card.matched ? (
                <span className="card-front">{card.value}</span>
              ) : (
                <span className="card-back">❓</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="game-controls">
        <button className="control-button restart-button" onClick={handleRestart}>
          🔄 Restart
        </button>
        <button className="control-button quit-button" onClick={handleQuit}>
          ❌ Quit
        </button>
      </div>

      {gameCompleted && (
        <div className="completion-overlay">
          <div className="completion-modal">
            <h2>🎉 Congratulations! 🎉</h2>
            <p>You completed the game!</p>
            <p>Final Score: {score} | Moves: {moves}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Game End Component
const GameEnd = ({ score, onRestart }) => {
  const [leaderboard, setLeaderboard] = useState([])

  useEffect(() => {
    const savedLeaderboard = getFromStorage('memoryGameLeaderboard', [])
    setLeaderboard(savedLeaderboard)
    
    if (score) {
      const newEntry = {
        id: Date.now().toString(),
        playerName: score.playerName,
        score: score.score,
        moves: score.moves,
        timeSpent: score.timeSpent,
        difficulty: score.difficulty,
        completedAt: new Date().toISOString()
      }
      
      const updatedLeaderboard = [...savedLeaderboard, newEntry]
        .sort((a, b) => b.score - a.score || a.moves - b.moves)
        .slice(0, 10)
      
      saveToStorage('memoryGameLeaderboard', updatedLeaderboard)
      setLeaderboard(updatedLeaderboard)
    }
  }, [score])

  const getPerformanceMessage = () => {
    if (score.moves <= score.totalPairs * 1.5) {
      return { message: "Excellent! You're a memory master! 🧠✨", color: "#4ade80" }
    } else if (score.moves <= score.totalPairs * 2) {
      return { message: "Great job! You have a good memory! 🎯", color: "#3b82f6" }
    } else {
      return { message: "Good effort! Keep practicing! 💪", color: "#f59e0b" }
    }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="game-end">
      <h2>🎉 Game Complete! 🎉</h2>
      
      <div className="score-display">
        <h3>Your Results</h3>
        <div className="score-item">
          <span>Final Score:</span>
          <span>{score.score}</span>
        </div>
        <div className="score-item">
          <span>Total Moves:</span>
          <span>{score.moves}</span>
        </div>
        <div className="score-item">
          <span>Pairs Found:</span>
          <span>{score.foundPairs}/{score.totalPairs}</span>
        </div>
        <div className="score-item">
          <span>Time Spent:</span>
          <span>{Math.floor(score.timeSpent / 60)}:{(score.timeSpent % 60).toString().padStart(2, '0')}</span>
        </div>
        <div className="score-item">
          <span>Efficiency:</span>
          <span>{((score.totalPairs / score.moves) * 100).toFixed(1)}%</span>
        </div>
      </div>

      <div style={{
        padding: '0.8rem',
        borderRadius: '8px',
        background: performance.color + '20',
        border: `2px solid ${performance.color}`,
        margin: '0.8rem 0',
        color: performance.color,
        fontWeight: 'bold',
        fontSize: '0.9rem'
      }}>
        {performance.message}
      </div>

      <div className="end-buttons">
        <button 
          className="end-button play-again-button"
          onClick={() => {
            AudioUtils.playClick()
            onRestart()
          }}
        >
          🎮 Play Again
        </button>
      </div>

      {leaderboard.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#f8f9fa',
          borderRadius: '10px',
          border: '2px solid #e9ecef'
        }}>
          <h3 style={{ marginBottom: '0.8rem', color: '#333', fontSize: '1rem' }}>🏆 Top Players</h3>
          <div>
            {leaderboard.slice(0, 3).map((player, index) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                margin: '0.3rem 0',
                background: index < 3 ? '#fff3cd' : 'white',
                borderRadius: '8px',
                border: index < 3 ? '2px solid #ffc107' : '1px solid #dee2e6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ 
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#666'
                  }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{player.playerName}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#667eea', fontSize: '0.9rem' }}>{player.score} pts</div>
                  <div style={{ fontSize: '0.7rem', color: '#666' }}>
                    {player.moves} moves
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main Memory Game Landscape Component
const MemoryGameLandscape = () => {
  const navigate = useNavigate()
  const [gameState, setGameState] = useState('start')
  const [gameData, setGameData] = useState(null)
  const [finalScore, setFinalScore] = useState(null)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const startGame = (gameSession) => {
    setGameData(gameSession)
    setGameState('playing')
  }

  const endGame = (score) => {
    setFinalScore(score)
    setGameState('end')
  }

  const restartGame = () => {
    setGameState('start')
    setGameData(null)
    setFinalScore(null)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    AudioUtils.setSoundEnabled(!soundEnabled)
    AudioUtils.playClick()
  }

  const handleBackClick = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <div className="memory-game-landscape">
      {/* Floating background elements */}
      <div className="floating-bg-elements">
        <div className="floating-element">⭐</div>
        <div className="floating-element">🌟</div>
        <div className="floating-element">✨</div>
        <div className="floating-element">💫</div>
        <div className="floating-element">🌙</div>
        <div className="floating-element">☁️</div>
        <div className="floating-element">🌈</div>
        <div className="floating-element">🎈</div>
        <div className="floating-element">💖</div>
        <div className="floating-element">🎮</div>
        <div className="floating-element">🦄</div>
        <div className="floating-element">🎪</div>
        <div className="floating-element">🎨</div>
        <div className="floating-element">🎭</div>
        <div className="floating-element">🎯</div>
      </div>
      
      <header className="app-header">
        <button className="back-button" onClick={handleBackClick} title="Go back">
          ← Back
        </button>
        <div className="header-content">
          <h1>🧩 Memory Card Game</h1>
          
        </div>
        <button 
          className="sound-toggle"
          onClick={toggleSound}
          title={soundEnabled ? "Disable Sound" : "Enable Sound"}
        >
          {soundEnabled ? "🔊" : "🔇"}
        </button>
      </header>

      <main className="app-main">
        {gameState === 'start' && (
          <GameStart onStartGame={startGame} />
        )}
        
        {gameState === 'playing' && gameData && (
          <MemoryGame 
            gameData={gameData}
            onGameEnd={endGame}
          />
        )}
        
        {gameState === 'end' && finalScore && (
          <GameEnd 
            score={finalScore}
            onRestart={restartGame}
          />
        )}
      </main>
    </div>
  )
}

export default MemoryGameLandscape

