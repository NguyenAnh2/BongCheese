import React, { useState, useEffect } from "react";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Link } from "react-router-dom";

const Product = ({ product }) => {
  const [toggleWishlist, setToggleWishlist] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const rating = Math.floor(Math.random() * 5) + 1;

  const handleWishlistToggle = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      if (token) {
        if (toggleWishlist) {
          // Xóa sản phẩm khỏi danh sách yêu thích
          await axios.delete("/api/wishlist/remove", {
            headers: { Authorization: `Bearer ${token}` },
            data: { productId: product.ProductId },
          });
        } else {
          // Thêm sản phẩm vào danh sách yêu thích
          await axios.post(
            "/api/wishlist/add",
            { productId: product.ProductId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
        setToggleWishlist(!toggleWishlist);
      } else {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào danh sách yêu thích!");
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/cart/add",
        { productId: product.ProductId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Thêm thành công!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
    } finally {
      setIsProcessing(false);
    }
  };

  const tokenCheck = localStorage.getItem("token");
  if (tokenCheck) {
    useEffect(() => {
      const checkWishlist = async () => {
        try {
          const response = await axios.get("/api/wishlist/check", {
            headers: { Authorization: `Bearer ${tokenCheck}` },
            params: { productId: product.ProductId },
          });
          setToggleWishlist(response.data.isInWishlist);
        } catch (err) {
          console.error("Error checking wishlist:", err);
        }
      };

      checkWishlist();
    }, [product.ProductId]);
  }

  return (
    <div className="product-card p-4 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold text-center text-red-300">
        {product.ProductName}
      </h1>
      <img
        src={product.ImageUrl}
        alt={product.ProductName}
        className="w-full h-auto rounded-md my-3"
      />
      <div className="flex justify-between">
        <h2 className="text-[20px] mb-3 text-pink-600 overflow-hidden whitespace-nowrap overflow-ellipsis">
          {product.Description}
        </h2>
        <div className="flex items-center">
          <div
            className="mx-2 text-red-600 text-[20px]"
            onClick={handleAddToCart}
          >
            <i className="fa-solid fa-cart-shopping"></i>
          </div>
          {toggleWishlist ? (
            <i
              className="text-red-500 fa-solid fa-heart text-[20px]"
              onClick={handleWishlistToggle}
            ></i>
          ) : (
            <i
              className="text-red-500 fa-regular fa-heart text-[20px]"
              onClick={handleWishlistToggle}
            ></i>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-gray-600 text-[18px]">{product.Price}</p>
        <ul className="flex items-center">
          {Array.from({ length: 5 }).map((_, index) => (
            <li
              key={index}
              className={index < rating ? "text-yellow-300" : "text-gray-300"}
            >
              <i
                className={
                  index < rating ? "fa-solid fa-star" : "fa-regular fa-star"
                }
              ></i>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-gray-600 text-[16px] my-3">
        Còn lại: {product.StockQuantity}
      </p>
      <Link to={`/product/${product.ProductId}`} className="text-blue-600">
        <div className="text-[18px] font-semibold w-full text-center bg-pink-200 rounded py-2 mt-4 cursor-pointer hover:bg-pink-400 hover:text-white">
          Chi tiết
        </div>
      </Link>
    </div>
  );
};

export default Product;
