import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Divider, Paper
} from "@mui/material";
import BASE_URL from "../../lib/config";

function LoginRegister(props) {
  const navigate = useNavigate();

  // --- State cho form LOGIN ---
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- State cho form REGISTER ---
  const [reg, setReg] = useState({
    login_name: "", password: "", confirm_password: "",
    first_name: "", last_name: "",
    location: "", description: "", occupation: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  // Cập nhật từng field của form đăng ký
  const handleRegChange = (field) => (e) => {
    setReg((prev) => ({ ...prev, [field]: e.target.value }));
    setRegError("");
    setRegSuccess("");
  };

  // --- Xử lý LOGIN ---
  const handleLogin = async () => {
    setLoginError("");
    try {
      const response = await fetch(`${BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_name: loginName, password: loginPassword }),
      });

      if (!response.ok) {
        const err = await response.json();
        setLoginError(err.message || "Dang nhap that bai");
        return;
      }

      const user = await response.json();
      localStorage.setItem("token", user.token);
      props.changeUser(user);
      navigate(`/users/${user._id}`);
    } catch (error) {
      setLoginError("Loi ket noi den may chu");
    }
  };

  // --- Xử lý REGISTER ---
  const handleRegister = async () => {
    setRegError("");
    setRegSuccess("");

    // Kiểm tra 2 password khớp nhau — làm ở client trước khi gọi server
    if (reg.password !== reg.confirm_password) {
      setRegError("Mat khau nhap lai khong khop");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login_name: reg.login_name,
          password: reg.password,
          first_name: reg.first_name,
          last_name: reg.last_name,
          location: reg.location,
          description: reg.description,
          occupation: reg.occupation,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setRegError(err.message || "Dang ky that bai");
        return;
      }

      // Đăng ký thành công → hiện thông báo và xóa form
      setRegSuccess("Dang ky thanh cong! Ban co the dang nhap ngay bay gio.");
      setReg({
        login_name: "", password: "", confirm_password: "",
        first_name: "", last_name: "",
        location: "", description: "", occupation: "",
      });
    } catch (error) {
      setRegError("Loi ket noi den may chu");
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 4, p: 3, flexWrap: "wrap" }}>

      {/* ===== FORM LOGIN ===== */}
      <Paper elevation={2} sx={{ p: 3, flex: 1, minWidth: 260 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Dang nhap
        </Typography>

        {loginError && (
          <Typography color="error" sx={{ mb: 1 }}>{loginError}</Typography>
        )}

        <TextField
          label="Ten dang nhap"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          value={loginName}
          onChange={(e) => { setLoginName(e.target.value); setLoginError(""); }}
        />

        {/* type="password" → ẩn ký tự khi gõ */}
        <TextField
          label="Mat khau"
          type="password"
          fullWidth
          size="small"
          sx={{ mb: 2 }}
          value={loginPassword}
          onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
        />

        <Button variant="contained" fullWidth onClick={handleLogin}>
          Login
        </Button>
      </Paper>

      {/* ===== FORM REGISTER ===== */}
      <Paper elevation={2} sx={{ p: 3, flex: 1, minWidth: 260 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Dang ky tai khoan moi
        </Typography>

        {regError && (
          <Typography color="error" sx={{ mb: 1 }}>{regError}</Typography>
        )}
        {regSuccess && (
          <Typography color="success.main" sx={{ mb: 1 }}>{regSuccess}</Typography>
        )}

        {/* Field bắt buộc */}
        <TextField label="Ten dang nhap *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.login_name} onChange={handleRegChange("login_name")} />

        <TextField label="Mat khau *" type="password" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.password} onChange={handleRegChange("password")} />

        {/* Nhập lại password để xác nhận — chỉ dùng ở client, không gửi lên server */}
        <TextField label="Nhap lai mat khau *" type="password" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.confirm_password} onChange={handleRegChange("confirm_password")}
          error={reg.confirm_password !== "" && reg.password !== reg.confirm_password}
          helperText={
            reg.confirm_password !== "" && reg.password !== reg.confirm_password
              ? "Mat khau khong khop" : ""
          }
        />

        <TextField label="Ho *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.first_name} onChange={handleRegChange("first_name")} />

        <TextField label="Ten *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.last_name} onChange={handleRegChange("last_name")} />

        <Divider sx={{ my: 1.5 }} />

        {/* Field không bắt buộc */}
        <TextField label="Dia chi" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.location} onChange={handleRegChange("location")} />

        <TextField label="Nghe nghiep" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.occupation} onChange={handleRegChange("occupation")} />

        <TextField label="Mo ta ban than" fullWidth size="small" multiline rows={2} sx={{ mb: 2 }}
          value={reg.description} onChange={handleRegChange("description")} />

        <Button variant="contained" color="success" fullWidth onClick={handleRegister}>
          Register Me
        </Button>
      </Paper>

    </Box>
  );
}

export default LoginRegister;
