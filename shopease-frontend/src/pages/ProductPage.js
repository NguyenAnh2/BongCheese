import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const ProductPage = () => {
  const [product, setProduct] = useState({});
  const [toggleWishlist, setToggleWishlist] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const rating = Math.floor(Math.random() * 5) + 1;
  const { id: productId } = useParams();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${productId}`, {
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });
        setProduct(data);
      } catch (error) {
        console.error("Error fetching the product data", error);
      }
    };
    fetchProduct();
  }, [productId]);

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
        alert("Vui lòng đăng nhập để thêm vào danh sách yêu thích!");
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
          const token = localStorage.getItem("token");
          const response = await axios.get("/api/wishlist/check", {
            headers: { Authorization: `Bearer ${token}` },
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
    <div className="shadow product-card container mx-auto p-4 w-2/4">
      <div className="flex flex-col p-6 shadow rounded-md border-solid border-2 border-pink-500">
        <h1 className="text-3xl font-bold mb-4 text-center text-red-500">
          {product.ProductName}
        </h1>
        {product.ImageUrl && (
          <img
            src={product.ImageUrl}
            alt={product.Name}
            className="w-64px h-full object-cover mb-4"
          />
        )}
        <div className="flex justify-between items-center">
          <h2 className="text-[24px] mb-3 text-pink-600 overflow-hidden whitespace-nowrap overflow-ellipsis">
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
          <ul className="flex items-center ">
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
      </div>
    </div>
  );
};

export default ProductPage;
