import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HeroFlag from './components/HeroFlag';
import './index.css';
import { initPush } from './push';


const Home = lazy(()=>import('./pages/Home'));
const Login = lazy(()=>import('./pages/Login'));
const Register = lazy(()=>import('./pages/Register'));
const AddProperty = lazy(()=>import('./pages/AddProperty'));
const Dashboard = lazy(()=>import('./pages/Dashboard'));
const PropertyDetails = lazy(()=>import('./pages/PropertyDetails'));
const VAPID_PUBLIC = 'BLeUtsomd2-ovPlVTK0jjR7Key3UE0X82ydcRkcx0Volh6-1GT4vW3W-5Xox_niGeoVTBOvYBRSIAr4hvLc7LqA	';


function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-10 text-center">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App(){
  return (
    <AuthProvider>
      <Router>
        {/* يسار = المحتوى | يمين = القائمة */}
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
                  <Route path="/add" element={<PrivateRoute><AddProperty /></PrivateRoute>} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <Sidebar />
        </div>
      </Router>
    </AuthProvider>
  );
}
console.log('FCM token:', token);