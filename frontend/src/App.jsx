import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import CategoryPage from "./pages/speechTherapy/CategoryPage";
import SpeechHome from "./pages/speechTherapy/SpeechHome";
import { initVoices } from "./Utils/voiceHelper";
import ParentDashboard from "./pages/speechTherapy/ParentDashboard";
import TherapistDashboard from "./pages/speechTherapy/TherapistDashboard";

const App = () => {
  useEffect(() => {
    initVoices((voice) => {
      console.log("✅ Voices ready:", voice.name);
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<SpeechHome />} />
      <Route path="/cards/:category" element={<CategoryPage />} />
      <Route path="/dashboard" element={<ParentDashboard />} />
      <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
    </Routes>
  );
};

export default App;