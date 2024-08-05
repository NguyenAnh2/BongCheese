import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PayPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("");
  const navigate = useNavigate();

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod) {
      // Assuming you have cart data in local storage or state
      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      const totalPrice = JSON.parse(localStorage.getItem("totalPrice")) || 0;
      const totalQuantity =
        JSON.parse(localStorage.getItem("totalQuantity")) || 0;

      navigate("/order-summary", {
        state: {
          paymentMethod,
          cartItems,
          totalPrice,
          totalQuantity,
        },
      });
    } else {
      alert("Please select a payment method.");
    }
  };

  return (
    <div className="pay-page p-4 bg-white shadow rounded-lg">
      <h1 className="text-xl font-bold text-center text-red-300">
        Chọn phương thức thanh toán 
      </h1>
      <form onSubmit={handleSubmit} className="payment-form mt-4">
        <div className="payment-option mb-4">
          <input
            type="radio"
            id="bankCard"
            name="paymentMethod"
            value="Thẻ ngân hàng"
            checked={paymentMethod === "Thẻ ngân hàng"}
            onChange={handlePaymentChange}
            className="mr-2"
          />
          <label htmlFor="bankCard" className="text-gray-600">
            Thẻ ngân hàng
          </label>
        </div>
        <div className="payment-option mb-4">
          <input
            type="radio"
            id="momo"
            name="paymentMethod"
            value="MoMo"
            checked={paymentMethod === "MoMo"}
            onChange={handlePaymentChange}
            className="mr-2"
          />
          <label htmlFor="momo" className="text-gray-600">
            MoMo
          </label>
        </div>
        <div className="payment-option mb-4">
          <input
            type="radio"
            id="directPayment"
            name="paymentMethod"
            value="Thanh toán khi nhận hàng"
            checked={paymentMethod === "Thanh toán khi nhận hàng"}
            onChange={handlePaymentChange}
            className="mr-2"
          />
          <label htmlFor="directPayment" className="text-gray-600">
            Thanh toán khi nhận hàng
          </label>
        </div>
        {paymentMethod ? (
          <button
            type="submit"
            className="w-full bg-red-300 text-white py-2 mt-4 rounded hover:bg-red-400"
          >
            Thanh toán
          </button>
        ) : (
          <button
            type="button"
            className="w-full bg-red-300 text-white py-2 mt-4 rounded cursor-not-allowed"
          >
            Vui lòng chọn phương thức thanh toán
          </button>
        )}
      </form>
    </div>
  );
};

export default PayPage;
