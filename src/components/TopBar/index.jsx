import React, { useState, useEffect, useRef } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import BASE_URL from "../../lib/config";

function TopBar({ currentUser, changeUser, onPhotoUploaded }) {
  const location = useLocation();
  const navigate = useNavigate();
  // ref để trigger click vào input file ẩn
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

      fetchModel(`${BASE_URL}/user/${userId}`)
        .then((response) => {
          const user = response.data;
          const fullName = `${user.first_name} ${user.last_name}`;
          if (viewType === "users") {
            setContextText(fullName);
          } else if (viewType === "photos") {
            setContextText(`Photo of ${fullName}`);
          }
        })
        .catch((error) => {
          console.error("Loi TopBar:", error);
          setContextText("Loi cai du lieu");
        });
    } else {
      setContextText("Welcome to Photo App");
    }
  }, [location.pathname, currentUser]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${BASE_URL}/admin/logout`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    } catch (error) {
      console.error("Loi khi dang xuat", error);
    } finally {
      localStorage.removeItem("token");
      changeUser(null);
      navigate("/");
    }
  };

  // Khi user chọn file từ dialog
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dùng FormData để gửi file — không thể dùng JSON cho binary data
    const formData = new FormData();
    formData.append("photo", file); // "photo" phải khớp với upload.single("photo") ở backend

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/photos/new`, {
        method: "POST",
        headers: {
          // KHÔNG set Content-Type ở đây — browser tự set multipart/form-data + boundary
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        alert(err.message || "Upload that bai");
        return;
      }

      const newPhoto = await response.json();

      // Gọi callback để UserPhotos biết có ảnh mới — nếu đang ở trang photos của chính mình
      if (onPhotoUploaded) onPhotoUploaded(newPhoto);

      alert("Upload anh thanh cong!");

      // Nếu đang ở trang photos của user hiện tại thì navigate lại để reload
      navigate(`/photos/${currentUser._id}`);
    } catch (error) {
      console.error("Loi upload:", error);
      alert("Loi ket noi server");
    } finally {
      // Reset input để có thể chọn lại cùng file
      e.target.value = "";
    }
  };

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar sx={{ display: "flex", alignItems: "center", gap: 3 }}>

        {/* Lời chào / trạng thái đăng nhập */}
        <Typography variant="h6" sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
          {currentUser ? `Hi, ${currentUser.first_name}` : "Please Login"}
        </Typography>

        {currentUser && (
          <Typography variant="h6" sx={{ opacity: 0.4 }}>|</Typography>
        )}

        {/* Context text — chiếm phần còn lại */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {contextText}
        </Typography>

        {/* Nút Add Photo — chỉ hiện khi đã đăng nhập */}
        {currentUser && (
          <>
            {/* Input file ẩn — được trigger bởi nút bên dưới */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => fileInputRef.current.click()}
              sx={{ whiteSpace: "nowrap" }}
            >
              Add Photo
            </Button>
          </>
        )}

        {/* Nút Logout — màu đỏ */}
        {currentUser && (
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{ whiteSpace: "nowrap" }}
          >
            Logout
          </Button>
        )}

      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
