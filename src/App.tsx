import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { LandingPage } from './components/LandingPage';
import { MenuPage } from './components/MenuPage';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { SuperAdminPage } from './components/SuperAdminPage';
import { QrGenerator } from './components/QrGenerator';
import { NotFoundPage } from './components/NotFoundPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';

export function AppRoutes() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/m/:slug" element={<MenuPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<SuperAdminPage />} />
        <Route path="/admin/qr" element={<QrGenerator />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <FloatingWhatsApp />
    </LanguageProvider>
  );
}

export default AppRoutes;
