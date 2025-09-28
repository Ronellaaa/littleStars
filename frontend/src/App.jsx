// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ── Shared UI ──────────────────────────────────────────────────────────────────
import NavBar from "./components/NavBar";
import HomeHero from "./pages/Home";

// ── Emotion Simulator (EmotionSimulator branch) ────────────────────────────────
import ParallaxMagic from "./pages/emotionSimulator/ParallaxMagic";
import HappyLesson from "./pages/emotionSimulator/HappyLesson";
import EmotionActivity from "./pages/emotionSimulator/EmotionActivity";
import ExpressionPractice from "./pages/emotionSimulator/ExpressionPractice";
import MonsterAuth from "./pages/authentication/MonsterAuth";
import ContentManager from "./pages/emotionSimulator/ContentManager";
import ContentGrid from "./pages/emotionSimulator/ContentGrid";
import RequireAuth from "./auth/RequireAuth";

// Mentor area
import MentorDashboard from "./pages/mentor/MentorDashboard";
import ReportsIndex from "./pages/mentor/ReportsIndex";
import MentorChildProgress from "./pages/mentor/MentorChildProgress";
import ScenariosPage from "./pages/mentor/ScenariosPage";

// ── Blogs + Nursery (test-branch1) ─────────────────────────────────────────────
import AddBlogs from "./pages/blogs/AddBlogs";
import BlogsHome from "./pages/blogs/BlogHome";
import BlogList from "./pages/blogs/BlogsCard";
import BlogDetail from "./pages/blogs/BlogDetail";

import VirtualNursery from "./pages/virtualNursery/NurseryHome";
import NurseryDashboard from "./pages/virtualNursery/NurseryDashboard";
import NurseryActivity from "./pages/virtualNursery/NurseryActivity";
import NurseryLearnActivity from "./pages/virtualNursery/LearnSwitch";
import ActivitySwitch from "./pages/virtualNursery/ActivitySwitch";

import Example from "./Example";

// ── Simple stubs kept from EmotionSimulator branch ─────────────────────────────
function Speech()  { return <div style={{ padding: 20 }}>🗣️ Speech Therapy (stub)</div>; }
function Routine() { return <div style={{ padding: 20 }}>📅 Routine Builder (stub)</div>; }
function Games()   { return <div style={{ padding: 20 }}>🎮 Interactive Games (stub)</div>; }
function Profile() { return <div style={{ padding: 20 }}>👤 Profile (stub)</div>; }

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomeHero />} />
        <Route path="/login" element={<MonsterAuth />} />
        <Route path="/profile" element={<Profile />} />

        {/* Emotion sim public pages */}
        <Route path="/lesson" element={<ParallaxMagic />} />
        <Route path="/lesson/:emotion" element={<HappyLesson />} />
        <Route path="/lesson/:emotion/activity" element={<EmotionActivity />} />
        <Route path="/lesson/:emotion/content" element={<ContentGrid />} />
        <Route path="/contents" element={<ContentManager />} />

        {/* Other modules (public stubs or your future pages) */}
        <Route path="/speech" element={<Speech />} />
        <Route path="/routine" element={<Routine />} />
        <Route path="/games" element={<Games />} />

        {/* Blogs (consolidated) */}
        <Route path="/blogs" element={<BlogsHome />} />
        {/* Use /blogs/list for your card list page to avoid duplicate /blogs */}
        <Route path="/blogs/list" element={<BlogList />} />
        <Route path="/blogs/new" element={<AddBlogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />

        {/* Virtual Nursery */}
        <Route path="/virtualNursery" element={<VirtualNursery />} />
        <Route path="/nurseryDashboard" element={<NurseryDashboard />} />
        {/* Category selection (ex: /nursery/alphabets/select) */}
        <Route path="/nursery/:category/select" element={<NurseryActivity />} />
        {/* Learn page */}
        <Route path="/nursery/:category/learn" element={<NurseryLearnActivity />} />
        {/* Activity switcher */}
        <Route path="/nursery/:category/activity-mode" element={<ActivitySwitch />} />

        {/* Practice: require parent or mentor */}
        <Route element={<RequireAuth roles={["parent", "mentor"]} />}>
          <Route path="/practice/:emotion" element={<ExpressionPractice />} />
        </Route>

        {/* Mentor-only area */}
        <Route element={<RequireAuth roles={["mentor"]} />}>
          <Route path="/mentor" element={<MentorDashboard />}>
            <Route index element={<Navigate to="reports" replace />} />
            <Route path="reports" element={<ReportsIndex />} />
            <Route path="progress/:childId" element={<MentorChildProgress />} />
            <Route path="scenarios" element={<ScenariosPage />} />
            <Route path="content" element={<ContentManager />} />
          </Route>
        </Route>

        {/* Misc */}
        <Route path="/example" element={<Example />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
