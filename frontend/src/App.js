import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import ToolPage from './ToolPage';

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-6 py-4">
            <a href="/" className="text-2xl font-bold text-gray-800 hover:text-blue-600">PDF Tools</a>
          </nav>
        </header>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/:toolName" element={<ToolPage />} />
        </Routes>

        <footer className="bg-white mt-auto py-4">
          <div className="container mx-auto px-6 text-center text-gray-600">
            <p>&copy; 2025 PDF Tools. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
