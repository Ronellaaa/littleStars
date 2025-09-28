// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ParallaxMagic from "./pages/emotionSimulator/ParallaxMagic";
import HappyLesson from "./pages/emotionSimulator/HappyLesson";
import EmotionActivity from "./pages/emotionSimulator/EmotionActivity";
import ExpressionPractice from "./pages/emotionSimulator/ExpressionPractice";
import MonsterAuth from "./pages/authentication/MonsterAuth";
import ContentManager from "./pages/emotionSimulator/ContentManager";
import ContentGrid from "./pages/emotionSimulator/ContentGrid";
import RequireAuth from "./auth/RequireAuth";            // ✅ use your guard
import NavBar from "./components/NavBar";
import HomeHero from "./pages/Home";

// Mentor area
import MentorDashboard from "./pages/mentor/MentorDashboard";
import ReportsIndex from "./pages/mentor/ReportsIndex";
import MentorChildProgress from "./pages/mentor/MentorChildProgress";
import ScenariosPage from "./pages/mentor/ScenariosPage";

function Blogs()   { return <div style={{ padding: 20 }}>📝 Blogs (stub)</div>; }
function Speech()  { return <div style={{ padding: 20 }}>🗣️ Speech Therapy (stub)</div>; }
function Routine() { return <div style={{ padding: 20 }}>📅 Routine Builder (stub)</div>; }
function Games()   { return <div style={{ padding: 20 }}>🎮 Interactive Games (stub)</div>; }
function Nursery() { return <div style={{ padding: 20 }}>🌼 Virtual Nursery (stub)</div>; }
function Profile() { return <div style={{ padding: 20 }}>👤 Profile (stub)</div>; }

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomeHero />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/lesson" element={<ParallaxMagic />} />
        <Route path="/speech" element={<Speech />} />
        <Route path="/routine" element={<Routine />} />
        <Route path="/games" element={<Games />} />
        <Route path="/nursery" element={<Nursery />} />
        <Route path="/login" element={<MonsterAuth />} />
        <Route path="/profile" element={<Profile />} />

        {/* Lesson/content pages (public or protect if you want) */}
        <Route path="/lesson/:emotion" element={<HappyLesson />} />
        <Route path="/lesson/:emotion/activity" element={<EmotionActivity />} />
        <Route path="/lesson/:emotion/content" element={<ContentGrid />} />
        <Route path="/contents" element={<ContentManager />} />

        {/* Practice: any logged-in user (parent or mentor) */}
        <Route element={<RequireAuth roles={["parent", "mentor"]} />}>
          <Route path="/practice/:emotion" element={<ExpressionPractice />} />
        </Route>

       
        <Route element={<RequireAuth roles={["mentor"]} />}>
          <Route path="/mentor" element={<MentorDashboard />}>
            <Route index element={<Navigate to="reports" replace />} />
            <Route path="reports" element={<ReportsIndex />} />
            <Route path="progress/:childId" element={<MentorChildProgress />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            {/* use ContentManager for now */}
            <Route path="content" element={<ContentManager />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
