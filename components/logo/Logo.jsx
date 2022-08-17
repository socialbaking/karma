import React from "react";
import Image from 'next/image'
import DefaultLogo from "../../public/SVG/default.svg";

const Logo = ({
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
    display: "flex",
    flexDirection: "row",
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
            {/* <Image className={logoStyle} src={DefaultLogo} width={50} height={50} alt="CannaSPY Logo" /> */}
      {/* <Image className="justify-self-center" src={DefaultLogo} style={logoStyle} alt="CannaSPY Logo" /> */}
      {!iconOnly && (
        <>
          <span style={primaryStyle}>{primary}</span>
          <span style={secondaryStyle}>{secondary}</span>
        </>
      )}
    </div>
  );
};

export { Logo };
