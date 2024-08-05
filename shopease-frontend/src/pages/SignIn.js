import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import jwt from "jsonwebtoken";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/signin", { email, password });
      if (response.status === 200) {
        // Save JWT token and user info to local storage
        const token = response.data.token;
        document.cookie = `token=${response.data.token}; HttpOnly`;
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            data: response.data,
            email: response.data.email,
            username: response.data.username,
            fullname: response.data.fullname, // Save FullName
            address: response.data.address, // Save Address
            phoneNumber: response.data.phoneNumber // Save PhoneNumber
          })
        );
        
        const decodedToken = jwt.decode(token);
        const expiryTime = (decodedToken.exp * 1000) - Date.now();
        
        setTimeout(() => {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin");
        }, expiryTime);
        navigate("/"); // Redirect to home page or dashboard
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  useEffect(() => {
    // const token = localStorage.getItem("token");
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      const decodedToken = jwt.decode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decodedToken.exp < currentTime) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/signin"); // Redirect to sign-in page
      } else {
        const expiryTime = (decodedToken.exp * 1000) - Date.now();
        setTimeout(() => {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/signin");
        }, expiryTime);
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center">
      <header className="bg-blue-100 p-4 w-full">
        <nav className="flex items-center justify-between">
          <div className="">
            <Link to="/">
              <img
                className="w-[140px] h-[65px] object-cover"
                src="images/logo1.png"
                alt="logo"
              />
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
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="text"
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
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="text-right my-2 font-[13.5px]">
            Bạn chưa có tài khoản?{" "}
            <Link className="text-blue-500 cursor-pointer" to="/signup">
              Đăng ký
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Đăng nhập
          </button>
        </form>
      </main>
    </div>
  );
};

export default SignIn;
