import { useEffect } from "react";
import { useDarkMode, useIsMounted } from "usehooks-ts";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { isDarkMode, toggle } = useDarkMode();
  const isMounted = useIsMounted();

  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", isDarkMode ? "scaffoldEthDark" : "scaffoldEth");
  }, [isDarkMode]);

  return (
    <div className={`flex ml-3 ${className}`}>
      {/* <input
        id="theme-toggle"
        type="checkbox"
        className="toggle toggle-primary bg-primary"
        onChange={toggle}
        checked={isDarkMode}
      /> */}
      {isMounted() && (
        <label
          onClick={toggle}
          htmlFor="theme-toggle"
          className={`swap swap-rotate ${!isDarkMode ? "swap-active" : ""}`}
        >
          <SunIcon className="swap-on h-7 w-7" />
          <MoonIcon className="swap-off h-7 w-7" />
        </label>
      )}
    </div>
  );
};
