import React from "react";

const Service = () => {
  const serviceItemStyle = "text-xl text-pink-500 font-semibold ";
  return (
    <div className="w-full h-24 flex justify-center shadow-md border-t-gray-400">
      <div className="w-10/12 bg-white flex justify-around items-center">
        <p className={serviceItemStyle}>Service</p>
        <p className={serviceItemStyle}>Service</p>
        <p className={serviceItemStyle}>Service</p>
        <p className={serviceItemStyle}>Service</p>
      </div>
    </div>
  );
};

export default Service;
