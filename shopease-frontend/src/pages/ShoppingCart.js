import React, { useState, useEffect } from "react";
import axios from "axios";

const ShoppingCart = ({ userId }) => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      const { data } = await axios.get(`/api/cart/${userId}`);
      setCart(data.cart);
      setCartItems(data.cartItems);
    };
    fetchCart();
  }, [userId]);

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-4 text-center text-pink-400 select-none">
        Giỏ hàng của bạn
      </h1>
      {cartItems.length > 0 ? (
        <ul>
          {cartItems.map((item) => (
            <li key={item.CartItemId}>
              Sản phẩm: {item.ProductId} - Số lượng: {item.Quantity}
            </li>
          ))}
        </ul>
      ) : (
        <p>Giỏ hàng của bạn đang trống.</p>
      )}
    </div>
  );
};

export default ShoppingCart;
