import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Lazy load components
const WelcomePage = lazy(() => import("./main/WelcomePage"));
const HomePage = lazy(() => import("./main/home"));
const UserManagement = lazy(() => import("./main/user"));
const RepairPage = lazy(() => import("./main/repair"));
const Announcements = lazy(() => import("./main/announcements"));
const AdminBills = lazy(() => import("./main/AdminBills"));
const RoomBills = lazy(() => import("./main/RoomBills"));
const Rooms = lazy(() => import("./main/room"));

function LoadingFallback() {
  return <div style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</div>;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/user" element={<UserManagement />} />
          <Route path="/repair" element={<RepairPage />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/admin/bills" element={<AdminBills />} />
          <Route path="/room-bills/:roomId" element={<RoomBills />} />
          <Route path="/rooms" element={<Rooms />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
