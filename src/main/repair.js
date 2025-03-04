import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid,
  AppBar,
  Toolbar,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import GroupIcon from "@mui/icons-material/Group";
import MenuIcon from "@mui/icons-material/Menu";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function RepairPage() {
  // =============================
  // State
  // =============================
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    repair_id: "",
    status: "pending",
  });
  const [isEditing, setIsEditing] = useState(false);

  // Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // =============================
  // Fetch Repairs
  // =============================
  const fetchRepairs = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/repairs");
      if (!response.ok) {
        Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
        return;
      }
      const data = await response.json();
      setRepairs(data || []);
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
  // Handle Form
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
  // Update Repair
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
    handleCloseDialog();

    try {
      const response = await fetch(
        `http://localhost:4000/api/repairs/${formData.repair_id}`,
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
  // Delete Repair
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
          `http://localhost:4000/api/repairs/${repair_id}`,
          {
            method: "DELETE",
          }
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
  // Render
  // =============================
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      ></Box>
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

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <TableContainer component={Paper} elevation={6}>
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
                <TableCell align="center">รหัสห้อง</TableCell>
                <TableCell align="center">คำอธิบาย</TableCell>
                <TableCell align="center">สถานะ</TableCell>
                <TableCell align="center">วันที่แจ้ง</TableCell>
                <TableCell align="center">การกระทำ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repairs.map((repair) => (
                <TableRow key={repair.repair_id}>
                  <TableCell align="center">
                    {repair.room_number || "ไม่มีข้อมูล"}
                  </TableCell>
                  <TableCell align="center">{repair.description}</TableCell>
                  <TableCell
                    align="center"
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
                      paddingLeft: 2,
                    }}
                  >
                    {repair.status}
                  </TableCell>
                  <TableCell align="center">
                    {new Date(repair.repair_date).toLocaleString("th-TH")}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="แก้ไข">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(repair)}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Grid>
  </Grid>
</Container>


        {/* Dialog แก้ไขสถานะการแจ้งซ่อม */}
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
                borderColor: "#ff6600",
                color: "#ff6600",
                textTransform: "none",
                "&:hover": { borderColor: "#ff6600" },
              }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleUpdateRepair}
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

export default RepairPage;
