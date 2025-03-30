import React, { useState, useEffect } from "react";
import {
  AppBar,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BuildIcon from "@mui/icons-material/Build";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function Announcements() {
  const navigate = useNavigate();

  // ================================
  // 1) State
  // ================================
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog + ฟอร์ม
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    announcement_id: "",
    title: "",
    detail: "",
  });

  // ประกาศตัวแปร Drawer State "ครั้งเดียว"
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ================================
  // 2) ฟังก์ชันดึงข้อมูลประกาศ
  // ================================
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.horplus.work/api/announcements"
      );
      if (!response.ok) {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
        return;
      }
      const data = await response.json();
      // เรียงลำดับจากใหม่ -> เก่า
      const sorted = data.sort((a, b) => b.announcement_id - a.announcement_id);
      setAnnouncements(sorted);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // ================================
  // 3) ฟอร์ม + Dialog
  // ================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (announce = null) => {
    if (announce) {
      setFormData(announce);
      setIsEditing(true);
    } else {
      setFormData({ announcement_id: "", title: "", detail: "" });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // ================================
  // 4) บันทึกประกาศ (Create/Update)
  // ================================
  const handleSaveAnnouncement = async () => {
    if (!formData.title || !formData.detail) {
      Swal.fire({
        icon: "error",
        title: "กรุณากรอกข้อมูลที่จำเป็น",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const url = isEditing
        ? `https://api.horplus.work/api/announcements/${formData.announcement_id}`
        : "https://api.horplus.work/api/announcements";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: isEditing ? "แก้ไขประกาศสำเร็จ" : "เพิ่มประกาศสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchAnnouncements();
        handleCloseDialog();
      } else {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
      }
    } catch (error) {
      console.error("Error saving announcement:", error);
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
  };

  // ================================
  // 5) ลบประกาศ
  // ================================
  const handleDeleteAnnouncement = async (announcement_id) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ประกาศนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const response = await fetch(
          `https://api.horplus.work/api/announcements/${announcement_id}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "ลบประกาศสำเร็จ",
            text: "ประกาศถูกลบเรียบร้อย!",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchAnnouncements();
        } else {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาดในการลบข้อมูล",
            text: "ไม่สามารถลบประกาศได้",
          });
        }
      } catch (error) {
        console.error("Error deleting announcement:", error);
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "เกิดข้อผิดพลาดในการลบข้อมูล",
        });
      }
    });
  };

  // ================================
  // 6) Sidebar Menu
  // ================================
  const menuItems = [
    { text: "Home", link: "/home", icon: <HomeIcon /> },
    { text: "ผู้ใช้", link: "/user", icon: <PeopleIcon /> },
    { text: "ห้อง", link: "/rooms", icon: <MeetingRoomIcon /> },
    { text: "แจ้งซ่อม", link: "/repair", icon: <BuildIcon /> },
    { text: "ประกาศ", link: "/announcements", icon: <CampaignIcon /> },
    { text: "บิล", link: "/admin/bills", icon: <ReceiptLongIcon /> },
  ];

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

  // ================================
  // Render
  // ================================
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
              ระบบจัดประกาศ
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
            overflowY: "auto", // Scrollbar แนวตั้ง
          }}
        >
          {/* Spacer เพื่อไม่ให้เนื้อหาถูก AppBar ทับ */}
          <Toolbar sx={{ minHeight: 120 }} />

          {/* Container พื้นหลังสีขาว */}
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
            {/* Header: "รายการประกาศ" กับปุ่ม "เพิ่มประกาศใหม่" */}
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
                รายการประกาศ
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background: "linear-gradient(45deg, #E07B39, #E07B39)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #E07B39, #E07B39)",
                  },
                }}
                onClick={() => handleOpenDialog()}
              >
                เพิ่มประกาศใหม่
              </Button>
            </Box>

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
              // ScrollBox สำหรับรายการประกาศ
              <Box
                sx={{
                  maxHeight: "700px",
                  overflowY: "auto",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {announcements.map((announce) => (
                  <Paper
                    key={announce.announcement_id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: "#F5F5DC",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                      {announce.title}
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-wrap" }}>
                      {announce.detail}
                    </Typography>
                    <Box sx={{ textAlign: "right", mt: 1 }}>
                      <Tooltip title="แก้ไขประกาศ">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(announce)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบประกาศ">
                        <IconButton
                          color="error"
                          onClick={() =>
                            handleDeleteAnnouncement(announce.announcement_id)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Dialog: เพิ่ม/แก้ไขประกาศ */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            bgcolor: "#E07B39",
            color: "white",
            py: 2,
          }}
        >
          {isEditing ? "แก้ไขประกาศ" : "เพิ่มประกาศใหม่"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff", p: 3 }}>
          <TextField
            label="หัวข้อ"
            name="title"
            fullWidth
            margin="normal"
            value={formData.title || ""}
            onChange={handleChange}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <TextField
            label="รายละเอียด"
            name="detail"
            fullWidth
            margin="normal"
            value={formData.detail || ""}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "space-between",
            p: 2,
            backgroundColor: "#fff",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{
              borderColor: "#E07B39",
              color: "#E07B39",
              textTransform: "none",
              "&:hover": { borderColor: "#E07B39" },
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSaveAnnouncement}
            variant="contained"
            sx={{
              backgroundColor: "#E07B39",
              textTransform: "none",
              "&:hover": { backgroundColor: "#E07B39" },
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Announcements;
