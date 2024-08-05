import React from "react";

const CustomArrow = ({ className, style, onClick, direction }) => {
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(201, 201, 201, 0.8)",
        cursor: "pointer",
        width: "30px",
        height: "30px",
        borderRadius: "4px",
        zIndex: 1,
      }}
      onClick={onClick}
    >
      {direction === "next" ? ">" : "<"}
    </div>
  );
};

export default CustomArrow;
