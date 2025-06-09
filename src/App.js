import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';

import Login from './pages/Login';
import Start from './pages/Start';
import ViewStart from './pages/ViewStart';
import UserEstimations from './pages/UserEstimations';
import StartInvoice from './pages/StartInvoice'
import MaterialNoteFrom from './pages/MaterialNoteForm';
import MaterialNote from './pages/MaterialNotes'
import UserMaterialNotes from './pages/UserMaterialNotes';
import MaterialOutwardForm from './pages/MaterialOutwardForm';
import MaterialOutwardBill from './pages/MaterialOutwardBill';
import MaterialOutward from './pages/MaterialOutwardList';
import CombinedEstimations from './pages/CombinedEstimations';

import Sidebar from './components/Navbar'; // Import Sidebar


const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:8000/ViewCustomer', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      logout();
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return (
    <Router>
      <div style={{ display: 'flex', margin:0, padding:0}}>
        <Sidebar logout={logout} />
        <main style={{ marginLeft: '260px', padding: '1rem', width: '100%' }}>
          <Routes>
            <Route path="/" element={<Start token={token} />} />
            <Route path="/ViewStart" element={<ViewStart token={token} />} />
            <Route path="/UserEstimations" element={<UserEstimations token={token} />} />
            <Route path="/StartInvoice" element={<StartInvoice token={token} />} />
            <Route path="/MaterialNoteFrom" element={<MaterialNoteFrom token={token} />} />
            <Route path="/MaterialNote" element={<MaterialNote token={token} />} />
            <Route path="/UserMaterialNotes" element={<UserMaterialNotes token={token} />} />
            <Route path="/MaterialOutwardForm" element={<MaterialOutwardForm token={token} />} />
            <Route path="/MaterialOutwardBill" element={<MaterialOutwardBill token={token} />} />
            <Route path="/MaterialOutward" element={<MaterialOutward token={token} />} />
           
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
