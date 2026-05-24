import React, { useState, useEffect } from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import "./styles.css";
import models from "../../modelData/models";
import fetchModel from "../../lib/fetchModelData";
/**
 *
 *
 *
 * Define TopBar, a React component of Project 4.
 */
function TopBar() {
  const location = useLocation();

  const pathParts = location.pathname.split("/");
  const [contextText, setContextText] = useState("Welcome to Photo App");

  useEffect(() => {
    if (pathParts.length === 3) {
      const viewType = pathParts[1];
      const userId = pathParts[2];

      fetchModel(`http://localhost:3000/user/${userId}`)
        .then((response) => {
          const user = response.data;
          const fullName = `${user.first_name} ${user.last_name}`;

          if (viewType === "users") {
            setContextText(fullName);
          } else if ((viewType = "photos")) {
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
  }, [location.pathname]);

  return (
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Typography variant="h5" color="inherit">
          {contextText}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
