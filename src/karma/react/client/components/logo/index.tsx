import React from "react";

export const Logo = ({
  primary = "",
  secondary = "",
  size = "1rem",
  fontProps = {},
  iconOnly = false,
}) => {
  const logoStyle = {
    width: `calc(${size} + 20px)`,
    height: `calc(${size} + 20px)`,
  } as const;
  const primaryStyle = {
    fontWeight: "normal",
    fontFamily: "PT Sans",
    fontSize: size,
    paddingLeft: "10px",
    ...fontProps,
  } as const;
  const secondaryStyle = {
    fontWeight: "bold",
    fontFamily: "PT Sans",
    fontSize: size,
    ...fontProps,
  } as const;
  const containerStyle = {
    display: "flex",
    flexDirection: "row",
    alignContent: "center",
    alignItems: "flex-end",
  } as const;
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
