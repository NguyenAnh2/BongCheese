import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Product from "../components/Product";
import axios from "axios";

const CategoryProductPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get(`/api/products/category/${categoryId}`);
      setProducts(data);
    };
    fetchProducts();
  }, [categoryId]);

  return (
    <div className="container mx-auto">
      <div className="text-3xl font-bold my-4 text-center text-pink-400 select-none">
        Danh sách sản phẩm theo danh mục
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Product key={product.ProductId} product={product} />
        ))}
      </div>
    </div>
  );
};

export default CategoryProductPage;
