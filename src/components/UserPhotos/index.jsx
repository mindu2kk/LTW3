import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Box,
} from "@mui/material";

import fetchModel from "../../lib/fetchModelData";
import models from "../../modelData/models";
import "./styles.css";
import { useParams, Link } from "react-router-dom";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos() {
  const { userId } = useParams();
  const photos = models.photoOfUserModel(userId);

  const [photo, setPhotos] = useState(null);

  useEffect(() => {
    fetchModel(`http://localhost:3000/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
      })
      .catch((error) => {
        console.error("Loi khi tai danh sach anh : ", error);
      });
  }, []);

  if (!photos) {
    return <Typography variant="h5">Dang tai hinh anh</Typography>;
  }

  if (photos.length == 0) {
    return <Typography>Nguoi dung nay chua dang buc anh nao</Typography>;
  }

  return (
    <div>
      {photos.map((photo) => (
        <Card key={photo._id}>
          <CardMedia
            component="img"
            image={require(`../../images/${photo.file_name}`)}
            alt="Upload by user"
            sx={{ maxHeight: 500, objectFit: "contain" }}
          />

          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Date posted : {new Date(photo.date_time).toLocaleString()}
            </Typography>

            <Typography variant="h6">Comment :</Typography>

            {photo.comments && photo.comments.length > 0 ? (
              <Box>
                {photo.comments.map((comment) => (
                  <Box key={comment._id}>
                    <Typography variant="subtitle2">
                      <Link to={`/users/${comment.user._id}`}>
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                      <span>
                        ({new Date(comment.date_time).toLocaleString()})
                      </span>
                    </Typography>
                    <Typography variant="body1">{comment.comment}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body1">No comment yet</Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UserPhotos;
