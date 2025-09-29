# Little Stars - User Games Frontend

This is the user-side frontend for the Little Stars application, displaying games that are managed through the admin panel.

## Features

- 🎮 Display all games from the admin panel
- 🔍 Search and filter games by title, age group, difficulty, and category
- 🎯 Beautiful, responsive game cards
- 📱 Mobile-friendly design
- ⚡ Fast loading with modern React

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- The backend server running on port 5000

### Installation

1. Navigate to the userG directory:
```bash
cd userG
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

## API Integration

The frontend connects to the backend API at `http://localhost:5000` to fetch games data. Make sure the backend server is running before starting the frontend.

## Project Structure

```
userG/
├── src/
│   ├── components/
│   │   ├── GameCard.jsx      # Individual game display
│   │   ├── GameCard.css
│   │   ├── Header.jsx        # App header
│   │   ├── Header.css
│   │   ├── SearchFilter.jsx  # Search and filter controls
│   │   └── SearchFilter.css
│   ├── pages/
│   │   ├── GamesHome.jsx   # Main games page
│   │   └── GamesHome.css
│   ├── App.jsx             # Main app component
│   ├── App.css
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Features

### Game Display
- Responsive grid layout
- Game images with fallback placeholders
- Game metadata (age group, difficulty, rating)
- Direct play links

### Search & Filter
- Search by game title
- Filter by age group (3-5, 6-8, 9-12)
- Filter by difficulty (Easy, Medium, Hard)
- Filter by category
- Clear all filters

### Responsive Design
- Mobile-first approach
- Adaptive grid layout
- Touch-friendly interface
- Optimized for all screen sizes

## Technologies Used

- React 18
- Vite
- CSS3 with modern features
- React Router DOM
- Fetch API for backend communication
