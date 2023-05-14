import React from "react";

export const Logo = ({
  primary = "",
  secondary = "",
  size = "1rem",
  fontProps = {},
  iconOnly = false
}) => {
  const logoStyle = {
    width: `calc(${size} + 20px)`,
    height: `calc(${size} + 20px)`
  };
  const primaryStyle = {
    fontWeight: "normal",
    fontFamily: "PT Sans",
    fontSize: size,
    paddingLeft: "10px",
    ...fontProps
  };
  const secondaryStyle = {
    fontWeight: "bold",
    fontFamily: "PT Sans",
    fontSize: size,
    ...fontProps
  };
  const containerStyle = {
    display: "flex" as const,
    flexDirection: 'row' as const,
    alignContent: "center",
    alignItems: "flex-end"
  };
  return (
    <div style={containerStyle}>
      <img
        alt={`${primary}-${secondary}`}
        src="/SVG/default.svg"
        style={logoStyle}
      />
      {!iconOnly && (
        <>
          <span style={primaryStyle}>{primary}</span>
          <span style={secondaryStyle}>{secondary}</span>
        </>
      )}
    </div>
  );
};
