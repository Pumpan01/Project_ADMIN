import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ดึงข้อมูลผู้ใช้
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      // คุณอาจเพิ่ม UI แสดง error หรือแจ้งเตือนได้
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      {/* Quick Navigation */}
      <div style={styles.navigationContainer}>
        <h2 style={styles.navigationTitle}>เมนูการจัดการ</h2>
        <div style={styles.navigationButtons}>
          <Link to="/user" style={styles.navButton}>
            จัดการผู้ใช้
          </Link>

          {/* เพิ่มปุ่มไปยังหน้า Rooms */}
          <Link to="/rooms" style={styles.navButton}>
            จัดการห้อง
          </Link>

          <Link to="/repair" style={styles.navButton}>
            การแจ้งซ่อม
          </Link>
          <Link to="/announcements" style={styles.navButton}>
            จัดการประกาศ
          </Link>
          <Link to="/admin/bills" style={styles.navButton}>
            บิล
          </Link>
        </div>
      </div>

      {/* Sidebar รายชื่อผู้ใช้ */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>รายชื่อผู้ใช้</h2>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : (
          <ul style={styles.userList}>
            {users.map((user) => (
              <li key={user.user_id} style={styles.userItem}>
                <strong>{user.full_name || "ไม่ระบุชื่อ"}</strong>
                <p>ห้อง: {user.room_number ? user.room_number : "ไม่มีห้อง"}</p>
                <p>โทร: {user.phone_number || "-"}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

export default HomePage;

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "1rem",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#ff6600",
    color: "white",
    textAlign: "center",
    padding: "2rem",
    borderRadius: "12px",
    marginBottom: "2rem",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
  },
  headerTitle: {
    margin: 0,
    fontSize: "2.5rem",
  },
  headerSubtitle: {
    fontSize: "1.2rem",
    marginTop: "0.5rem",
  },
  navigationContainer: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  navigationTitle: {
    fontSize: "1.8rem",
    color: "#ff6600",
    marginBottom: "1rem",
  },
  navigationButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "1.5rem",
    flexWrap: "wrap", // รองรับการแสดงผลหลายแถว
  },
  navButton: {
    display: "inline-block",
    padding: "1.2rem 1.8rem",
    backgroundColor: "#ff6600",
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    borderRadius: "8px",
    fontWeight: "bold",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    transition: "background-color 0.3s, transform 0.3s, box-shadow 0.3s",
    width: "150px",
    textAlign: "center",
  },
  sidebar: {
    marginTop: "2rem",
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    overflowY: "auto",
    maxHeight: "500px",
  },
  sidebarTitle: {
    fontSize: "1.5rem",
    color: "#ff6600",
    borderBottom: "2px solid #ff6600",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
  },
  userList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  userItem: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  // สามารถเพิ่ม Media Query ในไฟล์ CSS จริง หรือจะใช้ styled-components ก็ได้
};
