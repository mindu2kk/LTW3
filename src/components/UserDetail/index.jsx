import React, { useState, useEffect } from "react";
import { Typography, Box, Divider, CardContent, Button, Card } from "@mui/material";
import { useParams, Link } from "react-router-dom";
import "./styles.css";
import api from "../../lib/api";

function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    api(`/user/${userId}`)
      .then((data) => setUser(data))
      .catch((err) => console.error("Loi khi tai user:", err));
  }, [userId]);

  if (!user) return <Typography variant="h5">Dang tai ho so</Typography>;

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography gutterBottom>{user.first_name} {user.last_name}</Typography>
        <Divider />
        <Box>
          <Typography variant="subtitle1"><strong>Location:</strong> {user.location}</Typography>
          <Typography variant="subtitle1"><strong>Occupation:</strong> {user.occupation}</Typography>
        </Box>
        <Typography variant="body1">"{user.description}"</Typography>
        <Button variant="contained" color="secondary" component={Link} to={`/photos/${user._id}`}>
          Xem hinh anh
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserDetail;
