import { IconProps } from "./types";

export interface SvgTextIconProps extends IconProps {
  text: string;
}

export function SvgTextIcon({ text, ...props }: SvgTextIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
      {...props}
      dangerouslySetInnerHTML={{
        __html: text,
      }}
    />
  );
}
