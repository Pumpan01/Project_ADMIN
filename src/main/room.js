import React, { useState, useEffect, useCallback } from "react";
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
  CircularProgress,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import Swal from "sweetalert2";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    room_id: "",
    room_number: "",
    rent: "",
    description: "",
    status: "available",
  });

  const navigate = useNavigate();

  // ฟังก์ชันปิด Dialog
  const handleCloseDialog = () => setOpenDialog(false);

  // ใช้ useCallback เพื่อห่อหุ้ม fetchRooms
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/rooms");
      if (!response.ok) throw new Error("Fetch Error");
      const data = await response.json();
      setRooms(data.sort((a, b) => a.room_number - b.room_number));
    } catch (error) {
      handleCloseDialog(); // ปิด popup ก่อนแสดง alert
      Swal.fire({ icon: "error", title: "ไม่สามารถโหลดข้อมูลห้องได้" });
    } finally {
      setLoading(false);
    }
  }, []); // ขึ้นอยู่กับสิ่งที่ fetchRooms ใช้งาน (ในที่นี้ไม่มี dependency)

  // เรียก fetchRooms เมื่อ Component mount
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ฟังก์ชันเปิด Dialog สำหรับเพิ่ม/แก้ไขห้อง
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
        room_id: "",
        room_number: "",
        rent: "",
        description: "",
        status: "available",
      });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  // ฟังก์ชันสำหรับบันทึกข้อมูลห้อง (เพิ่ม/แก้ไข)
  const handleSaveRoom = async () => {
    if (!formData.room_number || !formData.rent) {
      handleCloseDialog();
      return Swal.fire({
        icon: "error",
        title: "กรุณากรอกหมายเลขห้องและค่าเช่า",
      });
    }
    try {
      const url = isEditing
        ? `http://localhost:4000/api/rooms/${formData.room_id}`
        : "http://localhost:4000/api/rooms";
      const payload = {
        room_number: parseInt(formData.room_number, 10),
        rent: parseInt(formData.rent, 10),
        description: formData.description || "",
        status: formData.status,
      };

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        handleCloseDialog();
        throw new Error(result.error || "เกิดข้อผิดพลาด");
      }
      handleCloseDialog();
      Swal.fire({
        icon: "success",
        title: isEditing ? "แก้ไขสำเร็จ" : "เพิ่มห้องสำเร็จ",
      });
      fetchRooms();
    } catch (error) {
      handleCloseDialog();
      Swal.fire({ icon: "error", title: error.message || "เกิดข้อผิดพลาด" });
    }
  };

  // ฟังก์ชันสำหรับลบห้อง
  const handleDeleteRoom = async (room_id) => {
    try {
      handleCloseDialog();
      const confirmResult = await Swal.fire({
        icon: "warning",
        title: "คุณแน่ใจหรือไม่?",
        text: "จะลบห้องนี้ออกจากระบบ",
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบเลย",
      });
      if (confirmResult.isConfirmed) {
        const response = await fetch(
          `http://localhost:4000/api/rooms/${room_id}`,
          {
            method: "DELETE",
          }
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "เกิดข้อผิดพลาด");
        }
        Swal.fire({ icon: "success", title: "ลบห้องสำเร็จ" });
        fetchRooms();
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: error.message || "เกิดข้อผิดพลาด" });
    }
  };

  return (
    <Box>
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
            เพิ่มห้องผู้พัก
          </Button>
        </Box>

        <TableContainer
          component={Paper}
          elevation={6}
          sx={{ borderRadius: 2 }}
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
                  <TableCell sx={{ textAlign: "center" }}>
                    หมายเลขห้อง
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    ราคาเช่า (บาท)
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>สถานะ</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>การกระทำ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.room_id}>
                    <TableCell sx={{ textAlign: "center" }}>
                      {room.room_number}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {room.rent}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {room.status === "available" ? "ห้องว่าง" : "มีคนเช่า"}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Tooltip title="แก้ไข">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(room)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบ">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteRoom(room.room_id)}
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
            {isEditing ? "แก้ไขข้อมูลห้อง" : "เพิ่มห้องใหม่"}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#fff", p: 3 }}>
            <TextField
              label="หมายเลขห้อง"
              name="room_number"
              fullWidth
              margin="normal"
              value={formData.room_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  room_number: e.target.value,
                }))
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="ราคาเช่า (บาท)"
              name="rent"
              fullWidth
              margin="normal"
              value={formData.rent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, rent: e.target.value }))
              }
              type="number"
              inputProps={{ step: 1, max: 9999 }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <TextField
              label="คำอธิบาย"
              name="description"
              fullWidth
              margin="normal"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>สถานะ</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                label="สถานะ"
              >
                <MenuItem value="available">ห้องว่าง</MenuItem>
                <MenuItem value="occupied">มีคนเช่า</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: "space-between",
              backgroundColor: "#fff",
              p: 2,
            }}
          >
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderColor: "#ff6600",
                color: "#ff6600",
                textTransform: "none",
                "&:hover": { borderColor: "#ff6600" },
              }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveRoom}
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
    </Box>
  );
}

export default Rooms;
