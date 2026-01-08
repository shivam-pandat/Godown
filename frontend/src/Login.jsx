// Login.jsx
import React, { useState, useContext } from "react";
import { login, register } from "./api";
import { AuthContext } from "./AuthContext";

export default function Login() {
  const { setToken } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      if (mode === "login") {
        const res = await login({ username, password });
        setToken(res.data.token);
      } else {
        await register({ username, password });
        setMode("login");
        setMsg("Registered — please login.");
      }
    } catch (err) {
      setMsg(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
      <h2 className="text-2xl mb-4">{mode === "login" ? "Login" : "Register"}</h2>
      {msg && <div className="mb-3 text-sm text-red-600">{msg}</div>}
      <form onSubmit={submit}>
        <input
          required
          className="border p-2 w-full mb-2"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          required
          type="password"
          className="border p-2 w-full mb-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
            {mode === "login" ? "Login" : "Register"}
          </button>
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setMsg("");
            }}
          >
            {mode === "login" ? "Switch to register" : "Switch to login"}
          </button>
        </div>
      </form>
    </div>
  );
}
