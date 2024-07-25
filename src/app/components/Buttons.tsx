"use client";

import { FC } from "react";
import clsx from "clsx";

interface ButtonProps {
  type?: "button" | "submit" | "reset" | undefined;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  useDiv?: boolean;
}

const Button: FC<ButtonProps> = ({
  type = "button",
  fullWidth = false,
  children,
  onClick,
  secondary = false,
  danger = false,
  disabled = false,
  useDiv = false,
}) => {
  if (useDiv) {
    return (
      <div
        onClick={onClick}
        className={clsx(
          `
        flex
        justify-center
        rounded-md
        px-3
        py-2
        text-sm
        font-semibold
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
      `,
          disabled && "opacity-50 cursor-default",
          fullWidth && "w-full",
          secondary ? "text-gray-900" : "text-white",
          danger &&
            "bg-red-500 hover:bg-rose-600 focus-visible:outline-rose-600",
          !secondary &&
            !danger &&
            "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600",
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={clsx(
        `
        flex
        justify-center
        rounded-md
        px-3
        py-2
        text-sm
        font-semibold
        focus-visible:outline
        focus-visible:outline-2
        focus-visible:outline-offset-2
      `,
        disabled && "opacity-50 cursor-default",
        fullWidth && "w-full",
        secondary ? "text-gray-900" : "text-white",
        danger && "bg-red-500 hover:bg-rose-600 focus-visible:outline-rose-600",
        !secondary &&
          !danger &&
          "bg-sky-500 hover:bg-sky-600 focus-visible:outline-sky-600",
      )}
    >
      {children}
    </button>
  );
};

export default Button;
