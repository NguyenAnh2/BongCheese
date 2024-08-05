import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";

const Header = () => {
  let user = null;
  let isLoggedIn = false;
  const navigate = useNavigate();
  const [searchKey, setSearchKey] = useState("");

  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      user = JSON.parse(storedUser);
      isLoggedIn = !!user;
    }
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }

  const hanleSearch = async () => {
    if (searchKey.trim()) {
      navigate(`/search?query=${searchKey}`);
    } else {
      navigate("/product");
    }
  };

  return (
    <header className="bg-blue-100 p-4">
      <nav className="flex items-center justify-between">
        <div>
          <Link to="/">
            <img
              className="w-[140px] h-[65px] object-cover"
              src="/images/logo1.png"
              alt="logo"
            />
          </Link>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Nhập sản phẩm tìm kiếm"
              className="px-4 py-2 rounded-md mr-3"
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <div
              className="bg-pink-500 text-white py-2 px-4 hover:bg-pink-400 rounded cursor-pointer"
              onClick={hanleSearch}
            >
              Tìm kiếm
            </div>
          </div>
        </div>
        <ul
          className={`flex items-center space-x-2 md:flex md:space-x-4 flex-col md:flex-row`}
        >
          {isLoggedIn ? (
            <>
              <li>
                <Link to="/cart" className="text-black hover:text-violet-600">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="text-black hover:text-violet-600"
                >
                  Yêu thích
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-black hover:text-violet-600"
                >
                  Chào: {user.username} {/* Display user email */}
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    // localStorage.removeItem("token");
                    // localStorage.removeItem("user");
                    // localStorage.removeItem("persist:oauth");
                    // localStorage.removeItem("cartItems");
                    // localStorage.removeItem("totalPrice");
                    // localStorage.removeItem("totalQuantity");
                    localStorage.clear();
                    navigate("/");
                  }}
                  className="text-black hover:text-violet-600"
                >
                  Đăng xuất
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/signup" className="text-black hover:text-violet-600">
                  Đăng ký
                </Link>
              </li>
              <li>
                <Link to="/signin" className="text-black hover:text-violet-600">
                  Đăng nhập
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
