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
  MenuItem,
  Paper,
  Select,
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

function RepairPage() {
  const navigate = useNavigate();

  // =============================
  // 1) State
  // =============================
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog + Form
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    repair_id: "",
    status: "pending",
  });

  // Drawer (Sidebar)
  const [drawerOpen, setDrawerOpen] = useState(false);

  // =============================
  // 2) Fetch Repairs
  // =============================
  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.horplus.work/api/repairs");
      if (!response.ok) {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
        return;
      }
      const data = await response.json();

      // ถ้า repair_date เป็น YYYY-MM-DD (ไม่มีเวลา) ให้เติม T00:00:00
      // ถ้า created_at เป็น YYYY-MM-DD HH:mm:ss ให้แทน " " ด้วย "T" เพื่อแปลงเป็นรูปแบบ ISO
      const transformedData = data.map((repair) => {
        let dateStr = repair.repair_date;
        if (dateStr && dateStr.length === 10) {
          dateStr += "T00:00:00"; // บังคับเวลาเป็นเที่ยงคืน
        }

        let createdAtStr = repair.created_at;
        // สมมติฝั่งเซิร์ฟเวอร์ส่งเป็น "YYYY-MM-DD HH:mm:ss" (ยาว 19 ตัวอักษร)
        // เราอาจแทนที่ช่องว่างด้วย "T" เพื่อให้ new Date(...) ประมวลผลได้
        if (createdAtStr && createdAtStr.length === 19) {
          // "2023-05-26 15:30:00" -> "2023-05-26T15:30:00"
          createdAtStr = createdAtStr.replace(" ", "T");
        }

        return {
          ...repair,
          repair_date: dateStr,
          created_at: createdAtStr,
        };
      });

      setRepairs(transformedData);
    } catch (error) {
      console.error("Error fetching repairs:", error);
      Swal.fire({ icon: "error", title: "เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  // =============================
  // 3) Handle Form & Dialog
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (repair = null) => {
    if (repair) {
      setFormData(repair);
      setIsEditing(true);
    } else {
      setFormData({ repair_id: "", status: "pending" });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // =============================
  // 4) Update Repair
  // =============================
  const handleUpdateRepair = async () => {
    if (!formData.status) {
      Swal.fire({
        icon: "error",
        title: "กรุณาเลือกสถานะ",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    setOpenDialog(false);
    try {
      const response = await fetch(
        `https://api.horplus.work/api/repairs/${formData.repair_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: formData.status }),
        }
      );
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "บันทึกแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchRepairs();
      } else {
        const errorData = await response.json();
        Swal.fire({
          icon: "error",
          title: `เกิดข้อผิดพลาด: ${errorData.error || "บันทึกข้อมูลล้มเหลว"}`,
        });
      }
    } catch (error) {
      console.error("Error updating repair:", error);
      Swal.fire({ icon: "error", title: "บันทึกข้อมูลล้มเหลว" });
    }
  };

  // =============================
  // 5) Delete Repair
  // =============================
  const handleDeleteRepair = async (repair_id) => {
    Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ข้อมูลการแจ้งซ่อมนี้จะถูกลบถาวร!",
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
          `https://api.horplus.work/api/repairs/${repair_id}`,
          { method: "DELETE" }
        );
        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "ลบข้อมูลสำเร็จ",
            timer: 2000,
            showConfirmButton: false,
          });
          fetchRepairs();
        } else {
          Swal.fire({ icon: "error", title: "ลบข้อมูลล้มเหลว" });
        }
      } catch (error) {
        console.error("Error deleting repair:", error);
        Swal.fire({ icon: "error", title: "ลบข้อมูลล้มเหลว" });
      }
    });
  };

  // =============================
  // 6) Sidebar Menu
  // =============================
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

  // =============================
  // Render
  // =============================
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
              ระบบจัดการแจ้งซ่อม
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
                รายการแจ้งซ่อม
              </Typography>
            </Box>

            {/* ScrollBox สำหรับรายการแจ้งซ่อม (แสดงเป็นกล่องแต่ละรายการ) */}
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
                repairs.map((repair) => (
                  <Paper
                    key={repair.repair_id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 1,
                      backgroundColor: "#F5F5DC",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      ห้อง: {repair.room_number || "ไม่มีข้อมูล"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      คำอธิบาย: {repair.description}
                    </Typography>
                    <Typography
                      sx={{
                        borderLeft: "6px solid",
                        borderColor:
                          repair.status === "รอรับเรื่อง"
                            ? "#ffeb3b"
                            : repair.status === "กำลังดำเนินการ"
                            ? "#64b5f6"
                            : repair.status === "เสร็จสิ้น"
                            ? "#81c784"
                            : "gray",
                        pl: 2,
                        mb: 1,
                      }}
                    >
                      สถานะ: {repair.status}
                    </Typography>

                    {/* created_at */}
                    <Typography>
                      วันที่แจ้ง:
                      {new Date(repair.created_at).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                        timeZone: "Asia/Bangkok",
                      })}
                    </Typography>

                    <Box sx={{ textAlign: "right" }}>
                      <Tooltip title="แก้ไข">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(repair)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteRepair(repair.repair_id)}
                        >
                          <DeleteIcon />
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

      {/* Dialog: เพิ่ม/แก้ไข แจ้งซ่อม */}
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
          {isEditing ? "อัปเดตสถานะการแจ้งซ่อม" : "แจ้งซ่อมใหม่"}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: "#fff", px: 3, pb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            กรุณาเลือกสถานะ:
          </Typography>
          <Select
            name="status"
            fullWidth
            value={formData.status || ""}
            onChange={handleChange}
            sx={{ mt: 1, mb: 2, borderRadius: "8px" }}
          >
            <MenuItem value="pending">รอรับเรื่อง</MenuItem>
            <MenuItem value="in progress">กำลังดำเนินการ</MenuItem>
            <MenuItem value="complete">เสร็จสิ้น</MenuItem>
          </Select>
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
            onClick={handleUpdateRepair}
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

export default RepairPage;
