import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import BASE_URL from "../../lib/config";
/**
 *
 *
 *
 * Define TopBar, a React component of Project 4.
 */
function TopBar({ currentUser, changeUser }) {
  const location = useLocation();
  const navigate = useNavigate();

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
      // Dù server có lỗi hay không, xóa token ở client là đủ để logout
      localStorage.removeItem("token");
      changeUser(null);
      navigate("/");
    }
  };
  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5">
          {currentUser ? `Hi ${currentUser.first_name}` : "Please login"}
        </Typography>
        <Typography variant="h5" color="inherit">
          {contextText}
        </Typography>

        {currentUser && (
          <Button onClick={handleLogout} variant="outlined">
            Logout
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
