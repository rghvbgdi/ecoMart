import React from 'react';
import { Outlet } from 'react-router-dom';

export default function SellerLayout() {
  return <main className="flex-grow"><Outlet /></main>;
} 