import React, { useEffect, useState } from "react";
import { Typography, Card, CardMedia, CardContent, Box, Grid } from "@mui/material";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import BASE_URL from "../../lib/config";

function getImageUrl(fileName) {
  try { return require(`../../images/${fileName}`); }
  catch { return `${BASE_URL}/images/${fileName}`; }
}

function AllPhotos() {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    api("/photos/all").then(setPhotos).catch(console.error);
  }, []);

  if (!photos) return <Typography variant="h6">Dang tai...</Typography>;
  if (photos.length === 0) return <Typography>Chua co anh nao</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Tất cả ảnh ({photos.length})
      </Typography>
      <Grid container spacing={2}>
        {photos.map((photo) => (
          <Grid item xs={12} sm={6} md={4} key={photo._id}>
            <Card>
              <CardMedia component="img" image={getImageUrl(photo.file_name)}
                alt="photo" sx={{ height: 200, objectFit: "cover" }} />
              <CardContent sx={{ py: 1 }}>
                {photo.user?._id ? (
                  <Typography variant="subtitle2">
                    Đăng bởi: <Link to={`/photos/${photo.user._id}`}>
                      {photo.user.first_name} {photo.user.last_name}
                    </Link>
                  </Typography>
                ) : (
                  <Typography variant="subtitle2">Đăng bởi: Unknown</Typography>
                )}
                <Typography variant="caption" color="textSecondary">
                  {new Date(photo.date_time).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default AllPhotos;
