import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BeforePage.css'

const BeforePage = () => {
  const navigate = useNavigate()
  const [isPlaying, setIsPlaying] = useState(false)

  const playWelcomeAudio = () => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance('Welcome to LittleStars')
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => {
        setIsPlaying(false)
        // Navigate after audio finishes
        setTimeout(() => navigate('/games'), 500)
      }
      utterance.onerror = () => {
        setIsPlaying(false)
        // Navigate even if audio fails
        navigate('/games')
      }
      
      speechSynthesis.speak(utterance)
    } else {
      // Fallback if speech synthesis is not supported
      navigate('/games')
    }
  }

  const handleLetsGo = () => {
    if (!isPlaying) {
      playWelcomeAudio()
    }
  }

  return (
    <div className="before-page">
      <div className="content-overlay">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome to LittleStars</h1>
          <p className="welcome-subtitle">Discover amazing games for kids!</p>
            <button 
              className={`lets-go-button ${isPlaying ? 'playing' : ''}`}
              onClick={handleLetsGo}
              disabled={isPlaying}
              aria-label="Navigate to games page"
            >
              {isPlaying ? 'Welcome to LittleStars... 🎵' : "Let's Go! 🎮"}
            </button>
        </div>
      </div>
    </div>
  )
}

export default BeforePage


