import React from "react";
import { Link } from "react-router-dom";

const Navigate = () => {
  const liNavStyle = "text-[18px] text-center py-2 px-4 hover:bg-orange-300 hover:text-violet-600 cursor-pointer"
  return (
    <div>
      <ul
        className={`flex w-full justify-center bg-pink-500 items-center md:flex flex-col md:flex-row`}
      >
        <li className={liNavStyle}>
          <Link to="/" className="text-white font-medium ">
            Trang chủ
          </Link>
        </li>
        <li className={liNavStyle}>
          <Link to="/category/1" className="text-white font-medium ">
            Gấu cho bé
          </Link>
        </li>
        <li className={liNavStyle}>
          <Link to="/category/2" className="text-white font-medium ">
            Gấu cho "Nóc nhà"
          </Link>
        </li>
        <li className={liNavStyle}>
          <Link to="/category/3" className="text-white font-medium ">
            Gấu tốt nghiệp trường "đời"
          </Link>
        </li>
        {/* <li className={liNavStyle}>
          <Link to="/hoakhongtan" className="text-white font-medium ">
            Hoa không tàn
          </Link>
        </li> */}
        <li className={liNavStyle}>
          <Link to="/product" className="text-white font-medium ">
            Tất cả sản phẩm
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navigate;
