import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../../styles/virtualNurseyStyles/NurseryStyles.css";

export default function NurseryHome() {
  return (
    <>
      <main className="nursery-main">
        <div className="nursery-container">
          <h1>Welcome to Virtual Nursery </h1>
          <Link to="/nurseryDashboard">
            <button className="nurseryButton">
              <span class="nurseryButton-shadow"></span>
              <span class="nurseryButton-edge"></span>
              <span class="nurseryButton-front text">Get Started</span>
            </button>
          </Link>
        </div>
      </main>
    </>
  );
}
