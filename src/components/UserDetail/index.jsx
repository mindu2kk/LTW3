import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Divider,
  CardContent,
  Button,
  Card,
} from "@mui/material";

import "./styles.css";
import { useParams, Link } from "react-router-dom";
import models from "../../modelData/models";
import fetchModel from "../../lib/fetchModelData";
/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
  const { userId } = useParams();

  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchModel(`https://5my2f7-8081.csb.app/user/${userId}`).then(
      (response) => {
        setUser(response.data);
      }
    );
  }, [userId]);

  if (!user) {
    return <Typography variant="h5">Dang tai ho so</Typography>;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography gutterBottom>
          {user.first_name} {user.last_name}
        </Typography>

        <Divider />

        <Box>
          <Typography variant="subtitle1">
            <strong>Location:</strong>
            {user.location}
          </Typography>
          <Typography variant="subtitle1">
            <strong>Occupation:</strong>
            {user.occupation}
          </Typography>
        </Box>

        <Typography variant="body1">"{user.description}"</Typography>

        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to={`/photos/${user._id}`}
        >
          Xem hinh anh
        </Button>
      </CardContent>
    </Card>
  );
}

export default UserDetail;
