import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  CircularProgress,
  Box,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Swal from "sweetalert2";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

function UserManagement() {
  const navigate = useNavigate();

  // ==============================
  // 1) State สำหรับการแสดงผล
  // ==============================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==============================
  // 2) State สำหรับ Rooms ที่ว่าง
  // ==============================
  const [availableRooms, setAvailableRooms] = useState([]);

  // ==============================
  // 3) State สำหรับ Dialog + ฟอร์ม
  // ==============================
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ฟอร์มข้อมูลผู้ใช้
  const [formData, setFormData] = useState({
    user_id: null,
    username: "",
    password: "",
    full_name: "",
    phone_number: "",
    line_id: "",
    role: "",
    room_number: null, // เก็บเป็นตัวเลข (หรือ null) สำหรับห้อง
  });

  // ==============================
  // 4) ฟังก์ชันดึงข้อมูลผู้ใช้
  // ==============================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/users");
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

  // ==============================
  // 5) ฟังก์ชันดึง "ห้องที่ว่าง"
  // ==============================
  const fetchAvailableRooms = async () => {
    try {
      const res = await fetch(
        "http://localhost:4000/api/rooms-by-status?status=available"
      );
      const rooms = await res.json();
      setAvailableRooms(rooms || []);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
    }
  };

  // ดึง users + rooms เมื่อ Component mount
  useEffect(() => {
    fetchUsers();
    fetchAvailableRooms();
  }, []);

  // ==============================
  // ฟังก์ชันแจ้งเตือน (Swal)
  // ==============================
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

  // ==============================
  // 6) เปิด/ปิด Dialog + ฟอร์ม
  // ==============================
  const handleOpenDialog = (user = null) => {
    if (user) {
      // กรณีแก้ไข
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
      // เพิ่มใหม่
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

  // เมื่อ input เปลี่ยนค่า
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==============================
  // 7) บันทึกผู้ใช้ (Create/Update)
  // ==============================
  const handleSaveUser = async () => {
    if (!formData.username) {
      showSwalError("โปรดระบุชื่อผู้ใช้งาน");
      return;
    }
    if (!formData.role) {
      showSwalError("โปรดเลือกบทบาท");
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
      ? `http://localhost:4000/api/users/${formData.user_id}`
      : "http://localhost:4000/api/register";
    const method = isEditing ? "PUT" : "POST";

    // Clone payload
    const payload = { ...formData };
    // หากเป็นกรณีแก้ไขแต่ไม่เปลี่ยนรหัสผ่าน ให้ลบ password ออกจาก payload
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
          } else {
            showSwalError(
              result.error || "ไม่สามารถบันทึกข้อมูลได้",
              "ข้อผิดพลาด [400]"
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

  // ==============================
  // 8) ลบผู้ใช้
  // ==============================
  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "โปรดยืนยัน",
      text: `ผู้ใช้งาน ${userId} จะถูกลบถาวรและไม่สามารถกู้คืนได้`,
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
          `http://localhost:4000/api/users/${userId}`,
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

  // ==============================
  // ส่วนแสดงผล (JSX)
  // ==============================
  return (
    <>
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{
              background: "linear-gradient(45deg, #ff6600, #ff6600)",
              "&:hover": {
                background: "linear-gradient(45deg, #ff6600, #ff6600)",
              },
            }}
            onClick={() => navigate(-1)}
          >
            กลับสู่หน้าหลัก
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: "linear-gradient(45deg, #ff6600, #ff6600)",
              "&:hover": {
                background: "linear-gradient(45deg, #ff6600, #ff6600)",
              },
            }}
            onClick={() => handleOpenDialog()}
          >
            เพิ่มข้อมูลผู้ใช้งาน
          </Button>
        </Box>

        {/* ตารางแสดงผู้ใช้ */}
        <TableContainer
          component={Paper}
          elevation={6}
          sx={{ borderRadius: 2, overflowX: "auto" }}
        >
          {loading ? (
            <CircularProgress sx={{ display: "block", margin: "20px auto" }} />
          ) : (
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#ff6600",
                  "& th": {
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  },
                }}
              >
                <TableRow>
                  <TableCell>ชื่อผู้ใช้</TableCell>
                  <TableCell>ชื่อเต็ม</TableCell>
                  <TableCell>เบอร์โทร</TableCell>
                  <TableCell>ไลน์ไอดี</TableCell>
                  <TableCell>ห้องที่พัก</TableCell>
                  <TableCell>ยศ</TableCell>
                  <TableCell align="right">จัดการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.user_id}
                    sx={{
                      "&:hover": { backgroundColor: "#ffe0b2" },
                      transition: "0.3s",
                      "& td": { textAlign: "center" },
                    }}
                  >
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.full_name || "-"}</TableCell>
                    <TableCell>{user.phone_number || "-"}</TableCell>
                    <TableCell>{user.line_id || "-"}</TableCell>
                    <TableCell>
                      {user.room_number
                        ? `ห้อง ${user.room_number}`
                        : "ไม่มีห้อง"}
                    </TableCell>
                    <TableCell>{user.role || "-"}</TableCell>
                    <TableCell align="right">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* Dialog: เพิ่ม/แก้ไขข้อมูลผู้ใช้งาน */}
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
              bgcolor: "#ff6600",
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
            sx={{
              justifyContent: "center",
              p: 2,
              backgroundColor: "#fff",
            }}
          >
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderColor: "#ff6600",
                color: "#ff6600",
                textTransform: "none",
                mr: 2,
                "&:hover": { borderColor: "#ff6600" },
              }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveUser}
              variant="contained"
              sx={{
                backgroundColor: "#ff6600",
                textTransform: "none",
                "&:hover": { backgroundColor: "#e65c00" },
              }}
            >
              บันทึก
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

export default UserManagement;
