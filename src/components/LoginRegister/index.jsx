import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Divider, Paper } from "@mui/material";
import api from "../../lib/api";

function LoginRegister({ changeUser }) {
  const navigate = useNavigate();

  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [reg, setReg] = useState({
    login_name: "", password: "", confirm_password: "",
    first_name: "", last_name: "", location: "", description: "", occupation: "",
  });
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const handleRegChange = (field) => (e) => {
    setReg((prev) => ({ ...prev, [field]: e.target.value }));
    setRegError(""); setRegSuccess("");
  };

  const handleLogin = async () => {
    setLoginError("");
    try {
      const user = await api("/admin/login", "POST", { login_name: loginName, password: loginPassword });
      localStorage.setItem("token", user.token);
      changeUser(user);
      navigate(`/users/${user._id}`);
    } catch (errMsg) {
      setLoginError(errMsg || "Dang nhap that bai");
    }
  };

  const handleRegister = async () => {
    setRegError(""); setRegSuccess("");
    if (reg.password !== reg.confirm_password) {
      setRegError("Mat khau nhap lai khong khop"); return;
    }
    try {
      await api("/user", "POST", {
        login_name: reg.login_name, password: reg.password,
        first_name: reg.first_name, last_name: reg.last_name,
        location: reg.location, description: reg.description, occupation: reg.occupation,
      });
      setRegSuccess("Dang ky thanh cong! Ban co the dang nhap ngay bay gio.");
      setReg({ login_name: "", password: "", confirm_password: "", first_name: "", last_name: "", location: "", description: "", occupation: "" });
    } catch (errMsg) {
      setRegError(errMsg || "Dang ky that bai");
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 4, p: 3, flexWrap: "wrap" }}>

      {/* FORM LOGIN */}
      <Paper elevation={2} sx={{ p: 3, flex: 1, minWidth: 260 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Dang nhap</Typography>
        {loginError && <Typography color="error" sx={{ mb: 1 }}>{loginError}</Typography>}
        <TextField label="Ten dang nhap" fullWidth size="small" sx={{ mb: 2 }}
          value={loginName} onChange={(e) => { setLoginName(e.target.value); setLoginError(""); }} />
        <TextField label="Mat khau" type="password" fullWidth size="small" sx={{ mb: 2 }}
          value={loginPassword}
          onChange={(e) => { setLoginPassword(e.target.value); setLoginError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }} />
        <Button variant="contained" fullWidth onClick={handleLogin}>Login</Button>
      </Paper>

      {/* FORM REGISTER */}
      <Paper elevation={2} sx={{ p: 3, flex: 1, minWidth: 260 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>Dang ky tai khoan moi</Typography>
        {regError && <Typography color="error" sx={{ mb: 1 }}>{regError}</Typography>}
        {regSuccess && <Typography color="success.main" sx={{ mb: 1 }}>{regSuccess}</Typography>}

        <TextField label="Ten dang nhap *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.login_name} onChange={handleRegChange("login_name")} />
        <TextField label="Mat khau *" type="password" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.password} onChange={handleRegChange("password")} />
        <TextField label="Nhap lai mat khau *" type="password" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.confirm_password} onChange={handleRegChange("confirm_password")}
          error={reg.confirm_password !== "" && reg.password !== reg.confirm_password}
          helperText={reg.confirm_password !== "" && reg.password !== reg.confirm_password ? "Mat khau khong khop" : ""} />
        <TextField label="Ho *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.first_name} onChange={handleRegChange("first_name")} />
        <TextField label="Ten *" fullWidth size="small" sx={{ mb: 1.5 }}
          value={reg.last_name} onChange={handleRegChange("last_name")} />
        <Divider sx={{ my: 1.5 }} />
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
