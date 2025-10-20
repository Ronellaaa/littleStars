import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import BeforePage from './pages/BeforePage'
import GamesHome from './pages/GamesHome'
import MemoryGameLandscape from './pages/MemoryGameLandscape'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<BeforePage />} />
          <Route path="/games" element={<GamesHome />} />
          <Route path="/memory-game-landscape" element={<MemoryGameLandscape />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
