import React, { useState, useEffect } from "react";
import { Typography, Box, Divider, CardContent, Button, Card } from "@mui/material";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./styles.css";
import api from "../../lib/api";

// Lấy userId của người đang đăng nhập từ JWT token
function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).user_id;
  } catch {
    return null;
  }
}

function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api(`/user/${userId}`)
      .then((data) => setUser(data))
      .catch((err) => console.error("Loi khi tai user:", err));
  }, [userId]);

  if (!user) return <Typography variant="h5">Dang tai ho so</Typography>;

  const isOwnProfile = userId === currentUserId;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>
        <Divider sx={{ mb: 1 }} />
        <Box sx={{ mb: 1 }}>
          <Typography variant="subtitle1"><strong>Location:</strong> {user.location}</Typography>
          <Typography variant="subtitle1"><strong>Occupation:</strong> {user.occupation}</Typography>
        </Box>
        <Typography variant="body1" sx={{ mb: 2 }}>"{user.description}"</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" color="secondary" component={Link} to={`/photos/${user._id}`}>
            Xem hinh anh
          </Button>
          {isOwnProfile && (
            <Button variant="outlined" onClick={() => navigate(`/edit-profile/${userId}`)}>
              Sua ho so
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default UserDetail;
