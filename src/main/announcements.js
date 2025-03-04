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
  CircularProgress,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Swal from "sweetalert2";

function Announcements() {
  // =============================
  // State
  // =============================
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    announcement_id: "",
    title: "",
    detail: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // =============================
  // Fetch Announcements
  // =============================
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/announcements");
      if (!response.ok) {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
        return;
      }
      const data = await response.json();
      // เรียงจากใหม่ -> เก่า
      const sorted = data.sort((a, b) => b.announcement_id - a.announcement_id);
      setAnnouncements(sorted);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // =============================
  // Form
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenDialog = (announcement = null) => {
    if (announcement) {
      setFormData(announcement);
      setIsEditing(true);
    } else {
      setFormData({ announcement_id: "", title: "", detail: "" });
      setIsEditing(false);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // =============================
  // Save Announcement
  // =============================
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
        ? `http://localhost:4000/api/announcements/${formData.announcement_id}`
        : "http://localhost:4000/api/announcements";
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

  // =============================
  // Delete Announcement
  // =============================
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
          `http://localhost:4000/api/announcements/${announcement_id}`,
          { method: "DELETE" }
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

  // =============================
  // Render
  // =============================
  return (
    <>
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
          ย้อนกลับไปยังหน้าหลัก
        </Button>
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(45deg, #ff6600, #ff6600)",
            "&:hover": {
              background: "linear-gradient(45deg, #ff6600, #ff6600)",
            },
          }}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มประกาศใหม่
        </Button>
      </Box>

      <Grid container justifyContent="center">
  <Grid item xs={12} md={10} lg={8}>
    <TableContainer component={Paper} elevation={6} sx={{ borderRadius: 2 }}>
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
              <TableCell align="center">หัวข้อ</TableCell>
              <TableCell align="center">รายละเอียด</TableCell>
              <TableCell align="right">การกระทำ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {announcements.map((announce) => (
              <TableRow key={announce.announcement_id}>
                <TableCell align="center">{announce.title}</TableCell>
                <TableCell align="center">{announce.detail}</TableCell>
                <TableCell align="right">
                  <Tooltip title="แก้ไขข้อมูล">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenDialog(announce)}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  </Grid>
</Grid>

      {/* Dialog เพิ่ม/แก้ไขประกาศ */}
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
              borderColor: "#ff6600",
              color: "#ff6600",
              textTransform: "none",
              "&:hover": { borderColor: "#ff6600" },
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSaveAnnouncement}
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
    </>
  );
}

export default Announcements;
