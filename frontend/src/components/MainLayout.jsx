import React from 'react';
import Navbar from './navbar.jsx';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow"><Outlet /></main>
    </>
  );
} 