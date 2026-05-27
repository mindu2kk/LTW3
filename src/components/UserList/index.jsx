import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import BASE_URL from "../../lib/config";
/**
 * Define UserList, a React component of Project 4.
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});

  useEffect(() => {
    // Gọi /user/list trước — đây là dữ liệu chính, phải hiển thị được
    fetchModel(`${BASE_URL}/user/list`)
      .then((res) => setUsers(res.data))
      .catch((error) => console.error("Loi khi tai danh sach user:", error));

    // Gọi photo-counts riêng — lỗi ở đây không ảnh hưởng đến danh sách user
    fetchModel(`${BASE_URL}/user/photo-counts`)
      .then((res) => setPhotoCounts(res.data))
      .catch((error) => console.error("Loi khi tai so luong anh:", error));
  }, []);
  return (
    <div>
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Danh sách người dùng
      </Typography>
      <List component="nav">
        {/* Link xem tất cả ảnh */}
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
                  // Hiện số ảnh bên dưới tên — 0 nếu user chưa có ảnh nào
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
