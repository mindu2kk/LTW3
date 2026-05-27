import React, { useState, useEffect } from "react";
import { Divider, List, ListItem, ListItemText, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import api from "../../lib/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});

  useEffect(() => {
    api("/user/list")
      .then((data) => setUsers(data))
      .catch((err) => console.error("Loi khi tai danh sach user:", err));

    api("/user/photo-counts")
      .then((data) => setPhotoCounts(data))
      .catch((err) => console.error("Loi khi tai so luong anh:", err));
  }, []);

  return (
    <div>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>Danh sách người dùng</Typography>
      <List component="nav">
        <Link to="/all-photos">
          <ListItem sx={{ bgcolor: "#f5f5f5", borderRadius: 1, mb: 1 }}>
            <ListItemText primary="📷 Tất cả ảnh" />
          </ListItem>
        </Link>
        <Divider />
        {users.map((user) => (
          <React.Fragment key={user._id}>
            <Link to={`/users/${user._id}`}>
              <ListItem>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={`${photoCounts[user._id] || 0} ảnh`}
                />
              </ListItem>
            </Link>
          </React.Fragment>
        ))}
      </List>
    </div>
  );
}

export default UserList;
