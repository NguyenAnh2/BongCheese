import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const OrderSummary = () => {
  const location = useLocation();
  const { cartItems, totalQuantity, totalPrice, paymentMethod } =
    location.state || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    address: "",
    phonenumber: "",
  });
  const inforStyle = "text-[16px] font-semibold mb-4";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found, please sign in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
        setFormData({
          username: response.data.username || "",
          fullname: response.data.fullname || "",
          address: response.data.address || "",
          phonenumber: response.data.phonenumber || "",
        });
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("Forbidden: You don't have access to this resource.");
        } else {
          setError("Failed to fetch user data.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put("/api/userinfo", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Update successful:", response.data);
      setUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user information:", err);
      setError("Failed to update user information.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!user) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thông tin đặt hàng</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Thông tin giỏ hàng</h2>
        <ul className="mb-4">
          {cartItems.map((item) => (
            <li key={item.CartItemId} className="mb-2">
              <strong>{item.ProductName}</strong> x <strong>{item.Quantity}</strong> - 
              <strong> đ{(item.Price * item.Quantity).toLocaleString()}</strong>
            </li>
          ))}
        </ul>
        <p className="mb-1">
          <strong>Tổng sản phẩm: </strong> {totalQuantity || 0}
        </p>
        <p className="mb-4">
          <strong>Tổng thanh toán:</strong>{" "}
          {totalPrice ? totalPrice.toLocaleString() : "0đ"}đ
        </p>

        <h2 className="text-xl font-semibold mb-2 pr-4">
          Thông tin khác hàng:
        </h2>

        {!isEditing ? (
          <>
            <p className={inforStyle}>
              Họ và tên:{" "}
              <span className="text-black">
                {user.fullname ? user.fullname : "Chưa thêm"}
              </span>
            </p>
            <p className={inforStyle}>
              Địa chỉ:{" "}
              <span className="text-black">
                {user.address ? user.address : "Chưa thêm"}
              </span>
            </p>
            <p className={inforStyle}>
              Số điện thoại:{" "}
              <span className="text-black">
                {user.phonenumber ? user.phonenumber : "Chưa thêm"}
              </span>
            </p>
          </>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Họ và tên</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Địa chỉ</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Số điện thoại</label>
              <input
                type="text"
                name="phonenumber"
                value={formData.phonenumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </form>
        )}
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="text-blue-700 text-[20px] hover:text-blue-500 active:text-pink-600 underline"
          >
            Sửa thông tin
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="text-blue-700 text-[20px] hover:text-blue-500 active:text-pink-600 underline"
          >
            Lưu thông tin
          </button>
        )}

        <h2 className="text-xl font-semibold mb-2">Phương thức thanh toán</h2>
        <p className="mb-4">{paymentMethod}</p>

        <button
          onClick={() => alert("Order placed successfully!")}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Đặt hàng
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
