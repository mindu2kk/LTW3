import React, { useState, useEffect, useRef } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import api from "../../lib/api";

function TopBar({ currentUser, changeUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pathParts = location.pathname.split("/");
  const [contextText, setContextText] = useState("Welcome to Photo App");

  useEffect(() => {
    if (!currentUser) {
      setContextText("Please Login");
      return;
    }
    if (pathParts.length === 3) {
      const viewType = pathParts[1];
      const userId = pathParts[2];
      api(`/user/${userId}`)
        .then((user) => {
          const fullName = `${user.first_name} ${user.last_name}`;
          if (viewType === "users") setContextText(fullName);
          else if (viewType === "photos") setContextText(`Photo of ${fullName}`);
        })
        .catch(() => setContextText("Loi cai du lieu"));
    } else {
      setContextText("Welcome to Photo App");
    }
  }, [location.pathname, currentUser]);

  const handleLogout = async () => {
    try {
      await api("/admin/logout", "POST");
    } catch {
      // Dù server lỗi vẫn logout ở client
    } finally {
      localStorage.removeItem("token");
      changeUser(null);
      navigate("/");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    try {
      // isFile = true → không set Content-Type, để browser tự set multipart
      await api("/photos/new", "POST", formData, true);
      alert("Upload anh thanh cong!");
      navigate(`/photos/${currentUser._id}`);
    } catch (errMsg) {
      alert(errMsg || "Upload that bai");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 3 }}>

        <Typography variant="h6" sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
          {currentUser ? `Hi, ${currentUser.first_name}` : "Please Login"}
        </Typography>

        {currentUser && <Typography variant="h6" sx={{ opacity: 0.4 }}>|</Typography>}

        <Typography variant="h6" sx={{ flexGrow: 1 }}>{contextText}</Typography>

        {currentUser && (
          <>
            <input type="file" accept="image/*" ref={fileInputRef}
              style={{ display: "none" }} onChange={handleFileChange} />
            <Button variant="contained" color="primary"
              onClick={() => fileInputRef.current.click()}
              sx={{ whiteSpace: "nowrap" }}>
              Add Photo
            </Button>
          </>
        )}

        {currentUser && (
          <Button onClick={handleLogout} variant="contained" color="error"
            sx={{ whiteSpace: "nowrap" }}>
            Logout
          </Button>
        )}

      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
