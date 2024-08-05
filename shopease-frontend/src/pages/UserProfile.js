import React, { useEffect, useState } from "react";
import axios from "axios";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Trạng thái chỉnh sửa
  const [formData, setFormData] = useState({
    username: "",
    fullname: "",
    address: "",
    phonenumber: "",
  });

  const inforStyle = "text-[20px] font-bold mb-4 text-gray-600";

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

  console.log(user)

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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Thông tin cá nhân</h2>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="text-blue-700 text-[24px] hover:text-blue-500 active:text-pink-600 underline"
          >
            Sửa
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="text-blue-700 text-[24px] hover:text-blue-500 active:text-pink-600 underline"
          >
            Lưu
          </button>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow-md">
        {!isEditing ? (
          <>
            <p className={inforStyle}>
              Email: <span className="text-black">{user.email}</span>
            </p>
            <p className={inforStyle}>
              Username:{" "}
              <span className="text-black">
                {user.username ? user.username : "Chưa thêm"}
              </span>
            </p>
            <p className={inforStyle}>
              Full Name:{" "}
              <span className="text-black">
                {user.fullname ? user.fullname : "Chưa thêm"}
              </span>
            </p>
            <p className={inforStyle}>
              Address:{" "}
              <span className="text-black">
                {user.address ? user.address : "Chưa thêm"}
              </span>
            </p>
            <p className={inforStyle}>
              Phone Number:{" "}
              <span className="text-black">
                {user.phonenumber ? user.phonenumber : "Chưa thêm"}
              </span>
            </p>
          </>
        ) : (
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-gray-700">Phone Number</label>
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
      </div>
    </div>
  );
};

export default UserProfile;
