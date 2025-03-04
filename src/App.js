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
const Layout = lazy(() => import("./Layout"));

function LoadingFallback() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>กำลังโหลด...</div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />

          {/* หน้าจอ HomePage ใช้ข้อความเฉพาะ */}
          <Route
            element={
              <Layout
                headerTitle="ระบบจัดการหอพัก"
                headerSubtitle="จัดการข้อมูลทั้งหมดในระบบได้ที่นี่"
              />
            }
          >
            <Route path="/home" element={<HomePage />} />
          </Route>

          {/* หน้าจอ UserManagement */}
          <Route
            element={
              <Layout
                headerTitle="การจัดการผู้ใช้งาน"
                headerSubtitle="จัดการข้อมูลผู้ใช้งานในระบบได้ที่นี่"
              />
            }
          >
            <Route path="/user" element={<UserManagement />} />
          </Route>

          {/* หน้าจอ RepairPage */}
          <Route
            element={
              <Layout
                headerTitle="การแจ้งซ่อม"
                headerSubtitle="จัดการข้อมูลการแจ้งซ่อมของหอพัก"
              />
            }
          >
            <Route path="/repair" element={<RepairPage />} />
          </Route>

          {/* หน้าจอ Announcements */}
          <Route
            element={
              <Layout
                headerTitle="การจัดการประกาศ"
                headerSubtitle="จัดการประกาศในระบบ"
              />
            }
          >
            <Route path="/announcements" element={<Announcements />} />
          </Route>

          {/* หน้าจอ AdminBills */}
          <Route
            element={
              <Layout
                headerTitle="บิล"
                headerSubtitle="ดูและจัดการบิลของหอพัก"
              />
            }
          >
            <Route path="/admin/bills" element={<AdminBills />} />
          </Route>

          {/* หน้าจอ RoomBills */}
          <Route
            element={
              <Layout
                headerTitle="บิลของห้อง"
                headerSubtitle="ดูรายละเอียดบิลของห้องที่เลือก"
              />
            }
          >
            <Route path="/room-bills/:roomId" element={<RoomBills />} />
          </Route>

          {/* หน้าจอ Rooms */}
          <Route
            element={
              <Layout
                headerTitle="การจัดการห้อง"
                headerSubtitle="ดูและจัดการข้อมูลห้องในระบบ"
              />
            }
          >
            <Route path="/rooms" element={<Rooms />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
