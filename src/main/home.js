import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  CssBaseline,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import PeopleIcon from "@mui/icons-material/People";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BuildIcon from "@mui/icons-material/Build";
import CampaignIcon from "@mui/icons-material/Campaign";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

function DashboardPage() {
  // state ต่าง ๆ
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roomsData, setRoomsData] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [repairs, setRepairs] = useState([]);
  const [loadingRepairs, setLoadingRepairs] = useState(false);
  const [bills, setBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width:768px)");

  // ดึงข้อมูลจาก API
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch("https://api.horplus.work/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await fetch("https://api.horplus.work/api/rooms");
      const data = await response.json();
      setRoomsData(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchRepairs = async () => {
    setLoadingRepairs(true);
    try {
      const response = await fetch("https://api.horplus.work/api/repairs");
      const data = await response.json();
      setRepairs(data);
    } catch (error) {
      console.error("Error fetching repairs:", error);
    } finally {
      setLoadingRepairs(false);
    }
  };

  const fetchBills = async () => {
    setLoadingBills(true);
    try {
      const response = await fetch(
        "https://api.horplus.work/api/bills?is_admin=true"
      );
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error("Error fetching bills:", data.error || data);
        setBills([]);
      } else {
        setBills(data);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRooms();
    fetchRepairs();
    fetchBills();
  }, []);

  const countAvailable = roomsData.filter(
    (room) => room.status === "available"
  ).length;
  const countUnpaid = bills.filter(
    (bill) => bill.payment_state === "unpaid"
  ).length;
  const countRepair = repairs.filter((room) => room.status !== "เสร็จสิ้น").length;


  const menuItems = [
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
            <ListItemButton component={Link} to={item.link}>
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #E07B39 40%, #DCE4C9 10%)",
      }}
    >
      <CssBaseline />

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
            ระบบการจัดการหอพัก
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 240,
            backgroundColor: "#4F4A45",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          pt: { xs: 15, sm: 20 },
          p: { xs: 1, sm: 2 },
          pb: 5,
          overflowY: "auto",
        }}
      >
        <Toolbar sx={{ minHeight: 120 }} />

        <Box
          sx={{
            pt: 4,
            mx: "auto",
            width: { xs: "95%", sm: "90%", md: "1000px" },
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <Paper
                sx={{
                  p: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  รายการผู้ใช้
                </Typography>
                {loadingUsers ? (
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
                  <Box
                    sx={{
                      height: "400px",
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
                        <Typography>
                          ชื่อเต็ม: {user.full_name || "-"}
                        </Typography>
                        <Typography>
                          เบอร์โทร: {user.phone_number || "-"}
                        </Typography>
                        <Typography>ห้อง: {user.room_number || "-"}</Typography>
                        <Typography>สิทธิ์: {user.role || "-"}</Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1, sm: 2 },
                }}
              >
                <Paper
                  sx={{
                    p: { xs: 1, sm: 2 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {loadingRooms ? (
                    <CircularProgress size={30} sx={{ mr: 2 }} />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 35, sm: 50 },
                        height: { xs: 35, sm: 50 },
                        borderRadius: "50%",
                        backgroundColor: "#E07B39",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "0.9rem", sm: "1.2rem" } }}
                      >
                        {countAvailable}
                      </Typography>
                    </Box>
                  )}
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    ห้องที่ว่าง
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: { xs: 1, sm: 2 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {loadingBills ? (
                    <CircularProgress size={30} sx={{ mr: 2 }} />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 35, sm: 50 },
                        height: { xs: 35, sm: 50 },
                        borderRadius: "50%",
                        backgroundColor: "#E07B39",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "0.9rem", sm: "1.2rem" } }}
                      >
                        {countUnpaid}
                      </Typography>
                    </Box>
                  )}
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    ห้องที่ยังค้างชำระ
                  </Typography>
                </Paper>

                <Paper
                  sx={{
                    p: { xs: 1, sm: 2 },
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {loadingRepairs ? (
                    <CircularProgress size={30} sx={{ mr: 2 }} />
                  ) : (
                    <Box
                      sx={{
                        width: { xs: 35, sm: 50 },
                        height: { xs: 35, sm: 50 },
                        borderRadius: "50%",
                        backgroundColor: "#E07B39",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ fontSize: { xs: "0.9rem", sm: "1.2rem" } }}
                      >
                        {countRepair}
                      </Typography>
                    </Box>
                  )}
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>
                    ห้องที่ซ่อม
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>

          {/* ส่วนแสดงรายการแจ้งซ่อม */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: { xs: 1, sm: 2 },
                  borderRadius: 2,
                  boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  รายการแจ้งซ่อม
                </Typography>
                <Box
                  sx={{
                    height: "400px",
                    overflowY: "auto",
                    overflowX: "auto",
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    p: 1,
                  }}
                >
                  {loadingRepairs ? (
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
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      {repairs.map((repair) => (
                        <Paper
                          key={repair.repair_id || repair.id}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            backgroundColor: "#F5F5DC",
                            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
                          }}
                        >
                          <Typography sx={{ fontWeight: "bold" }}>
                            ห้อง: {repair.room_number}
                          </Typography>
                          <Typography>
                            รายละเอียด: {repair.description}
                          </Typography>
                          <Typography>สถานะ: {repair.status}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardPage;
