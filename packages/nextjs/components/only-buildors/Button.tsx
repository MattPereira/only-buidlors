import { useDarkMode } from "usehooks-ts";

type ButtonProps = {
  onClick?: () => void; // Make onClick optional
  children: React.ReactNode; // children can be any JSX element
  disabled?: boolean; // Make disabled optional
};

/**
 * https://devdojo.com/tailwindcss/buttons
 */
export const Button = ({ onClick, children, disabled }: ButtonProps) => {
  const { isDarkMode } = useDarkMode();

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={` ${
        disabled && "cursor-not-allowed"
      } relative inline-flex items-center justify-center px-10 py-5 text-3xl font-semibold tracking-tighter rounded-full group`}
    >
      <span
        className={`${
          disabled ? "bg-neutral-500" : "bg-accent group-hover:mt-0 group-hover:ml-0"
        } absolute inset-0 w-full h-full mt-3 ml-3 transition-all duration-300 ease-in-out  rounded-full `}
      ></span>
      <span className={`${disabled ? "bg-primary" : "bg-primary"} absolute inset-0 w-full h-full rounded-full`}></span>
      <span
        className={`${
          disabled ? "bg-neutral-500" : "bg-accent group-hover:opacity-100"
        } absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 rounded-full opacity-0 `}
      ></span>
      <span
        className={`${
          disabled
            ? "text-neutral-500"
            : isDarkMode
            ? "text-accent group-hover:text-white"
            : "text-white group-hover:text-white"
        } relative  transition-colors duration-200 ease-in-out delay-100 `}
      >
        {children}
      </span>
    </button>
  );
};
