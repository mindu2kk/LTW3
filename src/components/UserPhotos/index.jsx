import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import models from "../../modelData/models";
import "./styles.css";

const UserPhotos = () => {
  const { userId } = useParams();

  const user = models.userModel(userId);
  const photos = models.photoOfUserModel(userId);

  if (!user) {
    return (
      <Box className="user-photos-container">
        <Typography variant="h5" color="error">
          User not found
        </Typography>
      </Box>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Box className="user-photos-container">
        <Typography variant="h5">
          No photos found for {user.first_name} {user.last_name}
        </Typography>
      </Box>
    );
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box className="user-photos-container">
      <Typography variant="h5" className="user-photos-title">
        Photos of{" "}
        <Link to={`/users/${user._id}`}>
          {user.first_name} {user.last_name}
        </Link>
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {photos.map((photo) => (
        <Card key={photo._id} className="photo-card" elevation={2}>
          <Box className="photo-header">
            <Typography className="photo-date">
              Posted on {formatDateTime(photo.date_time)}
            </Typography>
          </Box>

          <Box className="photo-image-container">
            <CardMedia
              component="img"
              image={require(`../../images/${photo.file_name}`)}
              alt={`Photo by ${user.first_name}`}
              className="photo-image"
            />
          </Box>

          <CardContent className="comments-section">
            <Typography className="comments-title">
              Comments
              <Chip
                label={photo.comments ? photo.comments.length : 0}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            </Typography>

            {photo.comments && photo.comments.length > 0 ? (
              photo.comments.map((comment) => (
                <Box key={comment._id} className="comment-card">
                  <Box className="comment-header">
                    <Avatar
                      className="comment-avatar"
                      sx={{ width: 28, height: 28, fontSize: "0.75rem" }}
                    >
                      {comment.user?.first_name?.charAt(0)}
                      {comment.user?.last_name?.charAt(0)}
                    </Avatar>
                    <Link
                      to={`/users/${comment.user?._id}`}
                      className="comment-user-link"
                    >
                      {comment.user?.first_name} {comment.user?.last_name}
                    </Link>
                    <Typography className="comment-date">
                      {formatDateTime(comment.date_time)}
                    </Typography>
                  </Box>
                  <Typography className="comment-text">
                    {comment.comment}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography className="no-comments">
                No comments yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      ))
    </Box>
  );
};

export default UserPhotos;
