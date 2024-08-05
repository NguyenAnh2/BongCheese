import React, { useState, useEffect } from "react";
import Product from '../components/Product';
import axios from "axios";

const FullProductPage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get("/api/products/");
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto">
      <div className="text-3xl font-bold my-4 text-center text-pink-400 select-none">Danh sách sản phẩm</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Product key={product.ProductId} product={product} />
        ))}
      </div>
    </div>
  );
};

export default FullProductPage;
