type ButtonProps = {
  onClick?: () => void; // Make onClick optional
  children: React.ReactNode; // children can be any JSX element
};

/**
 * https://devdojo.com/tailwindcss/buttons
 */
export const Button = ({ onClick, children }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="relative inline-flex items-center justify-center px-10 py-5 text-2xl font-medium tracking-tighter text-white bg-gray-800 rounded-full group"
    >
      <span className="absolute inset-0 w-full h-full mt-3 ml-3 transition-all duration-300 ease-in-out bg-accent rounded-full group-hover:mt-0 group-hover:ml-0"></span>
      <span className="absolute inset-0 w-full h-full bg-primary rounded-full "></span>
      <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-accent rounded-full opacity-0 group-hover:opacity-100 "></span>
      <span className="relative text-accent transition-colors duration-200 ease-in-out delay-100 group-hover:text-white">
        {children}
      </span>
    </button>
  );
};
