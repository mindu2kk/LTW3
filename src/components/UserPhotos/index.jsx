import React, { useEffect, useState } from "react";
import {
  Typography, Card, CardMedia, CardContent,
  Divider, Box, TextField, Button, IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import DeleteIcon from "@mui/icons-material/Delete";
import { useParams, Link } from "react-router-dom";
import api from "../../lib/api";
import BASE_URL from "../../lib/config";
import "./styles.css";

// Lấy userId từ JWT token đang lưu trong localStorage
function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).user_id;
  } catch {
    return null;
  }
}

// Lấy URL ảnh — thử ảnh cũ trong src/images trước, nếu không có thì dùng URL backend
function getImageUrl(fileName) {
  try {
    return require(`../../images/${fileName}`);
  } catch {
    return `${BASE_URL}/images/${fileName}`;
  }
}

function UserPhotos() {
  const { userId } = useParams();
  const currentUserId = getCurrentUserId();

  const [photos, setPhotos] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentErrors, setCommentErrors] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    api(`/photosOfUser/${userId}`)
      .then((data) => setPhotos(data))
      .catch((err) => console.error("Loi khi tai anh:", err));
  }, [userId]);

  // Thêm comment mới
  const handleAddComment = async (photoId) => {
    const commentText = (commentInputs[photoId] || "").trim();
    if (!commentText) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Comment khong duoc de trong" }));
      return;
    }
    try {
      const newComment = await api(`/commentsOfPhoto/${photoId}`, "POST", { comment: commentText });
      setPhotos((prev) =>
        prev.map((photo) =>
          photo._id === photoId
            ? { ...photo, comments: [...(photo.comments || []), newComment] }
            : photo
        )
      );
      setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
      setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
    } catch (errMsg) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: errMsg }));
    }
  };

  // Bắt đầu edit comment
  const handleStartEdit = (commentId, currentText) => {
    setEditingComment(commentId);
    setEditText(currentText);
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
    setEditError("");
  };

  const handleDeleteComment = async (photoId, commentId) => {
    try {
      await api(`/commentsOfPhoto/${photoId}/${commentId}`, "DELETE");
      setPhotos((prev) =>
        prev.map((photo) =>
          photo._id === photoId
            ? { ...photo, comments: photo.comments.filter((c) => c._id !== commentId) }
            : photo
        )
      );
    } catch (errMsg) {
      console.error("Loi khi xoa comment:", errMsg);
    }
  };

  // Lưu comment đã sửa
  const handleSaveEdit = async (photoId, commentId) => {
    const text = editText.trim();
    if (!text) { setEditError("Comment khong duoc de trong"); return; }
    try {
      await api(`/commentsOfPhoto/${photoId}/${commentId}`, "PUT", { comment: text });
      setPhotos((prev) =>
        prev.map((photo) =>
          photo._id === photoId
            ? { ...photo, comments: photo.comments.map((c) =>
                c._id === commentId ? { ...c, comment: text } : c) }
            : photo
        )
      );
      handleCancelEdit();
    } catch (errMsg) {
      setEditError(errMsg);
    }
  };

  // Toggle like/unlike ảnh
  const handleLike = async (photoId) => {
    try {
      const result = await api(`/photos/${photoId}/like`, "POST");
      // Cập nhật state ngay — thay mảng likes của photo đó
      setPhotos((prev) =>
        prev.map((photo) => {
          if (photo._id !== photoId) return photo;
          // Nếu liked → thêm currentUserId vào mảng, ngược lại bỏ ra
          const newLikes = result.liked
            ? [...(photo.likes || []), currentUserId]
            : (photo.likes || []).filter((id) => id !== currentUserId);
          return { ...photo, likes: newLikes };
        })
      );
    } catch (err) {
      console.error("Loi khi like:", err);
    }
  };

  if (!photos) return <Typography variant="h5">Dang tai hinh anh</Typography>;
  if (photos.length === 0) return <Typography>Nguoi dung nay chua dang buc anh nao</Typography>;

  return (
    <div>
      {photos.map((photo) => (
        <Card key={photo._id} sx={{ marginBottom: 3 }}>
          <CardMedia
            component="img"
            image={getImageUrl(photo.file_name)}
            alt="photo"
            sx={{ maxHeight: 500, objectFit: "contain" }}
          />
          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Date posted: {new Date(photo.date_time).toLocaleString()}
            </Typography>

            {/* Nút like — tim đỏ nếu đã like, tim rỗng nếu chưa */}
            <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => handleLike(photo._id)}
                color={photo.likes?.some((id) => id === currentUserId || id?.toString() === currentUserId) ? "error" : "default"}
              >
                {photo.likes?.some((id) => id === currentUserId || id?.toString() === currentUserId)
                  ? <FavoriteIcon />
                  : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" color="textSecondary">
                {photo.likes?.length || 0} like
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">Comments:</Typography>

            {photo.comments && photo.comments.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {photo.comments.map((comment) => (
                  <Box key={comment._id} sx={{ mb: 1, pl: 1, borderLeft: "3px solid #eee" }}>
                    <Typography variant="subtitle2">
                      {comment.user?._id
                        ? <Link to={`/users/${comment.user._id}`}>{comment.user.first_name} {comment.user.last_name}</Link>
                        : "Unknown"}
                      {" "}
                      <span style={{ color: "#999", fontSize: "0.8em" }}>
                        ({new Date(comment.date_time).toLocaleString()})
                      </span>
                    </Typography>

                    {editingComment === comment._id ? (
                      <Box sx={{ mt: 0.5 }}>
                        <TextField size="small" fullWidth autoFocus
                          value={editText}
                          onChange={(e) => { setEditText(e.target.value); setEditError(""); }}
                          error={!!editError} helperText={editError} />
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          <IconButton size="small" color="success"
                            onClick={() => handleSaveEdit(photo._id, comment._id)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={handleCancelEdit}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>{comment.comment}</Typography>
                        {/* Chỉ hiện nút Edit và Delete với comment của chính mình */}
                        {comment.user?._id === currentUserId && (
                          <>
                            <IconButton size="small"
                              onClick={() => handleStartEdit(comment._id, comment.comment)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error"
                              onClick={() => handleDeleteComment(photo._id, comment._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mb: 2, color: "#999" }}>Chua co comment nao</Typography>
            )}

            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField size="small" fullWidth
                placeholder="Nhap comment cua ban..."
                value={commentInputs[photo._id] || ""}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [photo._id]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(photo._id); }}
                error={!!commentErrors[photo._id]}
                helperText={commentErrors[photo._id] || ""} />
              <Button variant="contained"
                onClick={() => handleAddComment(photo._id)}
                sx={{ whiteSpace: "nowrap" }}>
                Gửi
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default UserPhotos;
