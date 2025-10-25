import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Home from './pages/Home';
import VideoPlayer from './pages/VideoPlayer';
import Upload from './pages/Upload';
import Playlists from './pages/Playlists';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Chatbot from './components/Chatbot/Chatbot';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
            <Routes>
              {/* Public Route - Login */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <Home />
                  </main>
                  <Chatbot />
                </ProtectedRoute>
              } />
              
              <Route path="/video/:id" element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <VideoPlayer />
                  </main>
                  <Chatbot />
                </ProtectedRoute>
              } />
              
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <Upload />
                  </main>
                  <Chatbot />
                </ProtectedRoute>
              } />
              
              <Route path="/playlists" element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <Playlists />
                  </main>
                  <Chatbot />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Navbar />
                  <main>
                    <Profile />
                  </main>
                  <Chatbot />
                </ProtectedRoute>
              } />
              
              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;