import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import Product from "../components/Product";
import CustomArrow from "../components/CustomArrow";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [categories, setCategories] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await axios.get("/api/products/");
      const categoriesResponse = await axios.get("/api/categories/");
      setProducts(data);
      setCategories(
        categoriesResponse.data.reduce((acc, category) => {
          acc[category.CategoryId] = category.CategoryName;
          return acc;
        }, {})
      );
      groupProductsByCategory(data);
    };
    fetchProducts();
  }, []);

  const groupProductsByCategory = (products) => {
    const grouped = products.reduce((acc, product) => {
      const category = product.CategoryId;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    setGroupedProducts(grouped);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    nextArrow: <CustomArrow direction="next" />,
    prevArrow: <CustomArrow direction="prev" />,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold my-4 text-center text-pink-400 select-none">
        Trang chủ
      </h1>
      <div className="container mx-auto mb-8">
        <h1 className="text-2xl font-bold my-4 text-center text-pink-400 select-none">
          Sản phẩm bán chạy
        </h1>
        <Slider {...settings}>
          {products.slice(0, 10).map((product) => (
            <div key={product.ProductId}>
              <Product product={product} />
            </div>
          ))}
        </Slider>
      </div>
      {Object.keys(groupedProducts).map((categoryId) => (
        <div key={categoryId} className="border-t border-solid border-t-stone-600">
          <h2 className="text-3xl font-bold my-6 text-center text-red-500 select-none">
            {categories[categoryId]}
          </h2>
          <Slider {...settings}>
            {groupedProducts[categoryId].map((product) => (
              <div key={product.ProductId}>
                <Product product={product} />
              </div>
            ))}
          </Slider>
          <div className="my-8 py-2 px-4 text-[20px] font-bold text-center bg-pink-300 hover:bg-pink-400 text-white select-none cursor-pointer w-fit mx-auto">
            <Link to={`/category/${categoryId}`} className="">
              Xem thêm {categories[categoryId]}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePage;
