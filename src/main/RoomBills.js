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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import Swal from "sweetalert2";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function RoomBills() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user_id");
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialog สำหรับเพิ่ม/แก้ไขบิล
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBill, setCurrentBill] = useState({
    water_units: "",
    electricity_units: "",
    due_date: "",
    slip_path: "",
    meter: null,
  });

  // Dialog สำหรับดูตัวอย่างรูป (Preview)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Drawer (Sidebar)
  const [drawerOpen, setDrawerOpen] = useState(false);

  // =============================
  // เมนูสำหรับ Sidebar
  // =============================
  const menuItems = [
    { text: "Home", link: "/home" },
    { text: "ผู้ใช้", link: "/user" },
    { text: "ห้อง", link: "/rooms" },
    { text: "แจ้งซ่อม", link: "/repair" },
    { text: "ประกาศ", link: "/announcements" },
    { text: "บิล", link: "/admin/bills" },
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
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  // =============================
  // ฟังก์ชันแปลงวันที่ให้เป็นรูปแบบไทย
  // =============================
  const formatDate = (dateString) => {
    if (!dateString) return "ไม่ระบุ";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // =============================
  // ดึงข้อมูลบิลจากเซิร์ฟเวอร์
  // =============================
  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.horplus.work/api/bills/room-admin/${roomId}`
      );
      if (!response.ok) {
        // แสดงแจ้งเตือนว่าไม่มีบิล
        Swal.fire({
          title: "ไม่มีบิล",
          text: "ยังไม่มีบิลสำหรับห้องนี้",
          icon: "info",
          confirmButtonText: "ตกลง",
          timer: 2000,
          zIndex: 9999999,
        });
        return;
      }
      const data = await response.json();
      setBills(data);
    } catch (error) {
      // แสดงแจ้งเตือนกรณีเกิดข้อผิดพลาด
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
        zIndex: 9999999,
      });
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // =============================
  // ฟังก์ชันสำหรับเปิด/ปิด Dialog ดูรูป (Preview)
  // =============================
  const handlePreviewOpen = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setPreviewImage("");
  };

  // =============================
  // เปิด Dialog สำหรับเพิ่ม/แก้ไขบิล
  // =============================
  const handleOpenAddDialog = () => {
    setIsEditing(false);
    setCurrentBill({
      water_units: "",
      electricity_units: "",
      due_date: "",
      slip_path: "",
      meter: null,
    });
    setBillDialogOpen(true);
  };

  const handleOpenEditDialog = (bill) => {
    setIsEditing(true);
    setCurrentBill({ ...bill, meter: bill.meter || null });
    setBillDialogOpen(true);
  };

  const handleCloseBillDialog = () => {
    setBillDialogOpen(false);
    setCurrentBill({
      water_units: "",
      electricity_units: "",
      due_date: "",
      slip_path: "",
      meter: null,
    });
  };

  // =============================
  // จัดการเมื่อมีการเปลี่ยนแปลงใน Input
  // =============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentBill((prev) => ({ ...prev, [name]: value }));
  };

  // =============================
  // บันทึกข้อมูลบิล (เพิ่ม/แก้ไข)
  // =============================
  const handleSaveBill = async () => {
    try {
      // หากมี meter เป็น File ให้ทำการอัปโหลดก่อน
      if (currentBill.meter && currentBill.meter instanceof File) {
        const formData = new FormData();
        formData.append("image", currentBill.meter);

        const uploadResponse = await fetch(
          "https://api.horplus.work/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadResponse.ok) {
          throw new Error("การอัปโหลดภาพมิตเตอร์ไม่สำเร็จ");
        }

        const uploadData = await uploadResponse.json();
        currentBill.meter = uploadData.file.path;
      }

      // ปิด Dialog ก่อน เพื่อให้ SweetAlert2 ไม่ถูก Dialog บัง
      handleCloseBillDialog();

      if (isEditing) {
        // แก้ไขข้อมูลบิล
        const response = await fetch(
          `https://api.horplus.work/api/bills/${currentBill.bill_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentBill),
          }
        );
        if (!response.ok) throw new Error("โปรดกรอกข้อมูลให้ครบถ้วน");
        // แสดง SweetAlert2
        Swal.fire({
          icon: "success",
          title: "แก้ไขบิลสำเร็จ",
          text: "บิลได้รับการอัปเดตเรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
          zIndex: 9999999,
        });
      } else {
        // เพิ่มบิลใหม่
        const newBill = {
          user_id: userId,
          room_number: roomId,
          ...currentBill,
        };
        const response = await fetch("https://api.horplus.work/api/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBill),
        });
        if (!response.ok) throw new Error("ไม่สามารถเพิ่มบิลได้");
        // แสดง SweetAlert2
        Swal.fire({
          icon: "success",
          title: "การเพิ่มข้อมูลบิลเสร็จสมบูรณ์",
          text: "บิลใหม่ถูกเพิ่มเรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
          zIndex: 9999999,
        });
      }

      // อัปเดตข้อมูลบิล
      fetchBills();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        zIndex: 9999999,
      });
    }
  };

  // =============================
  // ลบบิล
  // =============================
  const handleDeleteBill = async (bill) => {
    const result = await Swal.fire({
      title: "โปรดยืนยันการลบ",
      text: "บิลนี้จะถูกลบถาวรและไม่สามารถกู้คืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "โปรดยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
      zIndex: 9999999,
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `https://api.horplus.work/api/bills/${bill.bill_id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("ไม่สามารถลบบิลได้");
      Swal.fire({
        icon: "success",
        title: "การลบบิลเสร็จสมบูรณ์",
        text: "บิลถูกลบเรียบร้อยแล้ว",
        timer: 2000,
        showConfirmButton: false,
        zIndex: 9999999,
      });
      fetchBills();
    } catch (error) {
      console.error("Error deleting bill:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการลบบิล",
        zIndex: 9999999,
      });
    }
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
          {/* Spacer เพื่อไม่ให้เนื้อหาถูก AppBar ทับ */}
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
            {/* Header: "รายการบิล" และปุ่ม "เพิ่มข้อมูลบิล" อยู่ในบรรทัดเดียวกัน */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
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
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  background: "linear-gradient(45deg, #E07B39, #E07B39)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #E07B39, #E07B39)",
                  },
                }}
                onClick={handleOpenAddDialog}
              >
                เพิ่มข้อมูลบิล
              </Button>
            </Box>

            {/* ScrollBox สำหรับรายการบิล */}
            <Box
              sx={{
                maxHeight: "700px",
                overflowY: "auto",
                border: "1px solid #ccc",
                borderRadius: 1,
                p: 2,
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
                bills.map((bill) => (
                  <Paper
                    key={bill.bill_id}
                    sx={{
                      p: 2,
                      mb: 3,
                      borderRadius: 1,
                      backgroundColor: "#F5F5DC",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Typography sx={{ mb: 1 }}>
                      ห้อง: {bill.room_number || "ไม่พบห้อง"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      ผู้ใช้: {bill.username || "ไม่พบผู้ใช้"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      ค่าน้ำ (หน่วย): {bill.water_units}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      ค่าไฟ (หน่วย): {bill.electricity_units}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      ยอดเงิน:{" "}
                      {bill.total_amount
                        ? Number(bill.total_amount).toFixed(2)
                        : "0.00"}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      วันที่ครบกำหนด:{" "}
                      {bill.due_date ? formatDate(bill.due_date) : "ไม่ระบุ"}
                    </Typography>
                    {/* ปุ่มดูสลิป และดูรูปมิตเตอร์ */}
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      {bill.slip_path && (
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handlePreviewOpen(
                              `https://api.horplus.work/${bill.slip_path}`
                            )
                          }
                        >
                          ดูสลิป
                        </Button>
                      )}
                      {bill.meter && (
                        <Button
                          variant="outlined"
                          onClick={() =>
                            handlePreviewOpen(
                              `https://api.horplus.work/${bill.meter}`
                            )
                          }
                        >
                          ดูรูปมิตเตอร์
                        </Button>
                      )}
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Tooltip title="แก้ไขบิล">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenEditDialog(bill)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="ลบบิล">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteBill(bill)}
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

      {/* Dialog: เพิ่ม/แก้ไขบิล */}
      <Dialog
        open={billDialogOpen}
        onClose={handleCloseBillDialog}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiPaper-root": { borderRadius: "15px", padding: "20px" } }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#E07B39",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.5rem",
          }}
        >
          {isEditing ? "แก้ไขบิล" : "เพิ่มข้อมูลบิลใหม่"}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ภาพมิตเตอร์
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{
                background: "linear-gradient(135deg, #E07B39 0%, #E07B39 100%)",
                color: "white",
                borderRadius: "20px",
                paddingX: 3,
                paddingY: 1.2,
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #E07B39 0%, #E07B39 100%)",
                },
              }}
            >
              เลือกไฟล์ภาพ
              <input
                type="file"
                name="meter"
                accept="image/*"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setCurrentBill((prev) => ({
                      ...prev,
                      meter: e.target.files[0],
                    }));
                  }
                }}
              />
            </Button>
            {currentBill.meter && (
              <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
                <img
                  src={
                    currentBill.meter instanceof File
                      ? URL.createObjectURL(currentBill.meter)
                      : `https://api.horplus.work/${currentBill.meter}`
                  }
                  alt="Meter Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 200,
                    borderRadius: "10px",
                  }}
                />
              </Box>
            )}
          </Box>
          <TextField
            margin="dense"
            label="ค่าน้ำ (หน่วย)"
            name="water_units"
            type="number"
            fullWidth
            value={currentBill.water_units}
            onChange={handleInputChange}
            sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <TextField
            margin="dense"
            label="ค่าไฟ (หน่วย)"
            name="electricity_units"
            type="number"
            fullWidth
            value={currentBill.electricity_units}
            onChange={handleInputChange}
            sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
          <TextField
            margin="dense"
            label="วันที่ครบกำหนด"
            name="due_date"
            type="date"
            fullWidth
            value={currentBill.due_date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mt: 2, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          />
        </DialogContent>
        <DialogActions
          sx={{ justifyContent: "space-between", padding: "16px" }}
        >
          <Button
            onClick={handleCloseBillDialog}
            sx={{
              bgcolor: "#bdbdbd",
              color: "black",
              borderRadius: "20px",
              textTransform: "none",
              paddingX: 3,
              "&:hover": { bgcolor: "#9e9e9e" },
            }}
          >
            ยกเลิก
          </Button>
          <Button
            onClick={handleSaveBill}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #E07B39 0%, #E07B39 100%)",
              color: "white",
              borderRadius: "20px",
              paddingX: 3,
              paddingY: 1.2,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #E07B39 0%, #E07B39 100%)",
              },
            }}
          >
            บันทึก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog แสดงตัวอย่างรูป (Preview) */}
      <Dialog
        open={previewOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
        sx={{ "& .MuiPaper-root": { borderRadius: "15px", padding: "16px" } }}
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 2,
            }}
          >
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", padding: "12px" }}>
          <Button
            onClick={handlePreviewClose}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #E07B39 0%, #E07B39 100%)",
              color: "white",
              borderRadius: "20px",
              paddingX: 4,
              paddingY: 1.2,
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(135deg, #E07B39 0%, #E07B39 100%)",
              },
            }}
          >
            ปิด
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RoomBills;
