import React, { useState, useEffect } from 'react';
import './AdminGames.css';
import jsPDF from 'jspdf';

const AdminGames = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ageGroup: '3-5',
    rating: 5,
    difficultyLevel: 'Easy',
    category: '',
    Game_image: '',
    Game_URL: ''
  });

  const API_BASE = 'http://localhost:5050';

  const fetchGames = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE}/game/`);
      if (!response.ok) throw new Error('Failed to fetch games');
      const data = await response.json();
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const url = editingId
        ? `${API_BASE}/game/update/${editingId}`
        : `${API_BASE}/game/add`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Request failed');
      }

      await fetchGames();
      setSuccess(editingId ? 'Game updated successfully!' : 'Game added successfully!');
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`${API_BASE}/game/delete/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Delete failed');
      }
      await fetchGames();
      setSuccess('Game deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (game) => {
    setEditingId(game._id);
    setFormData({
      title: game.title || '',
      description: game.description || '',
      ageGroup: game.ageGroup || '3-5',
      rating: Number(game.rating) || 5,
      difficultyLevel: game.difficultyLevel || 'Easy',
      category: game.category || '',
      Game_image: game.Game_image || '',
      Game_URL: game.Game_URL || ''
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      ageGroup: '3-5',
      rating: 5,
      difficultyLevel: 'Easy',
      category: '',
      Game_image: '',
      Game_URL: ''
    });
  };

  const filteredGames = games.filter(g =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  const downloadGamesPDF = () => {
    const doc = new jsPDF();
    
    // Set up the document
    doc.setFontSize(20);
    doc.text('LittleStars Games Database', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Games: ${games.length}`, 20, 40);
    
    let yPosition = 60;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 8;
    
    // Add games data
    games.forEach((game, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Game title
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${game.title}`, 20, yPosition);
      yPosition += lineHeight;
      
      // Game details
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Description: ${game.description || 'No description'}`, 20, yPosition);
      yPosition += lineHeight;
      
      doc.text(`Age Group: ${game.ageGroup}`, 20, yPosition);
      yPosition += lineHeight;
      
      doc.text(`Difficulty: ${game.difficultyLevel}`, 20, yPosition);
      yPosition += lineHeight;
      
      doc.text(`Rating: ${game.rating}/10`, 20, yPosition);
      yPosition += lineHeight;
      
      if (game.category) {
        doc.text(`Category: ${game.category}`, 20, yPosition);
        yPosition += lineHeight;
      }
      
      if (game.Game_URL) {
        doc.text(`Game URL: ${game.Game_URL}`, 20, yPosition);
        yPosition += lineHeight;
      }
      
      yPosition += 10; // Add space between games
    });
    
    // Save the PDF
    doc.save('LittleStars_Games_Database.pdf');
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div>
          <div className="sidebar-header">
            <div className="sidebar-logo" aria-label="Games Admin Logo" style={{ fontFamily: 'Pacifico, cursive', fontSize: '2.5rem' }}>🎮</div>
            <h2 style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Game Admin</h2>
            <p style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400 }}>Dashboard</p>
          </div>

          <div className="sidebar-stats">
            <div className="stat-item">
              <span>Total Games</span>
              <strong>{games.length}</strong>
            </div>
            <div className="stat-item">
              <span>Easy Games</span>
              <strong>{games.filter(g => g.difficultyLevel === 'Easy').length}</strong>
            </div>
            <div className="stat-item">
              <span>Avg Rating</span>
              <strong>
                {games.length > 0
                  ? (games.reduce((sum, g) => sum + (g.rating || 0), 0) / games.length).toFixed(1)
                  : '0.0'}
              </strong>
            </div>
            <div className="stat-item">
              <span>Categories</span>
              <strong>{new Set(games.map(g => g.category).filter(Boolean)).size}</strong>
            </div>
          </div>

          <div className="sidebar-extra">
            <h4>Recent Games</h4>
            <ul>
              {games.slice(0,3).map(g => (
                <li key={g._id}>{g.title}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="sidebar-actions">
          <button onClick={fetchGames} className="btn-refresh" aria-label="Refresh Games">
            🔄 Refresh
          </button>
          <button onClick={downloadGamesPDF} className="btn-download" aria-label="Download Games PDF">
            📄 Download PDF
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-header">
          <h1 style={{ fontFamily: 'Pacifico, cursive', fontWeight: 400 }}>Welcome, Mahen 👋</h1>
          <input
            type="search"
            placeholder="Search games..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
          />
        </header>

        {/* Info cards */}
        <section className="dashboard-cards">
          <div className="card" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Total Games: {games.length}</div>
          <div className="card" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Easy: {games.filter(g => g.difficultyLevel === 'Easy').length}</div>
          <div className="card" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Average Rating: {games.length>0 ? (games.reduce((sum,g)=>sum+(g.rating||0),0)/games.length).toFixed(1) : '0.0'}</div>
          <div className="card" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Categories: {new Set(games.map(g => g.category).filter(Boolean)).size}</div>
        </section>

        {/* Form */}
        <section className="form-section">
          <div className="section-header">
            <h1 style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>📝 {editingId ? 'Edit Game' : 'Add New Game'}</h1>
          </div>

          <form onSubmit={handleSubmit} className="game-form" autoComplete="off">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Game Title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="category" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Category</label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Game Category"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                placeholder="Game Description"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ageGroup" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Age Group *</label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  required
                >
                  <option value="3-5">3-5</option>
                  <option value="6-8">6-8</option>
                  <option value="9-12">9-12</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="difficultyLevel" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Difficulty</label>
                <select
                  id="difficultyLevel"
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="rating" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Rating (1-10)</label>
                <input
                  id="rating"
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label htmlFor="Game_image" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Image URL</label>
                <input
                  id="Game_image"
                  type="url"
                  name="Game_image"
                  value={formData.Game_image}
                  onChange={handleInputChange}
                  placeholder="Image URL"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="Game_URL" style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>Game URL *</label>
              <input
                id="Game_URL"
                type="url"
                name="Game_URL"
                value={formData.Game_URL}
                onChange={handleInputChange}
                required
                placeholder="Game URL"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Add Game'}</button>
              {editingId && (
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
              )}
            </div>
            {error && <div className="error-message" role="alert">{error}</div>}
            {success && <div className="success-message" role="status">{success}</div>}
          </form>
        </section>

        {/* Games Library */}
        <section className="games-section">
          <div className="section-header">
            <h1 style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>🎮 Games Library</h1>
            <span>Total: {filteredGames.length}</span>
          </div>
          {loading && <div className="loading">Loading games...</div>}
          {!loading && filteredGames.length === 0 && (
            <div className="empty-state">No games found. Add your first game!</div>
          )}
          <div className="games-grid">
            {filteredGames.map((game) => (
              <div key={game._id} className="game-card">
                <div className="game-image">
                  {game.Game_image ? (
                    <img src={game.Game_image} alt={game.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="game-content">
                  <h3 style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 700 }}>{game.title}</h3>
                  <p style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400 }}>{game.description}</p>
                  <div className="game-meta">
                    <span>Age: {game.ageGroup}</span>
                    <span>Difficulty: {game.difficultyLevel}</span>
                    <span>Rating: {game.rating}/10</span>
                  </div>
                  {game.category && <p style={{ fontFamily: 'Roboto, Arial, sans-serif', fontWeight: 400 }}>Category: {game.category}</p>}
                  {game.Game_URL && (
                    <a href={game.Game_URL} target="_blank" rel="noreferrer" className="play-link">Play →</a>
                  )}
                </div>
                <div className="game-actions">
                  <button className="btn-edit" onClick={() => startEdit(game)} aria-label={`Edit ${game.title}`}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(game._id)} aria-label={`Delete ${game.title}`}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminGames;
