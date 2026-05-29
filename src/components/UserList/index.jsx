import React, { useState, useEffect, useRef } from "react";
import {
  Divider, List, ListItem, ListItemText,
  Typography, TextField, Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import api from "../../lib/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = chưa tìm, [] = không có kết quả
  const debounceTimer = useRef(null);

  useEffect(() => {
    api("/user/list")
      .then((data) => setUsers(data))
      .catch((err) => console.error("Loi khi tai danh sach user:", err));

    api("/user/photo-counts")
      .then((data) => setPhotoCounts(data))
      .catch((err) => console.error("Loi khi tai so luong anh:", err));
  }, []);

  // Debounce: chờ 400ms sau khi user ngừng gõ mới gọi API
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Xóa timer cũ nếu user vẫn đang gõ
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!value.trim()) {
      // Ô trống → xóa kết quả, hiện lại danh sách gốc
      setSearchResults(null);
      return;
    }

    // Đặt timer mới — gọi API sau 400ms
    debounceTimer.current = setTimeout(() => {
      api(`/user/search?q=${encodeURIComponent(value.trim())}`)
        .then((data) => setSearchResults(data))
        .catch(() => setSearchResults([]));
    }, 400);
  };

  // Danh sách hiển thị: nếu đang tìm kiếm thì dùng kết quả, ngược lại dùng danh sách gốc
  const displayList = searchResults !== null ? searchResults : users;

  return (
    <div>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        Danh sách người dùng
      </Typography>

      {/* Ô tìm kiếm */}
      <Box sx={{ px: 1, mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm kiếm người dùng..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </Box>

      <List component="nav">
        {/* Link tất cả ảnh — chỉ hiện khi không tìm kiếm */}
        {searchResults === null && (
          <>
            <Link to="/all-photos">
              <ListItem sx={{ bgcolor: "#f5f5f5", borderRadius: 1, mb: 1 }}>
                <ListItemText primary="📷 Tất cả ảnh" />
              </ListItem>
            </Link>
            <Divider />
          </>
        )}

        {/* Thông báo khi không tìm thấy */}
        {searchResults !== null && searchResults.length === 0 && (
          <Typography variant="body2" sx={{ p: 1, color: "#999" }}>
            Không tìm thấy người dùng nào
          </Typography>
        )}

        {/* Danh sách user */}
        {displayList.map((user) => (
          <React.Fragment key={user._id}>
            <Link to={`/users/${user._id}`}>
              <ListItem>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={
                    searchResults !== null
                      ? user.occupation || ""  // khi tìm kiếm: hiện occupation
                      : `${photoCounts[user._id] || 0} ảnh` // bình thường: hiện số ảnh
                  }
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
