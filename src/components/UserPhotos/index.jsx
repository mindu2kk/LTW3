import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Box,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import fetchModel from "../../lib/fetchModelData";
import "./styles.css";
import { useParams, Link } from "react-router-dom";
import BASE_URL from "../../lib/config";

function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentErrors, setCommentErrors] = useState({});

  // Lưu trạng thái đang edit comment nào
  // Dạng: { "comment_id": "nội dung đang sửa" } — null nghĩa là không edit
  const [editingComment, setEditingComment] = useState(null); // comment_id đang edit
  const [editText, setEditText] = useState("");
  const [editError, setEditError] = useState("");

  // Lấy userId của người đang đăng nhập từ token
  const getCurrentUserId = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      // JWT có 3 phần cách nhau bởi "." — phần giữa là payload, encode base64
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch {
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  useEffect(() => {
    fetchModel(`${BASE_URL}/photosOfUser/${userId}`)
      .then((response) => setPhotos(response.data))
      .catch((error) => console.error("Loi khi tai danh sach anh:", error));
  }, [userId]);

  const handleAddComment = async (photoId) => {
    const commentText = commentInputs[photoId] || "";
    if (!commentText.trim()) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Comment khong duoc de trong" }));
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ comment: commentText.trim() }),
      });
      if (!response.ok) {
        const err = await response.json();
        setCommentErrors((prev) => ({ ...prev, [photoId]: err.message }));
        return;
      }
      const newComment = await response.json();
      setPhotos((prev) =>
        prev.map((photo) =>
          photo._id === photoId
            ? { ...photo, comments: [...(photo.comments || []), newComment] }
            : photo
        )
      );
      setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
      setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
    } catch (error) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Loi ket noi server" }));
    }
  };

  // Bắt đầu edit — lưu comment_id và nội dung hiện tại vào state
  const handleStartEdit = (commentId, currentText) => {
    setEditingComment(commentId);
    setEditText(currentText);
    setEditError("");
  };

  // Hủy edit — reset state về null
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText("");
    setEditError("");
  };

  // Xác nhận sửa — gọi API PUT
  const handleSaveEdit = async (photoId, commentId) => {
    if (!editText.trim()) {
      setEditError("Comment khong duoc de trong");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/commentsOfPhoto/${photoId}/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ comment: editText.trim() }),
      });
      if (!response.ok) {
        const err = await response.json();
        setEditError(err.message);
        return;
      }
      // Cập nhật state ngay — thay nội dung comment cũ bằng mới
      setPhotos((prev) =>
        prev.map((photo) =>
          photo._id === photoId
            ? {
                ...photo,
                comments: photo.comments.map((c) =>
                  c._id === commentId ? { ...c, comment: editText.trim() } : c
                ),
              }
            : photo
        )
      );
      handleCancelEdit();
    } catch (error) {
      setEditError("Loi ket noi server");
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
            image={
              photo.file_name.startsWith("http")
                ? photo.file_name
                : (() => {
                    try { return require(`../../images/${photo.file_name}`); }
                    catch { return `${BASE_URL}/images/${photo.file_name}`; }
                  })()
            }
            alt="Upload by user"
            sx={{ maxHeight: 500, objectFit: "contain" }}
          />
          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Date posted: {new Date(photo.date_time).toLocaleString()}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6">Comments:</Typography>

            {photo.comments && photo.comments.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {photo.comments.map((comment) => (
                  <Box key={comment._id} sx={{ mb: 1, pl: 1, borderLeft: "3px solid #eee" }}>

                    <Typography variant="subtitle2">
                      {comment.user && comment.user._id ? (
                        <Link to={`/users/${comment.user._id}`}>
                          {comment.user.first_name} {comment.user.last_name}
                        </Link>
                      ) : "Unknown"}
                      {" "}
                      <span style={{ color: "#999", fontSize: "0.8em" }}>
                        ({new Date(comment.date_time).toLocaleString()})
                      </span>
                    </Typography>

                    {/* Nếu đang edit comment này thì hiện ô nhập, ngược lại hiện text */}
                    {editingComment === comment._id ? (
                      <Box sx={{ mt: 0.5 }}>
                        <TextField
                          size="small"
                          fullWidth
                          value={editText}
                          onChange={(e) => { setEditText(e.target.value); setEditError(""); }}
                          error={!!editError}
                          helperText={editError}
                          autoFocus
                        />
                        <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                          {/* Nút tick xanh — lưu */}
                          <IconButton size="small" color="success"
                            onClick={() => handleSaveEdit(photo._id, comment._id)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          {/* Nút X đỏ — hủy */}
                          <IconButton size="small" color="error" onClick={handleCancelEdit}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {comment.comment}
                        </Typography>
                        {/* Chỉ hiện nút Edit nếu comment này là của người đang đăng nhập */}
                        {comment.user && comment.user._id === currentUserId && (
                          <IconButton size="small"
                            onClick={() => handleStartEdit(comment._id, comment.comment)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    )}

                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mb: 2, color: "#999" }}>
                Chua co comment nao
              </Typography>
            )}

            {/* Ô nhập comment mới */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                size="small" fullWidth
                placeholder="Nhap comment cua ban..."
                value={commentInputs[photo._id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [photo._id]: e.target.value }))
                }
                onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(photo._id); }}
                error={!!commentErrors[photo._id]}
                helperText={commentErrors[photo._id] || ""}
              />
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

function UserPhotos() {
  const { userId } = useParams();
  const [photos, setPhotos] = useState(null);

  // Lưu nội dung ô nhập comment theo từng photo_id
  // Dạng: { "photo_id_1": "nội dung đang gõ", "photo_id_2": "..." }
  const [commentInputs, setCommentInputs] = useState({});

  // Lưu thông báo lỗi theo từng photo_id (nếu submit comment rỗng)
  const [commentErrors, setCommentErrors] = useState({});

  useEffect(() => {
    fetchModel(`${BASE_URL}/photosOfUser/${userId}`)
      .then((response) => {
        setPhotos(response.data);
      })
      .catch((error) => {
        console.error("Loi khi tai danh sach anh : ", error);
      });
  }, [userId]);

  // Xử lý khi bấm "Gửi comment" cho một ảnh cụ thể
  const handleAddComment = async (photoId) => {
    const commentText = commentInputs[photoId] || "";

    // Kiểm tra rỗng ở client trước — không cần gọi server
    if (!commentText.trim()) {
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Comment khong duoc de trong" }));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/commentsOfPhoto/${photoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ comment: commentText.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        setCommentErrors((prev) => ({ ...prev, [photoId]: err.message }));
        return;
      }

      // Server trả về comment mới vừa tạo (có đủ _id, user, date_time)
      const newComment = await response.json();

      // Cập nhật state photos ngay — không cần reload trang
      // Tìm đúng photo theo id, push comment mới vào mảng comments của nó
      setPhotos((prevPhotos) =>
        prevPhotos.map((photo) =>
          photo._id === photoId
            ? { ...photo, comments: [...(photo.comments || []), newComment] }
            : photo
        )
      );

      // Xóa ô nhập và lỗi sau khi gửi thành công
      setCommentInputs((prev) => ({ ...prev, [photoId]: "" }));
      setCommentErrors((prev) => ({ ...prev, [photoId]: "" }));
    } catch (error) {
      console.error("Loi khi them comment:", error);
      setCommentErrors((prev) => ({ ...prev, [photoId]: "Loi ket noi server" }));
    }
  };

  if (!photos) {
    return <Typography variant="h5">Dang tai hinh anh</Typography>;
  }

  if (photos.length === 0) {
    return <Typography>Nguoi dung nay chua dang buc anh nao</Typography>;
  }

  return (
    <div>
      {photos.map((photo) => (
        <Card key={photo._id} sx={{ marginBottom: 3 }}>
          <CardMedia
            component="img"
            // Thử load từ backend URL trước (ảnh mới upload)
            // Nếu không có thì fallback về require() cho ảnh cũ trong src/images/
            image={
              photo.file_name.startsWith("http")
                ? photo.file_name
                : (() => {
                    try {
                      return require(`../../images/${photo.file_name}`);
                    } catch {
                      // Ảnh upload mới — load từ backend
                      return `${BASE_URL}/images/${photo.file_name}`;
                    }
                  })()
            }
            alt="Upload by user"
            sx={{ maxHeight: 500, objectFit: "contain" }}
          />

          <CardContent>
            <Typography variant="caption" color="textSecondary">
              Date posted: {new Date(photo.date_time).toLocaleString()}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="h6">Comments:</Typography>

            {/* Danh sách comment hiện có */}
            {photo.comments && photo.comments.length > 0 ? (
              <Box sx={{ mb: 2 }}>
                {photo.comments.map((comment) => (
                  <Box key={comment._id} sx={{ mb: 1, pl: 1, borderLeft: "3px solid #eee" }}>
                    <Typography variant="subtitle2">
                      <Link to={`/users/${comment.user._id}`}>
                        {comment.user.first_name} {comment.user.last_name}
                      </Link>
                      {" "}
                      <span style={{ color: "#999", fontSize: "0.8em" }}>
                        ({new Date(comment.date_time).toLocaleString()})
                      </span>
                    </Typography>
                    <Typography variant="body2">{comment.comment}</Typography>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mb: 2, color: "#999" }}>
                Chua co comment nao
              </Typography>
            )}

            {/* Ô nhập comment mới */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Nhap comment cua ban..."
                value={commentInputs[photo._id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [photo._id]: e.target.value }))
                }
                // Bấm Enter cũng gửi được
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddComment(photo._id);
                }}
                error={!!commentErrors[photo._id]}
                helperText={commentErrors[photo._id] || ""}
              />
              <Button
                variant="contained"
                onClick={() => handleAddComment(photo._id)}
                sx={{ whiteSpace: "nowrap" }}
              >
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
