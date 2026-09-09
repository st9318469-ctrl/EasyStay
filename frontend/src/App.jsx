import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Login from './Pages/Login';
import Register from './Pages/Register';
import UserDashboard from './Pages/Dashboard';
import HostDashboard from './components/HostDashboard';
import PropertyDetail from './Pages/PropertyDetail';
import PropertyListings from './components/PropertyListings';
import Wishlist from './Pages/Wishlist';
import SearchPage from './components/SearchPage';
import Profile from './Pages/Profile';
import AddProperty from './Pages/AddProperty';
import ForgotPassword from './Pages/ForgotPassword';
import Messages from './Pages/Messages';
import AccountSettings from './Pages/AccountSettings';
import AdminDashboard from './Pages/AdminDashboard';
import EditProperty from './Pages/EditProperty';


// Protected Route Component (for authenticated users)
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Host Route Component (only for users with host role)
const HostRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (user.role !== 'host' && user.role !== 'admin') {
        return <Navigate to="/my-trips" replace />;
    }
    return children;
};

// Admin Route Component (only for users with admin role)
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};

const App = () => {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<PropertyListings />} />
                <Route path="/property/:id" element={<PropertyDetail />} />
                <Route path="/messages" element={
    <ProtectedRoute>
        <Messages />
    </ProtectedRoute>
} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/wishlist" element={
                    <ProtectedRoute>
                        <Wishlist />
                    </ProtectedRoute>
                } />
                <Route 
    path="/add-property" 
    element={
        <HostRoute>
            <AddProperty />
        </HostRoute>
    } 
/>
<Route 
    path="/host-dashboard" 
    element={
        <HostRoute>
            <HostDashboard />
        </HostRoute>
    } 
/>
                <Route path="/search" element={<SearchPage />} />
<Route 
    path="/profile" 
    element={
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    } 
/>
<Route
    path="/settings"
    element={
        <ProtectedRoute>
            <AccountSettings />
        </ProtectedRoute>
    }
/>
                
                {/* Protected User Routes - For guests */}
                <Route 
                    path="/my-trips" 
                    element={
                        <ProtectedRoute>
                            <UserDashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Redirect old dashboard to new one */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Navigate to="/my-trips" replace />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Route */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />

                {/* Edit Property Route */}
                <Route
                    path="/edit-property/:id"
                    element={
                        <HostRoute>
                            <EditProperty />
                        </HostRoute>
                    }
                />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
};

export default App;
