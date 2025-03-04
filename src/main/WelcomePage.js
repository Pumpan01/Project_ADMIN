import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import logo from "../Pictures/logohorplus.png";

function WelcomePage() {
  const navigate = useNavigate();

  // ===== State สำหรับ Dialog Login =====
  const [openLogin, setOpenLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ===== State สำหรับ Dialog Admin Secret =====
  const [openAdminSecret, setOpenAdminSecret] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  // รหัสลับที่กำหนด (ตัวอย่าง)
  const ADMIN_SECRET_CODE = "MYADMIN123";

  // ----------------------------------------------------------
  // 1) LOGIN DIALOG
  // ----------------------------------------------------------
  const handleOpenLogin = () => setOpenLogin(true);
  const handleCloseLogin = () => setOpenLogin(false);

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("เข้าสู่ระบบสำเร็จ", {
          position: "top-center",
          autoClose: 1000,
        });
        setTimeout(() => navigate("/home"), 1000);
      } else {
        toast.error(result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", {
          position: "top-center",
          autoClose: 1000,
        });
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("เกิดปัญหาในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองอีกครั้ง", {
        position: "top-center",
        autoClose: 1000,
      });
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // 2) ADMIN SECRET DIALOG
  // ----------------------------------------------------------
  const handleOpenAdminSecret = () => setOpenAdminSecret(true);
  const handleCloseAdminSecret = () => setOpenAdminSecret(false);

  const handleCheckSecretCode = () => {
    if (!secretCode) {
      toast.error("กรุณากรอกรหัสลับ", {
        position: "top-center",
        autoClose: 1000,
      });
      return;
    }

    if (secretCode.trim() === ADMIN_SECRET_CODE) {
      toast.success("รหัสลับถูกต้อง! ดำเนินการต่อได้", {
        position: "top-center",
        autoClose: 1000,
      });
      // ตัวอย่าง: ย้ายไปหน้าสำหรับสมัคร Admin ใหม่
      // หรือจะเปิดฟอร์มสมัครต่อใน Dialog เดียวกันก็ได้
      setTimeout(() => {
        setOpenAdminSecret(false);
        navigate("/user");
        // หรือ navigate("/register-admin") ก็ได้ ตามโครงสร้างโปรเจ็กต์
      }, 1200);
    } else {
      toast.error("รหัสลับไม่ถูกต้อง!", {
        position: "top-center",
        autoClose: 1000,
      });
    }
  };

  // ----------------------------------------------------------
  // 3) UI
  // ----------------------------------------------------------
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #e0e0e0, #ff7043)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ToastContainer />

      {/* ภาพพื้นหลัง */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: "url(https://source.unsplash.com/random/1920x1080)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(5px)",
          opacity: 0.4,
          zIndex: -1,
        }}
      />

      {/* กล่อง content */}
      <Container
        maxWidth="xs"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "15px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
          padding: { xs: "15px 20px", sm: "20px 40px" },
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          component="img"
          src={logo}
          alt="HorPlus Logo"
          sx={{
            width: { xs: "60px", sm: "80px", md: "100px", lg: "120px" },
            marginBottom: "20px",
          }}
        />

        <Typography
          variant="h3"
          sx={{
            color: "#ff5722",
            fontWeight: "bold",
            letterSpacing: "2px",
            marginBottom: "10px",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "3rem" },
          }}
        >
          HORPLUS
        </Typography>

        <Button
          variant="contained"
          onClick={handleOpenLogin}
          sx={{
            backgroundColor: "#ff5722",
            color: "#fff",
            fontWeight: "bold",
            mt: 2,
            mb: 1,
            width: "100%",
          }}
        >
          เข้าสู่ระบบ
        </Button>

        {/* ปุ่มสำหรับ "เพิ่ม Admin" */}
        <Button
          variant="outlined"
          onClick={handleOpenAdminSecret}
          sx={{
            color: "#ff5722",
            borderColor: "#ff5722",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          เพิ่มผู้ใช้ Admin
        </Button>
      </Container>

      {/* Dialog ล็อกอิน */}
      <Dialog open={openLogin} onClose={handleCloseLogin}>
        <DialogTitle>เข้าสู่ระบบ</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Username"
            fullWidth
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <TextField
            margin="normal"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogin} disabled={loading}>
            ยกเลิก
          </Button>
          <Button onClick={handleLogin} variant="contained" disabled={loading}>
            {loading ? "กำลังโหลด..." : "เข้าสู่ระบบ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ใส่ Secret Code สำหรับเพิ่ม Admin */}
      <Dialog open={openAdminSecret} onClose={handleCloseAdminSecret}>
        <DialogTitle>เพิ่ม Admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Secret Code"
            type="password"
            fullWidth
            variant="outlined"
            value={secretCode}
            onChange={(e) => setSecretCode(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAdminSecret}>ยกเลิก</Button>
          <Button variant="contained" onClick={handleCheckSecretCode}>
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WelcomePage;
