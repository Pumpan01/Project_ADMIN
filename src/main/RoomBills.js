import React, { useState, useEffect, useCallback } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  Grid,
  TableContainer,
  Button,
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

  // Sidebar (หากต้องการใช้งาน)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dialog สำหรับเพิ่ม/แก้ไขบิล
  const [billDialogOpen, setBillDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBill, setCurrentBill] = useState({
    water_units: "",
    electricity_units: "",
    due_date: "",
    slip_path: "",
    meter: null, // ไฟล์ภาพ หรือ URL
  });

  // Dialog สำหรับดูตัวอย่างรูป (Preview)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

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
        `http://localhost:4000/api/bills/room-admin/${roomId}`
      );
      if (!response.ok) {
        Swal.fire({
          title: "ไม่มีบิล",
          text: "ยังไม่มีบิลสำหรับห้องนี้",
          icon: "info",
          confirmButtonText: "ตกลง",
          timer: 2000,
        });
        return;
      }
      const data = await response.json();
      setBills(data);
    } catch (error) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  // =============================
  // ฟังก์ชันสำหรับดูตัวอย่างรูปภาพ
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

        const uploadResponse = await fetch("http://localhost:4000/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok)
          throw new Error("การอัปโหลดภาพมิตเตอร์ไม่สำเร็จ");

        const uploadData = await uploadResponse.json();
        currentBill.meter = uploadData.file.path;
      }

      if (isEditing) {
        const response = await fetch(
          `http://localhost:4000/api/bills/${currentBill.bill_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentBill),
          }
        );
        if (!response.ok) throw new Error("โปรดกรอกข้อมูลให้ครบถ้วน");
        Swal.fire({
          icon: "success",
          title: "การแก้ไขบิลเสร็จสมบูรณ์",
          text: "บิลได้รับการอัปเดตเรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
          didOpen: (popup) => {
            popup.parentNode.style.zIndex = 99999;
          },
        });
      } else {
        const newBill = {
          user_id: userId,
          room_number: roomId,
          ...currentBill,
        };
        const response = await fetch("http://localhost:4000/api/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBill),
        });
        if (!response.ok) throw new Error("ไม่สามารถเพิ่มบิลได้");
        Swal.fire({
          icon: "success",
          title: "การเพิ่มข้อมูลบิลเสร็จสมบูรณ์",
          text: "บิลใหม่ถูกเพิ่มเรียบร้อยแล้ว",
          timer: 2000,
          showConfirmButton: false,
          didOpen: (popup) => {
            popup.parentNode.style.zIndex = 99999;
          },
        });
      }
      handleCloseBillDialog();
      fetchBills();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        didOpen: (popup) => {
          popup.parentNode.style.zIndex = 99999;
        },
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
      didOpen: (popup) => {
        popup.parentNode.style.zIndex = 99999;
      },
    });
    if (!result.isConfirmed) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/bills/${bill.bill_id}`,
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
        didOpen: (popup) => {
          popup.parentNode.style.zIndex = 99999;
        },
      });
      fetchBills();
    } catch (error) {
      console.error("Error deleting bill:", error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "เกิดข้อผิดพลาดในการลบบิล",
        didOpen: (popup) => {
          popup.parentNode.style.zIndex = 99999;
        },
      });
    }
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
        <Button
          variant="contained"
          sx={{
            background: "linear-gradient(45deg, #ff6600, #ff6600)",
            "&:hover": {
              background: "linear-gradient(45deg, #ff6600, #ff6600)",
            },
          }}
          onClick={handleOpenAddDialog}
        >
          เพิ่มข้อมูลบิล
        </Button>
      </Box>

      {/* ตารางบิล */}
      <Grid justifyContent="center">
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
                    <TableCell align="center">สลิป</TableCell>
                    <TableCell align="center">รูปมิตเตอร์</TableCell>
                    <TableCell align="center">ค่าน้ำ (หน่วย)</TableCell>
                    <TableCell align="center">ค่าไฟ (หน่วย)</TableCell>
                    <TableCell align="center">ยอดเงิน</TableCell>
                    <TableCell align="center">วันที่ครบกำหนด</TableCell>
                    <TableCell align="center">การกระทำ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bills.map((bill) => (
                    <TableRow key={bill.bill_id}>
                      <TableCell align="center">
                        {bill.room_number || "ไม่พบห้อง"}
                      </TableCell>
                      <TableCell align="center">
                        {bill.username || "ไม่พบผู้ใช้"}
                      </TableCell>
                      <TableCell align="center">
                        {bill.slip_path ? (
                          <Box
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                              handlePreviewOpen(
                                `http://localhost:4000/${bill.slip_path}`
                              )
                            }
                          >
                            <img
                              src={`http://localhost:4000/${bill.slip_path}`}
                              alt="Slip"
                              style={{ width: 50, height: 50 }}
                            />
                          </Box>
                        ) : (
                          "ไม่มีสลิป"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {bill.meter ? (
                          <Box
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                              handlePreviewOpen(
                                `http://localhost:4000/${bill.meter}`
                              )
                            }
                          >
                            <img
                              src={`http://localhost:4000/${bill.meter}`}
                              alt="Meter"
                              style={{ width: 50, height: 50 }}
                            />
                          </Box>
                        ) : (
                          "ไม่มีรูปมิตเตอร์"
                        )}
                      </TableCell>
                      <TableCell align="center">{bill.water_units}</TableCell>
                      <TableCell align="center">
                        {bill.electricity_units}
                      </TableCell>
                      <TableCell align="center">
                        {bill.total_amount
                          ? Number(bill.total_amount).toFixed(2)
                          : "0.00"}
                      </TableCell>
                      <TableCell align="center">
                        {bill.due_date ? formatDate(bill.due_date) : "ไม่ระบุ"}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="แก้ไขข้อมูล">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditDialog(bill)}
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Grid>
      </Grid>

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
            bgcolor: "#ff6600",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.5rem",
          }}
        >
          {isEditing ? "การแก้ไขบิลเสร็จสมบูรณ์" : "การเพิ่มข้อมูลบิลใหม่"}
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
                background: "linear-gradient(135deg, #ff6600 0%, #ff6600 100%)",
                color: "white",
                borderRadius: "20px",
                paddingX: 3,
                paddingY: 1.2,
                textTransform: "none",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #ff6600 0%, #ff6600 100%)",
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
                      : `http://localhost:4000/${currentBill.meter}`
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
              background: "linear-gradient(135deg, #ff6600 0%, #ff6600 100%)",
              color: "white",
              borderRadius: "20px",
              paddingX: 3,
              paddingY: 1.2,
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #ff6600 0%, #ff6600 100%)",
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
        <DialogTitle
          sx={{
            bgcolor: "#ff6600",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.5rem",
          }}
        >
          ตัวอย่างรูป
        </DialogTitle>
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
              background: "linear-gradient(135deg, #ff6600 0%, #ff6600 100%)",
              color: "white",
              borderRadius: "20px",
              paddingX: 4,
              paddingY: 1.2,
              textTransform: "none",
              fontSize: "16px",
              fontWeight: "bold",
              "&:hover": {
                background: "linear-gradient(135deg, #ff6600 0%, #ff6600 100%)",
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
