
// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Shared
import NavBar from "./components/NavBar";
import HomeHero from "./pages/Home";

// Utils
import { initVoices } from "./Utils/voiceHelper";

// Speech Therapy
import CategoryPage from "./pages/speechTherapy/CategoryPage";
import SpeechHome from "./pages/speechTherapy/SpeechHome";
import ParentDashboard from "./pages/speechTherapy/ParentDashboard";
import TherapistDashboard from "./pages/speechTherapy/TherapistDashboard";
import TherapistDashboardSpeechStats from "./pages/speechTherapy/TherapistDashboardSpeechStats";

// Emotion Simulator
import ParallaxMagic from "./pages/emotionSimulator/ParallaxMagic";
import HappyLesson from "./pages/emotionSimulator/HappyLesson";
import EmotionActivity from "./pages/emotionSimulator/EmotionActivity";
import ExpressionPractice from "./pages/emotionSimulator/ExpressionPractice";
import MonsterAuth from "./pages/authentication/MonsterAuth";
import ContentManager from "./pages/emotionSimulator/ContentManager";
import ContentGrid from "./pages/emotionSimulator/ContentGrid";
import RequireAuth from "./auth/RequireAuth";
import MentorDashboard from "./pages/mentor/MentorDashboard";
import ReportsIndex from "./pages/mentor/ReportsIndex";
import MentorChildProgress from "./pages/mentor/MentorChildProgress";
import ScenariosPage from "./pages/mentor/ScenariosPage";

// Blogs + Nursery
import AddBlogs from "./pages/blogs/AddBlogs";
import BlogsHome from "./pages/blogs/BlogHome";
import BlogList from "./pages/blogs/BlogsCard";
import BlogDetail from "./pages/blogs/BlogDetail";
import EditBlogs from "./pages/blogs/EditBlogs.jsx"
import VirtualNursery from "./pages/virtualNursery/NurseryHome";
import NurseryDashboard from "./pages/virtualNursery/NurseryDashboard";
import NurseryActivity from "./pages/virtualNursery/NurseryActivity";
import NurseryLearnActivity from "./pages/virtualNursery/LearnSwitch";
import ActivitySwitch from "./pages/virtualNursery/ActivitySwitch";
import AlphabetLearn from "./pages/virtualNursery/learn/AlphabetLearn"

//RoutineBuilder
import RoutineHome from "./pages/routineBuilder/RoutineHome";
  
//Interactive Games
import AdminGames from './pages/games/AdminGames.jsx';

// Child Interface
import ChildAuth from "./pages/child/ChildAuth";
import ChildDashboard from "./pages/child/ChildDashboard";
import RoutineTimer from "./pages/child/RoutineTimer";

// Parent Child Management
import ChildRegistration from "./pages/parent/ChildRegistration";

// Navigation
import RoutineNavigation from "./pages/RoutineNavigation";

import Example from "./Example";

// Simple stubs
function Routine() {
  return <div style={{ padding: 20 }}>📅 Routine Builder (stub)</div>;
}
function Games() {
  return <div style={{ padding: 20 }}>🎮 Interactive Games (stub)</div>;
}
function Profile() {
  return <div style={{ padding: 20 }}>👤 Profile (stub)</div>;

}

export default function App() {
  useEffect(() => {
    initVoices((voice) => {
      console.log("✅ Voices ready:", voice.name);
    });
  }, []);

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomeHero />} />
        <Route path="/login" element={<MonsterAuth />} />
        <Route path="/profile" element={<Profile />} />

        {/* Speech Therapy Tool */}
        <Route path="/speech-home" element={<SpeechHome />} />
        <Route path="/cards/:category" element={<CategoryPage />} />
        <Route path="/parent-dashboard" element={<ParentDashboard />} />
        <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
        <Route path="/TherapistDashboardSpeechStats" element={<TherapistDashboardSpeechStats />} />

        {/* Emotion Simulator */}
        <Route path="/lesson" element={<ParallaxMagic />} />
        <Route path="/lesson/:emotion" element={<HappyLesson />} />
        <Route path="/lesson/:emotion/activity" element={<EmotionActivity />} />
        <Route path="/lesson/:emotion/content" element={<ContentGrid />} />
        <Route path="/contents" element={<ContentManager />} />

        {/* Practice (guarded) */}
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

        {/* Blogs */}
        <Route path="/blogs" element={<BlogsHome />} />
        <Route path="/blogs/list" element={<BlogList />} />
        <Route path="/blogs/new" element={<AddBlogs />} />
        <Route path="/blogs/:id" element={<BlogDetail />} />
         <Route path="/blogs/edit/:id" element={<EditBlogs />} />

        {/* Virtual Nursery */}
        <Route path="/virtualNursery" element={<VirtualNursery />} />
        <Route path="/nurseryDashboard" element={<NurseryDashboard />} />
        <Route path="/nursery/:category/select" element={<NurseryActivity />} />
        <Route
          path="/nursery/:category/learn"
          element={<NurseryLearnActivity />}
        />
        <Route
          path="/nursery/:category/activity-mode"
          element={<ActivitySwitch />}
        />
        <Route path="/alphabets" element={<AlphabetLearn isMentor={true} />} />

        {/* Routine Navigation */}
        <Route path="/routines" element={<RoutineNavigation />} />
        
        {/* Routine Builder */}
        <Route path="/routine" element={<RoutineHome />} />
        <Route path="/games" element={<AdminGames />} />

        {/* Child Interface */}
        <Route path="/child/login" element={<ChildAuth />} />
        <Route path="/child/dashboard" element={<ChildDashboard />} />
        <Route path="/child/routine/:routineId" element={<RoutineTimer />} />

        {/* Parent Child Management */}
        <Route element={<RequireAuth roles={["parent"]} />}>
          <Route path="/parent/children" element={<ChildRegistration />} />
        </Route>

        {/* Example */}
        <Route path="/example" element={<Example />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
