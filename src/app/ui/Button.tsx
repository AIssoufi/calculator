import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "operator" | "func" | "number";
};

export default function Button({
  variant = "number",
  className,
  children,
  onClick,
}: ButtonProps) {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx("flex justify-center items-center", {
          "bg-gray-200": variant === "number",
          "bg-orange-300": variant === "operator",
          "bg-gray-300": variant === "func",
        }),
        className
      )}
    >
      {children}
    </div>
  );
}
