import React, { useState, useEffect } from "react";
import {
  Card, CardContent, Typography, TextField,
  Button, Box, Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../lib/api";

// Lấy userId của người đang đăng nhập từ token
function getCurrentUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).user_id;
  } catch {
    return null;
  }
}

function EditProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();

  const [form, setForm] = useState({
    first_name: "", last_name: "",
    location: "", description: "", occupation: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load thông tin hiện tại của user vào form
  useEffect(() => {
    api(`/user/${userId}`)
      .then((data) => {
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          location: data.location || "",
          description: data.description || "",
          occupation: data.occupation || "",
        });
      })
      .catch(() => setError("Khong the tai thong tin nguoi dung"));
  }, [userId]);

  // Chỉ cho phép sửa hồ sơ của chính mình
  if (currentUserId && userId !== currentUserId) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Ban khong co quyen chinh sua ho so nay
      </Typography>
    );
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    try {
      const updated = await api(`/user/${userId}`, "PUT", form);
      setSuccess("Cap nhat thanh cong!");
      setForm({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        location: updated.location || "",
        description: updated.description || "",
        occupation: updated.occupation || "",
      });
    } catch (errMsg) {
      setError(errMsg || "Cap nhat that bai");
    }
  };

  return (
    <Card variant="outlined" sx={{ maxWidth: 500, mx: "auto", mt: 2 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Chinh sua ho so
        </Typography>

        {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
        {success && <Typography color="success.main" sx={{ mb: 1 }}>{success}</Typography>}

        <TextField label="Ho *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={form.first_name} onChange={handleChange("first_name")} />

        <TextField label="Ten *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={form.last_name} onChange={handleChange("last_name")} />

        <Divider sx={{ my: 1.5 }} />

        <TextField label="Dia chi" fullWidth size="small" sx={{ mb: 1.5 }}
          value={form.location} onChange={handleChange("location")} />

        <TextField label="Nghe nghiep" fullWidth size="small" sx={{ mb: 1.5 }}
          value={form.occupation} onChange={handleChange("occupation")} />

        <TextField label="Mo ta ban than" fullWidth size="small" multiline rows={3} sx={{ mb: 2 }}
          value={form.description} onChange={handleChange("description")} />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleSave} sx={{ flex: 1 }}>
            Luu thay doi
          </Button>
          <Button variant="outlined" onClick={() => navigate(`/users/${userId}`)} sx={{ flex: 1 }}>
            Huy
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default EditProfile;
