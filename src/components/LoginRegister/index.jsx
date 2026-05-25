import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../lib/config";

function LoginRegister(props) {
  const [loginName, setLoginName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/login`, {
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

      localStorage.setItem("userId", user._id);

      props.changeUser(user);
      navigate(`/users/${user._id}`);
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
