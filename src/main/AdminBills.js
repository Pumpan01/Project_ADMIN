import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Toolbar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Container,
  Tooltip,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BuildIcon from "@mui/icons-material/Build";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MenuIcon from "@mui/icons-material/Menu";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function AdminBills() {
  const navigate = useNavigate();

  // =============================
  // State
  // =============================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // =============================
  // Fetch Users
  // =============================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.horplus.work/api/users");
      if (!response.ok) throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =============================
  // ดูบิลทั้งหมดของห้อง (navigate)
  // =============================
  const handleViewBills = (user) => {
    if (user && user.room_number) {
      navigate(`/room-bills/${user.room_number}?user_id=${user.user_id}`);
    } else {
      Swal.fire({ icon: "error", title: "ไม่พบข้อมูลห้อง" });
    }
  };

  // =============================
  // Sidebar Menu
  // =============================
  const menuItems = [
    { text: "Home", link: "/home", icon: <HomeIcon /> },
    { text: "ผู้ใช้", link: "/user", icon: <PeopleIcon /> },
    { text: "ห้อง", link: "/rooms", icon: <MeetingRoomIcon /> },
    { text: "แจ้งซ่อม", link: "/repair", icon: <BuildIcon /> },
    { text: "ประกาศ", link: "/announcements", icon: <CampaignIcon /> },
    { text: "บิล", link: "/admin/bills", icon: <ReceiptLongIcon /> },
  ];

  // ประกาศ Drawer State เพียงครั้งเดียว
  const [drawerOpen, setDrawerOpen] = useState(false);

  const drawer = (
    <Box
      onClick={() => setDrawerOpen(false)}
      sx={{ textAlign: "center", color: "#fff" }}
    >
      <Typography variant="h4" sx={{ my: 2 }}>
        Dashboard
      </Typography>
      <Divider sx={{ backgroundColor: "hsla(0, 0%, 100%, 0.3)" }} />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton href={item.link}>
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          background: "linear-gradient(to bottom, #E07B39 40%, #DCE4C9 10%)",
        }}
      >
        <CssBaseline />

        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            backgroundColor: "#E07B39",
            boxShadow: "0px 4px 15px #B6A28E",
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 64 } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h3"
              noWrap
              sx={{
                flexGrow: 1,
                textAlign: "center",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "2.5rem" },
                fontWeight: "bold",
              }}
            >
              ระบบจัดการบิล
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Drawer (Sidebar) */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
              backgroundColor: "#454545",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Main Content ScrollBox */}
        <Box
          sx={{
            flexGrow: 1,
            pt: 20,
            p: { xs: 1, sm: 2 },
            pb: 5,
            overflowY: "auto",
          }}
        >
          {/* Spacer */}
          <Toolbar sx={{ minHeight: 120 }} />

          {/* Container สีขาว */}
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              pt: 4,
              mx: "auto",
              width: { xs: "95%", sm: "90%", md: "1000px" },
              p: 3,
              mt: 4,
            }}
          >
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  border: "1px solid #E07B39",
                  borderRadius: 1,
                  p: "4px 8px",
                }}
              >
                รายการบิล
              </Typography>
            </Box>

            {/* ScrollBox สำหรับรายการบิล */}
            <Box
              sx={{
                maxHeight: "700px",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: 1,
                p: 1,
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 80,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                users
                  .filter((u) => u.role === "user")
                  .map((user) => (
                    <Paper
                      key={user.user_id}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: "#F5F5DC",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1 }}
                      >
                        ห้อง: {user.room_number || "ไม่พบห้อง"}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        ผู้ใช้: {user.username || "ไม่พบผู้ใช้"}
                      </Typography>
                      <Typography sx={{ mb: 1 }}>
                        ยอดเงินรวม :{" "}
                        {user.total_unpaid_amount
                          ? Number(user.total_unpaid_amount).toFixed(2)
                          : "0.00"}
                      </Typography>
                      <Box sx={{ textAlign: "right" }}>
                        <Tooltip title="ดูบิลทั้งหมด">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewBills(user)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Paper>
                  ))
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default AdminBills;
