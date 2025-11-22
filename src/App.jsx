import { useState } from 'react'
import React from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';
import './App.css'

// src/App.jsx
// ... (imports)

export default function App() {
  return (
    <Router>
      <Routes>
        {/* This route renders the Login/Signup page */}
        <Route path="/" element={<AuthPage />} /> 
        

        
        {/* ... (other placeholder routes) ... */}
      </Routes>
    </Router>
  );
}