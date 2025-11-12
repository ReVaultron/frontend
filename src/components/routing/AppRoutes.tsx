// components/routing/AppRoutes.tsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NotFound from "../../pages/NotFound";
import { DashboardLayout } from "../layout/Layout";
import Dashboard from "../../pages/Index";
import Analytics from "@/pages/Analytics";
import VaultDetails from "@/pages/VaultDetails";
import Landing from "@/pages/Landing";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes with Dashboard Layout (Header + Sidebar) */}
        <Route path="/" element={<Landing />} />
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/vault/:id" element={<VaultDetails />} />
        </Route>
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
