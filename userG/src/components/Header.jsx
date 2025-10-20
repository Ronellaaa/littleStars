import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()

  const handleBackClick = () => {
    navigate(-1) // Go back to previous page
  }

  return (
    <header className="header">
      <div className="header-content">
        <button className="back-button" onClick={handleBackClick} title="Go back">
          ← Back
        </button>
        <div className="logo-section">
          <div className="logo-icon">⭐</div>
          <h1>Little Stars</h1>
        </div>
        <div className="header-subtitle">
          <p>Interactive Games for Kids</p>
        </div>
      </div>
    </header>
  )
}

export default Header
