import React, { useState, useEffect, useCallback } from "react";
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
  FormControl,
  IconButton,
  InputLabel,
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
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BuildIcon from "@mui/icons-material/Build";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { useNavigate } from "react-router-dom";

function Rooms() {
  const navigate = useNavigate();

  // 1) State สำหรับแสดงผล
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2) State สำหรับ Dialog + ฟอร์ม
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    room_id: null,
    room_number: "",
    rent: "",
    description: "",
    status: "available",
  });

  // 3) State สำหรับ Sidebar
  const [drawerOpen, setDrawerOpen] = useState(false);

  // เมนูสำหรับ Sidebar
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

  // 4) ฟังก์ชันดึงข้อมูลห้อง
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.horplus.work/api/rooms");
      if (!response.ok) throw new Error("Fetch Error");
      const data = await response.json();
      // เรียงลำดับห้องตามหมายเลขห้อง
      setRooms(data.sort((a, b) => a.room_number - b.room_number));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลห้องได้",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // 5) ฟังก์ชันแจ้งเตือน (Swal)
  const showSwalError = (text, title = "เกิดข้อผิดพลาด") => {
    Swal.fire({
      icon: "error",
      title,
      text,
      didOpen: (popup) => {
        popup.parentNode.style.zIndex = 99999;
      },
    });
  };

  const showSwalSuccess = (text, title = "สำเร็จ") => {
    return Swal.fire({
      icon: "success",
      title,
      text,
      didOpen: (popup) => {
        popup.parentNode.style.zIndex = 99999;
      },
    });
  };

  // 6) เปิด/ปิด Dialog + ฟอร์ม
  const handleOpenDialog = (room = null) => {
    if (room) {
      setFormData({
        room_id: room.room_id,
        room_number: room.room_number.toString(),
        rent: room.rent.toString(),
        description: room.description || "",
        status: room.status || "available",
      });
      setIsEditing(true);
    } else {
      setFormData({
        room_id: null,
        room_number: "",
        rent: "",
        description: "",
        status: "available",
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 7) บันทึกห้อง (Create/Update)
  const handleSaveRoom = async () => {
    if (!formData.room_number || !formData.rent) {
      showSwalError("กรุณากรอกหมายเลขห้องและราคาเช่า");
      return;
    }

    const url = isEditing
      ? `https://api.horplus.work/api/rooms/${formData.room_id}`
      : "https://api.horplus.work/api/rooms";
    const method = isEditing ? "PUT" : "POST";
    const payload = {
      room_number: parseInt(formData.room_number, 10),
      rent: parseInt(formData.rent, 10),
      description: formData.description || "",
      status: formData.status,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          showSwalError(
            result.error || "ไม่สามารถบันทึกข้อมูลได้",
            "ข้อผิดพลาด [400]"
          );
        } else if (response.status === 404) {
          showSwalError(
            result.error || "ไม่พบข้อมูลที่ต้องการแก้ไข",
            "ไม่พบข้อมูล [404]"
          );
        } else if (response.status === 500) {
          showSwalError(
            result.error || "เซิร์ฟเวอร์มีปัญหา",
            "เซิร์ฟเวอร์มีปัญหา [500]"
          );
        } else {
          showSwalError(
            result.error || "ไม่สามารถบันทึกข้อมูลได้",
            `Error [${response.status}]`
          );
        }
        return;
      }

      showSwalSuccess(
        result.message ||
          (isEditing ? "แก้ไขข้อมูลห้องสำเร็จ" : "เพิ่มห้องสำเร็จ")
      ).then(() => {
        setOpenDialog(false);
        fetchRooms();
      });
    } catch (error) {
      console.error("Fetch error:", error);
      showSwalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // 8) ลบห้อง
  const handleDeleteRoom = async (roomId) => {
    Swal.fire({
      title: "โปรดยืนยัน",
      text: `ห้องหมายเลข ${roomId} จะถูกลบถาวรและไม่สามารถกู้คืนได้`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
      didOpen: (popup) => {
        popup.parentNode.style.zIndex = 99999;
      },
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        const response = await fetch(
          `https://api.horplus.work/api/rooms/${roomId}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          showSwalError(
            data.error || "ไม่สามารถลบห้องได้",
            `Error [${response.status}]`
          );
          return;
        }
        showSwalSuccess(
          data.message || "ลบห้องสำเร็จ",
          "การลบข้อมูลสำเร็จ"
        ).then(() => {
          fetchRooms();
        });
      } catch (error) {
        console.error("Error deleting room:", error);
        showSwalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้", "เกิดข้อผิดพลาด");
      }
    });
  };

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
              ระบบจัดการห้องพัก
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
            // ทำให้ส่วน Main Content เลื่อนในแนวตั้งได้ หากมีข้อมูลเยอะ
            overflowY: "auto",
          }}
        >
          {/* Spacer เพื่อไม่ให้เนื้อหาถูก AppBar ทับ */}
          <Toolbar sx={{ minHeight: 120 }} />

          {/* Container สำหรับเนื้อหาหลัก (พื้นหลังสีขาว) */}
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
            {/* Header: "รายการห้องพัก" กับปุ่ม "เพิ่มห้องพัก" */}
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
                รายการห้องพัก
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
                เพิ่มห้องพัก
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
              // Scrollable Box สำหรับรายการห้องพัก
              <Box
                sx={{
                  maxHeight: "700px",
                  overflowY: "auto",
                  overflowX: "auto",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {rooms.map((room) => (
                  <Paper
                    key={room.room_id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: "#F5F5DC",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      ห้อง: {room.room_number}
                    </Typography>
                    <Typography>ราคาเช่า: {room.rent} บาท</Typography>
                    <Typography>
                      สถานะ:{" "}
                      {room.status === "available" ? "ห้องว่าง" : "มีผู้เช่า"}
                    </Typography>
                    <Typography>คำอธิบาย: {room.description || "-"}</Typography>
                    <Box sx={{ textAlign: "right", mt: 1 }}>
                      <Tooltip title="แก้ไขข้อมูล">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(room)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบห้อง">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteRoom(room.room_id)}
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

        {/* Dialog สำหรับเพิ่ม/แก้ไขข้อมูลห้อง */}
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
            {isEditing ? "แก้ไขข้อมูลห้อง" : "เพิ่มข้อมูลห้อง"}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff", p: 3 }}>
            <TextField
              label="หมายเลขห้อง"
              name="room_number"
              fullWidth
              margin="normal"
              value={formData.room_number}
              onChange={handleChange}
            />
            <TextField
              label="ราคาเช่า (บาท)"
              name="rent"
              fullWidth
              margin="normal"
              value={formData.rent}
              onChange={handleChange}
              type="number"
            />
            <TextField
              label="คำอธิบาย"
              name="description"
              fullWidth
              margin="normal"
              value={formData.description}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">สถานะ</InputLabel>
              <Select
                labelId="status-label"
                label="สถานะ"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="available">ห้องว่าง</MenuItem>
                <MenuItem value="occupied">มีผู้เช่า</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions
            sx={{ justifyContent: "center", p: 2, backgroundColor: "#fff" }}
          >
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderColor: "#E07B39",
                color: "#E07B39",
                textTransform: "none",
                mr: 2,
                "&:hover": { borderColor: "#E07B39" },
              }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveRoom}
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
      </Box>
    </>
  );
}

export default Rooms;
