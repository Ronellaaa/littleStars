import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import AddBlogs from "./pages/blogs/AddBlogs";
// import AlphabetActivity from "./pages/virtualNursery/activities/AlphabetActivity";
import ActivitySwitch from "./pages/virtualNursery/ActivitySwitch";
import VirtualNursery from "./pages/virtualNursery/NurseryHome";
import Blogs from "./pages/blogs/BlogHome";
import BlogList from "./pages/blogs/BlogsCard";
import BlogDetail from "./pages/blogs/BlogDetail";
import NurseryDashboard from "./pages/virtualNursery/NurseryDashboard";
import NurseryActivity from "./pages/virtualNursery/NurseryActivity";
import NurseryLearnActivity from "./pages/virtualNursery/LearnSwitch"
import Example from "./Example";
function App() {
  return (
    <>
      <Router>
        <NavBar />
       
        {/* <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/emotions" element={<Emotions />} />
          <Route path="/speech" element={<Speech />} />
          <Route path="/routine" element={<Routine />} />
          <Route path="/games" element={<Games />} />
          <Route path="/virtualNursery" element={<VirtualNursery />} />
         
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes> */}
        <Routes>
           <Route path="/example" element={<Example />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/add-blog" element={<AddBlogs />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          <Route path="/virtualNursery" element={<VirtualNursery />} />
          <Route path="/nurseryDashboard" element={<NurseryDashboard />} />
       

          {/* Category selection page */}
          <Route
            path="/nursery/:category/select"
            element={<NurseryActivity />}
          />

          {/* Learn page (stub for now) */}
          <Route
            path="/nursery/:category/learn"
            element={<NurseryLearnActivity/>}
          />

          {/* Activity switch (goes to AlphabetActivity, etc.) */}
          <Route
            path="/nursery/:category/activity-mode"
            element={<ActivitySwitch />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<div style={{ padding: 20 }}>Not found</div>}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
