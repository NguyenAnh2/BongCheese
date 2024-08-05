import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "../components/Product";
import { useLocation } from "react-router-dom";

const SearchPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();

  // Parse query string
  const query = new URLSearchParams(location.search).get("query");

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query) return;

      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          `http://localhost:5000/api/products/search?productName=${query}`
        );
        setProducts(response.data);
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div className="search-page container mx-auto p-4">
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <div className="product-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Product key={product.ProductId} product={product} />
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
