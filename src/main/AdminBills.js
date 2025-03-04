import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Grid,
  TableContainer,
  Button, // Import Button
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import MenuIcon from "@mui/icons-material/Menu";
import GroupIcon from "@mui/icons-material/Group";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import ArrowBackIcon
import AddIcon from "@mui/icons-material/Add"; // Import AddIcon

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function AdminBills() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sidebar (ถ้าต้องการใช้งาน)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // =============================
  // Fetch Users + total_unpaid_amount
  // =============================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/users");
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
  // ฟังก์ชันสำหรับเปิด Dialog เพิ่มข้อมูลบิล (ยังไม่ได้พัฒนา)
  // =============================
  const handleOpenDialog = () => {
    Swal.fire({
      icon: "info",
      title: "ฟังก์ชันยังไม่พร้อมใช้งาน",
      text: "โปรดรอการพัฒนาฟังก์ชันเพิ่มข้อมูลบิลในอนาคต",
    });
  };

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
          กลับสู่หน้าหลัก
        </Button>
        
      </Box>

      {/* Main Content */}
      <Container
        maxWidth="lg"
        sx={{
          mt: 5,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={12} md={10} lg={10}>
            <TableContainer
              component={Paper}
              elevation={6}
              sx={{ borderRadius: 2 }}
            >
              {loading ? (
                <CircularProgress
                  sx={{ display: "block", margin: "20px auto" }}
                />
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
                      <TableCell align="center">ห้อง</TableCell>
                      <TableCell align="center">ผู้ใช้</TableCell>
                      <TableCell align="center">
                        ยอดเงินรวม (ยังไม่ชำระ)
                      </TableCell>
                      <TableCell align="center">ดูบิลทั้งหมด</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      .filter((u) => u.role === "user")
                      .map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell align="center">
                            {user.room_number || "ไม่พบห้อง"}
                          </TableCell>
                          <TableCell align="center">
                            {user.username || "ไม่พบผู้ใช้"}
                          </TableCell>
                          <TableCell align="center">
                            {user.total_unpaid_amount
                              ? Number(user.total_unpaid_amount).toFixed(2)
                              : "0.00"}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => handleViewBills(user)}
                            >
                              <VisibilityIcon />
                            </IconButton>
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
    </>
  );
}

export default AdminBills;
