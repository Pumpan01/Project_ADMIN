import React from "react";
import { Outlet } from "react-router-dom";

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
    flexWrap: "wrap",
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
};

function Layout({ headerTitle, headerSubtitle }) {
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>{headerTitle}</h1>
        <p style={styles.headerSubtitle}>{headerSubtitle}</p>
      </header>

      {/* Render children (Outlet) */}
      <Outlet />
    </div>
  );
}

export default Layout;
