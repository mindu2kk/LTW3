import React, { userState, useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

function LoginRegister(props) {
  const [loginName, setLoginName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch("https://5my2f7-8081.csb.app/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_name: loginName }),
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        setErrorMsg(errorData.message || "Dang nhap that bai");
        return;
      }

      const user = await response.json();

      props.changeUser(user);
      navigate(`/user/{userId}`);
    } catch (error) {
      setErrorMsg("Loi thiet ke den may chu");
    }
  };
  return (
    <div>
      <h2>Dang nhap vao he thong</h2>
      {errorMsg && (
        <p style={{ color: "red", fontWeight: "bold" }}>{errorMsg}</p>
      )}

      <div>
        <label>Ten dang nhap:</label>
        <input
          type="text"
          value={loginName}
          onChange={(e) => setLoginName(e.target.value)}
          placeholder="Nhap ho cua ban"
        />
      </div>

      <button
        onClick={handleLogin}
        style={{ padding: "5px 15px", cursor: "pointer" }}
      >
        Login
      </button>
    </div>
  );
}

export default LoginRegister;
