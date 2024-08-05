import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== rePassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");

    try {
      const response = await axios.post("/api/users", {
        username,
        email,
        password,
      });
      alert("Đăng ký thành công ");
      navigate('/signin');
      // console.log("Sign-up successful:", response.data);
      // Redirect or show success message
    } catch (err) {
      console.error("Sign-up error:", err);
      setError("Error signing up. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <header className="bg-blue-100 p-4 w-full">
        <nav className="flex items-center justify-between">
          <div className="">
            <Link to="/">
              <img
                className="w-[140px] h-[65px] object-cover"
                src="/images/logo1.png"
                alt="logo"
              ></img>
            </Link>
          </div>
          <ul className="flex items-center space-x-2">
            <li>
              <Link
                to="/signup"
                className="text-blue-500 hover:text-violet-600"
              >
                Đăng ký
              </Link>
            </li>
            <li>
              <Link
                to="/signin"
                className="text-blue-500 hover:text-violet-600"
              >
                Đăng nhập
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="w-full max-w-md p-6 bg-white shadow-md rounded-md mt-10">
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="username"
            >
              Tên tài khoản
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              autoComplete="new-username"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              autoComplete="new-email"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              autoComplete="new-password"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="re-password"
            >
              Nhập lại mật khẩu
            </label>
            <input
              type="password"
              id="re-password"
              name="re-password"
              value={rePassword}
              onChange={(e) => setRePassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-md"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="text-right my-2 font-[13.5px]">
            Bạn đã có tài khoản?
            <Link className="text-blue-500 cursor-pointer" to="/signin">
              {" "}
              Đăng nhập
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Đăng ký
          </button>
        </form>
      </main>
    </div>
  );
};

export default SignUp;
