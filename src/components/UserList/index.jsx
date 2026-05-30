import React, { useState, useEffect, useRef } from "react";
import { Divider, List, ListItem, ListItemText, Typography, TextField, Box } from "@mui/material";
import { Link } from "react-router-dom";
import "./styles.css";
import api from "../../lib/api";

function UserList() {
  const [users, setUsers] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = chưa tìm
  const debounceTimer = useRef(null);

  useEffect(() => {
    api("/user/list").then(setUsers).catch(console.error);
    api("/user/photo-counts").then(setPhotoCounts).catch(console.error);
  }, []);

  // Debounce 400ms — chờ user ngừng gõ mới gọi API
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) { setSearchResults(null); return; }
    debounceTimer.current = setTimeout(() => {
      api(`/user/search?q=${encodeURIComponent(value.trim())}`)
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 400);
  };

  const displayList = searchResults !== null ? searchResults : users;

  return (
    <div>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>Danh sách người dùng</Typography>

      <Box sx={{ px: 1, mb: 1 }}>
        <TextField size="small" fullWidth placeholder="Tìm kiếm người dùng..."
          value={searchQuery} onChange={handleSearchChange} />
      </Box>

      <List component="nav">
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

        {searchResults !== null && searchResults.length === 0 && (
          <Typography variant="body2" sx={{ p: 1, color: "#999" }}>Không tìm thấy</Typography>
        )}

        {displayList.map((user) => (
          <React.Fragment key={user._id}>
            <Link to={`/users/${user._id}`}>
              <ListItem>
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}`}
                  secondary={searchResults !== null
                    ? (user.occupation || "")
                    : `${photoCounts[user._id] || 0} ảnh`}
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
