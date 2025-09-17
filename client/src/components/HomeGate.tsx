// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri
// ID: s4010989

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/stores/AuthProvider';
import { toast } from 'react-hot-toast';
import Home from '../app/pages';

const TOAST_ID = 'home-redirect';

function HomeGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  if (user.role === 'CUSTOMER') {
    return <Home />;
  }

  const target = user.role === 'VENDOR' ? '/products' : '/shippers/orders';

  useEffect(() => {
    if (location.pathname !== '/') return;

    toast('Homepage is for customers. Redirecting you to your dashboard.', {
      id: TOAST_ID,
    });

    const id = setTimeout(() => navigate(target, { replace: true }), 0);
    return () => clearTimeout(id);
  }, [location.pathname, navigate, target]);

  return null;
}

export default HomeGate;