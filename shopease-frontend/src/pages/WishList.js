// src/pages/Wishlist.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa"; // Import an icon for delete

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [error, setError] = useState("");
  const rating = Math.floor(Math.random() * 5) + 1;

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(response.data);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        setError("Failed to load wishlist");
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete("/api/wishlist/remove", {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });
      // Remove product from local state
      setWishlist(wishlist.filter((item) => item.ProductId !== productId));
    } catch (err) {
      console.error("Error removing product from wishlist:", err);
      setError("Failed to remove product from wishlist");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách yêu thích của bạn</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.length > 0 ? (
          wishlist.map((product) => (
            <div
              key={product.ProductId}
              className="product-card p-4 bg-white shadow rounded-lg relative"
            >
              <h2 className="text-xl font-bold">{product.ProductName}</h2>
              <img
                src={product.ImageUrl}
                alt={product.ProductName}
                className="w-full h-auto rounded-md my-3"
              />
              <div className="flex justify-between my-4">
                <p className="text-gray-600 text-lg">{product.Description}</p>
                <div
                  className="mx-2 text-red-600 text-[20px]"
                  onClick={() => alert("Add to cart!")}
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                </div>
              </div>
              <div className="flex justify-between my-4">
                <p className="text-gray-600 text-lg font-semibold">
                  {product.Price} VND
                </p>
                <ul className="flex items-center">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <li
                      key={index}
                      className={
                        index < rating ? "text-yellow-300" : "text-gray-300"
                      }
                    >
                      <i
                        className={
                          index < rating
                            ? "fa-solid fa-star"
                            : "fa-regular fa-star"
                        }
                      ></i>
                    </li>
                  ))}
                </ul>
              </div>
              <p>Còn lại: {product.StockQuantity}</p>
              <button
                className="absolute top-2 right-2 text-[18px] text-red-600 hover:text-red-800"
                onClick={() => handleRemoveFromWishlist(product.ProductId)}
              >
                <FaTrashAlt />
              </button>
            </div>
          ))
        ) : (
          <p>Danh sách yêu thích của bạn hiện đang trống.</p>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
