// src/App.js
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroFlag from './components/HeroFlag';
import './index.css';
import { initPush } from './push';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-10 text-center">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  // تفعيل إشعارات FCM إن وُجد المفتاح (الكود داخل push.js محمي في حال عدم وجوده)
  useEffect(() => {
    initPush();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen layout-grid">
          <div className="flex flex-col">
            <Header />
            <main className="container py-6">
              <HeroFlag compact />
              <Suspense fallback={<div className="py-8 text-center">جارِ التحميل…</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/add"
                    element={
                      <PrivateRoute>
                        <AddProperty />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <Sidebar />
        </div>
      </Router>

      {/* زخرفة ثابتة في الزاوية */}
      <img
        src="/eagle-gold.png"
        alt="Golden Eagle"
        className="fixed bottom-4 right-4 w-20 h-20 drop-shadow-lg z-50 pointer-events-none"
      />
    </AuthProvider>
  );
}
