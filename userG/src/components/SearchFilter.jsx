import React, { useState, useEffect } from 'react'
import './SearchFilter.css'

const SearchFilter = ({ onSearch, games }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [ageFilter, setAgeFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Get unique categories from games
  const categories = [...new Set(games.map(game => game.category).filter(Boolean))]

  // Auto-search when any filter changes
  useEffect(() => {
    onSearch(searchTerm, ageFilter, difficultyFilter, categoryFilter)
  }, [searchTerm, ageFilter, difficultyFilter, categoryFilter, onSearch])

  const handleClear = () => {
    setSearchTerm('')
    setAgeFilter('all')
    setDifficultyFilter('all')
    setCategoryFilter('all')
  }

  return (
    <div className="search-filter-container">
      <div className="search-section">
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="ageFilter">Age Group:</label>
          <select
            id="ageFilter"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Ages</option>
            <option value="3-5">3-5 years</option>
            <option value="6-8">6-8 years</option>
            <option value="9-12">9-12 years</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="difficultyFilter">Difficulty:</label>
          <select
            id="difficultyFilter"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Levels</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="categoryFilter">Category:</label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleClear} className="clear-button">
          Clear Filters
        </button>
      </div>
    </div>
  )
}

export default SearchFilter
