/* eslint-disable */
import React, { useState, forwardRef } from "react";
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
  Slide,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../Pictures/logohorplus.png";

// สร้าง Transition สำหรับ Dialog ให้สไลด์ขึ้น
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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

  // ===== State สำหรับการแจ้งเตือน (Snackbar) =====
  const [notif, setNotif] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") return;
    setNotif({ ...notif, open: false });
  };

  const showNotification = (message, severity = "success") => {
    setNotif({ open: true, message, severity });
  };

  // รหัสลับที่กำหนด (ตัวอย่าง)
  const ADMIN_SECRET_CODE = "MYADMIN123";

  // ----------------------------------------------------------
  // 1) LOGIN DIALOG
  // ----------------------------------------------------------
  const handleOpenLogin = () => setOpenLogin(true);
  const handleCloseLogin = () => setOpenLogin(false);

  const handleLogin = async () => {
    if (!username || !password) {
      showNotification("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.horplus.work/api/login-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        showNotification("เข้าสู่ระบบสำเร็จ", "success");
        setTimeout(() => navigate("/home"), 1000);
      } else {
        showNotification(
          result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          "error"
        );
      }
    } catch (err) {
      console.error("Error:", err);
      showNotification(
        "เกิดปัญหาในการเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองอีกครั้ง",
        "error"
      );
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
      showNotification("กรุณากรอกรหัสลับ", "error");
      return;
    }

    if (secretCode.trim() === ADMIN_SECRET_CODE) {
      showNotification("รหัสลับถูกต้อง! ดำเนินการต่อได้", "success");
      setTimeout(() => {
        setOpenAdminSecret(false);
        navigate("/user");
      }, 1200);
    } else {
      showNotification("รหัสลับไม่ถูกต้อง!", "error");
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
        background: "linear-gradient(to bottom, #E07B39, #DCE4C9)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Popup แจ้งเตือน */}
      <Snackbar
        open={notif.open}
        autoHideDuration={1500}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notif.severity}
          sx={{ width: "100%" }}
        >
          {notif.message}
        </Alert>
      </Snackbar>

      {/* ภาพพื้นหลัง (ตัวอย่าง) */}
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
          width: "100%",
          maxWidth: { xs: 350, sm: 400 },
          backgroundColor: "#F5F5DC",
          borderRadius: "15px",
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
          padding: { xs: "20px", sm: "30px 40px" },
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
            color: "#454545",
            fontWeight: "bold",
            letterSpacing: "2px",
            marginBottom: "10px",
            fontSize: { xs: "1.8rem", sm: "2rem", md: "2.5rem", lg: "3rem" },
          }}
        >
          HORPLUS
        </Typography>

        <Button
          variant="contained"
          onClick={handleOpenLogin}
          sx={{
            backgroundColor: "#E07B39",
            color: "#fff",
            fontWeight: "bold",
            mt: 2,
            mb: 1,
            width: "100%",
            "&:hover": {
              backgroundColor: "#E07B39",
            },
          }}
        >
          เข้าสู่ระบบ
        </Button>

        {/* ปุ่มสำหรับ "เพิ่ม Admin" */}
        <Button
          variant="outlined"
          onClick={handleOpenAdminSecret}
          sx={{
            color: "#454545",
            borderColor: "#454545",
            fontWeight: "bold",
            width: "100%",
            "&:hover": {
              borderColor: "#454545",
              color: "#454545",
            },
          }}
        >
          เพิ่มผู้ใช้ Admin
        </Button>
      </Container>

      {/* Dialog ล็อกอิน */}
      <Dialog
        open={openLogin}
        onClose={handleCloseLogin}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 2,
            pt: 1,
            pb: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#E07B39",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            mb: 1,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          เข้าสู่ระบบ
        </DialogTitle>
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
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={handleCloseLogin} disabled={loading}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleLogin}
            variant="contained"
            disabled={loading}
            sx={{
              backgroundColor: "#E07B39",
              color: "#fff",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#E07B39",
              },
            }}
          >
            {loading ? "กำลังโหลด..." : "เข้าสู่ระบบ"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog ใส่ Secret Code สำหรับเพิ่ม Admin */}
      <Dialog
        open={openAdminSecret}
        onClose={handleCloseAdminSecret}
        TransitionComponent={Transition}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 2,
            pt: 1,
            pb: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#E07B39",
            color: "#fff",
            fontWeight: "bold",
            textAlign: "center",
            mb: 1,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        >
          เพิ่ม Admin
        </DialogTitle>
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
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={handleCloseAdminSecret}>ยกเลิก</Button>
          <Button
            variant="contained"
            onClick={handleCheckSecretCode}
            sx={{
              backgroundColor: "#E07B39",
              color: "#fff",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#E07B39",
              },
            }}
          >
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WelcomePage;
