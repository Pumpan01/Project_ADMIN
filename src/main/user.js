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

function UserManagement() {
  const navigate = useNavigate();

  // State สำหรับการแสดงผล
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State สำหรับ Rooms ที่ว่าง
  const [availableRooms, setAvailableRooms] = useState([]);

  // State สำหรับ Dialog + ฟอร์ม
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    user_id: null,
    username: "",
    password: "",
    full_name: "",
    phone_number: "",
    line_id: "",
    role: "",
    room_number: null,
  });

  // State สำหรับ Sidebar
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

  // ฟังก์ชันดึงข้อมูลผู้ใช้
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://api.horplus.work/api/users");
      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันดึง "ห้องที่ว่าง"
  const fetchAvailableRooms = async () => {
    try {
      const res = await fetch(
        "https://api.horplus.work/api/rooms-by-status?status=available"
      );
      const rooms = await res.json();
      setAvailableRooms(rooms || []);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAvailableRooms();
  }, []);

  // ฟังก์ชันแจ้งเตือน (Swal)
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

  // เปิด/ปิด Dialog + ฟอร์ม
  const handleOpenDialog = (user = null) => {
    if (user) {
      setFormData({
        user_id: user.user_id,
        username: user.username,
        password: "",
        full_name: user.full_name || "",
        phone_number: user.phone_number || "",
        line_id: user.line_id || "",
        role: user.role || "",
        room_number: user.room_number || null,
      });
      setIsEditing(true);
    } else {
      setFormData({
        user_id: null,
        username: "",
        password: "",
        full_name: "",
        phone_number: "",
        line_id: "",
        role: "",
        room_number: null,
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

  // บันทึกผู้ใช้ (Create/Update)
  const handleSaveUser = async () => {
    if (!formData.username) {
      showSwalError("โปรดระบุชื่อผู้ใช้งาน");
      return;
    }
    if (!formData.role) {
      showSwalError("โปรดเลือกบทบาท");
      return;
    }
    if (
      formData.role === "user" &&
      (!formData.room_number || formData.room_number === "")
    ) {
      showSwalError(
        "โปรดเลือกห้องที่พักสำหรับผู้ใช้งาน",
        "ห้องที่พักไม่ถูกเลือก"
      );
      return;
    }
    if (!isEditing && !formData.password) {
      showSwalError("โปรดระบุรหัสผ่าน");
      return;
    }
    if (formData.password && formData.password.length < 6) {
      showSwalError(
        "โปรดตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร",
        "รหัสผ่านไม่เพียงพอ"
      );
      return;
    }

    const url = isEditing
      ? `https://api.horplus.work/api/users/${formData.user_id}`
      : "https://api.horplus.work/api/register";
    const method = isEditing ? "PUT" : "POST";
    const payload = { ...formData };
    if (isEditing && !payload.password) {
      delete payload.password;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          if (result.error && result.error.includes("username")) {
            showSwalError("โปรดเปลี่ยนชื่อผู้ใช้งาน", "ชื่อผู้ใช้งานซ้ำ");
          } else if (
            result.error &&
            result.error.toLowerCase().includes("room")
          ) {
            showSwalError(
              "ข้อมูลห้องไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
              "ห้องไม่ถูกต้อง"
            );
          } else {
            showSwalError(
              result.error || "ไม่สามารถบันทึกข้อมูลได้",
              "ข้อผิดพลาด"
            );
          }
        } else if (response.status === 404) {
          showSwalError(
            result.error || "ไม่พบข้อมูลที่ต้องการแก้ไข",
            "ไม่พบข้อมูล [404]"
          );
        } else if (response.status === 500) {
          showSwalError(
            result.error || "ไม่สามารถติดต่อเซิร์ฟเวอร์ได้",
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
        result.message || "บันทึกข้อมูลเรียบร้อยแล้ว",
        isEditing ? "การแก้ไขข้อมูลสำเร็จ" : "การเพิ่มข้อมูลสำเร็จ"
      ).then(() => {
        setOpenDialog(false);
        fetchUsers();
      });
    } catch (error) {
      console.error("Fetch error:", error);
      showSwalError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  };

  // ลบผู้ใช้
  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "โปรดยืนยัน",
      text: `ผู้ใช้งานจะถูกลบถาวรและไม่สามารถกู้คืนได้`,
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
          `https://api.horplus.work/api/users/${userId}`,
          {
            method: "DELETE",
          }
        );
        const data = await response.json();
        if (!response.ok) {
          switch (response.status) {
            case 404:
              showSwalError(
                data.msg || data.error || "ไม่พบข้อมูลผู้ใช้งานที่ต้องการลบ",
                "ไม่พบข้อมูล [404]"
              );
              break;
            case 500:
              showSwalError(
                data.error || "เกิดข้อผิดพลาดในการลบผู้ใช้งาน",
                "เซิร์ฟเวอร์มีปัญหา [500]"
              );
              break;
            default:
              showSwalError(
                data.error || "ไม่สามารถลบผู้ใช้งานได้",
                `Error [${response.status}]`
              );
              break;
          }
          return;
        }
        showSwalSuccess(
          data.message || "ข้อมูลผู้ใช้งานถูกลบเรียบร้อยแล้ว",
          "การลบข้อมูลสำเร็จ"
        ).then(() => {
          fetchUsers();
        });
      } catch (error) {
        console.error("Error deleting user:", error);
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
              ระบบจัดการผู้ใช้
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

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            pt: 20,
            p: { xs: 1, sm: 2 },
            pb: 5,
          }}
        >
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
            {/* Header: "รายการผู้ใช้" กับปุ่ม "เพิ่มข้อมูลผู้ใช้งาน" */}
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
                รายการผู้ใช้
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
                เพิ่มข้อมูลผู้ใช้งาน
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
              // Scrollable Box สำหรับรายการผู้ใช้ (ตั้ง overflowY ให้ auto และ overflowX ให้ auto เพื่อให้เลื่อนในแนวตั้งและแนวนอนได้)
              <Box
                sx={{
                  height: "700px",
                  overflowY: "auto",
                  overflowX: "auto",
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {users.map((user) => (
                  <Paper
                    key={user.user_id}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: "#F5F5DC",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: "bold" }}>
                      User: {user.username}
                    </Typography>
                    <Typography>ชื่อเต็ม: {user.full_name || "-"}</Typography>
                    <Typography>
                      เบอร์โทร: {user.phone_number || "-"}
                    </Typography>
                    <Typography>ห้อง: {user.room_number || "-"}</Typography>
                    <Typography>สิทธิ์: {user.role || "-"}</Typography>

                    <Box sx={{ textAlign: "right", mt: 1 }}>
                      <Tooltip title="แก้ไขข้อมูล">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบผู้ใช้งาน">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteUser(user.user_id)}
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

        {/* Dialog สำหรับเพิ่ม/แก้ไขข้อมูลผู้ใช้งาน */}
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
            {isEditing ? "แก้ไขข้อมูลผู้ใช้งาน" : "เพิ่มข้อมูลผู้ใช้งาน"}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff", p: 3 }}>
            <TextField
              label="ชื่อผู้ใช้งาน"
              name="username"
              fullWidth
              margin="normal"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              label="รหัสผ่าน"
              type="password"
              name="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isEditing ? "เว้นว่างหากไม่ต้องการเปลี่ยนรหัสผ่าน" : ""
              }
            />
            <TextField
              label="ชื่อเต็ม"
              name="full_name"
              fullWidth
              margin="normal"
              value={formData.full_name}
              onChange={handleChange}
            />
            <TextField
              label="เบอร์โทร"
              name="phone_number"
              fullWidth
              margin="normal"
              value={formData.phone_number}
              onChange={handleChange}
            />
            <TextField
              label="ไลน์ไอดี"
              name="line_id"
              fullWidth
              margin="normal"
              value={formData.line_id}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="role-label">บทบาท</InputLabel>
              <Select
                labelId="role-label"
                label="บทบาท"
                name="role"
                value={formData.role !== null ? formData.role : ""}
                onChange={handleChange}
              >
                <MenuItem value="">ไม่มีบทบาท</MenuItem>
                <MenuItem value="user">สมาชิก</MenuItem>
                <MenuItem value="admin">ผู้ดูแลระบบ</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="room-label">เลือกห้อง</InputLabel>
              <Select
                labelId="room-label"
                label="เลือกห้อง"
                name="room_number"
                value={
                  formData.room_number !== null ? formData.room_number : ""
                }
                onChange={handleChange}
              >
                <MenuItem value="">ไม่มีห้อง</MenuItem>
                {availableRooms.map((room) => (
                  <MenuItem key={room.room_number} value={room.room_number}>
                    ห้อง {room.room_number}
                  </MenuItem>
                ))}
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
              onClick={handleSaveUser}
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

export default UserManagement;
