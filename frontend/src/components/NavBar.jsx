import "../styles/componentsStyles/NavBar.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NavBar() {
  const [username, setUserName] = useState("");
  const navigate = useNavigate();
  return (
    <>
      <nav className="nav-bar">
        <ul className="nav-list">
          <div className="logo"> 
            <h1> Little Stars</h1>
            </div>
          <div className="nav-left">
            
          <li>
            <Link to="/">Home</Link>
          </li>
          <li id="tools-li">
            <select
              className="nav-select"
              value=""
              onChange={(e) => {
                navigate(e.target.value);
              }}
            >
              <option value="" disabled>
                Therapy Tools
              </option>
              <option value="/emotions" id="emotion-opt">
                Emotion Simulator
              </option>
              <option value="/speech" id="speech-opt">
                Speech Simulator
              </option>
              <option value="/routine" id="routine-opt">
                Routine Simulator
              </option>
              <option value="/games" id="games-opt">
                Games Simulator
              </option>
              <option value="/virtualNursery" id="nursery-opt">
                Virtual Nursery
                
              </option>
            </select>
          </li>
          <li>
            <Link to="/blogs">Blog</Link>
          </li>
          </div>
          <div className="nav-right">
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Get Started</Link>
            </li>
          </div>
        </ul>
      </nav>
    </>
  );
}
