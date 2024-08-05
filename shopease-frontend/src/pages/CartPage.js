import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data);
      } catch (err) {
        console.error("Error fetching cart items:", err);
      }
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/cart/update",
        { cartItemId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.CartItemId === cartItemId
            ? { ...item, Quantity: newQuantity }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating cart item:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
      }

      await axios.delete("/api/cart/remove", {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.ProductId !== productId)
      );
    } catch (err) {
      console.error("Error removing cart item:", err);
      if (err.response && err.response.status === 401) {
        alert("Unauthorized. Please login again.");
        // Redirect to login page if necessary
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePlaceOrder = () => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    localStorage.setItem("totalPrice", totalPrice);
    localStorage.setItem("totalQuantity", totalQuantity);
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (acc, item) => {
        acc.totalPrice += item.Price * item.Quantity;
        acc.totalQuantity += item.Quantity;
        return acc;
      },
      { totalPrice: 0, totalQuantity: 0 }
    );
  };

  const { totalPrice, totalQuantity } = calculateTotal();

  return (
    <div className="cart-page p-4 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold text-center text-red-300">
        Giỏ hàng của bạn
      </h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600">Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item.CartItemId}
              className="cart-item flex justify-between items-center p-2 border-b"
            >
              <img
                src={item.ImageUrl}
                alt={item.ProductName}
                className="w-16 h-16 rounded-md"
              />
              <div className="cart-item-details flex-grow ml-4">
                <h2 className="text-lg font-semibold">{item.ProductName}</h2>
                <p className="text-gray-600">đ{item.Price.toLocaleString()}</p>
                <div className="quantity-control flex items-center">
                  <button
                    className="px-2 py-1 bg-gray-300 rounded"
                    onClick={() =>
                      handleQuantityChange(item.CartItemId, item.Quantity - 1)
                    }
                    disabled={isUpdating}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.Quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        item.CartItemId,
                        parseInt(e.target.value, 10)
                      )
                    }
                    className="w-12 text-center mx-2 border rounded"
                    min="1"
                    disabled={isUpdating}
                  />
                  <button
                    className="px-2 py-1 bg-gray-300 rounded"
                    onClick={() =>
                      handleQuantityChange(item.CartItemId, item.Quantity + 1)
                    }
                    disabled={isUpdating}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <p className="text-gray-600">
                  đ{(item.Price * item.Quantity).toLocaleString()}
                </p>
                <button
                  className="px-2 py-1 bg-red-300 text-white rounded"
                  onClick={() => handleRemoveItem(item.ProductId)}
                  disabled={isUpdating}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          <div className="cart-summary mt-6 flex justify-between">
            <div>
              <p className="text-lg font-semibold">
                Tổng số lượng: {totalQuantity}
              </p>
              <p className="text-lg font-semibold">
                Tổng thanh toán: {totalPrice.toLocaleString()}đ
              </p>
            </div>
            <Link
              to="/pay"
              state={{
                cartItems,
                totalQuantity,
                totalPrice,
              }}
              onClick={handlePlaceOrder}
            >
              <button
                className="w-fit bg-red-100 text-red-600 py-4 px-8 font-semibold text-[20px] rounded hover:bg-red-300"
                disabled={isUpdating}
              >
                Đặt hàng
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
