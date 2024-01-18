import React, { useCallback, useRef, useState } from "react";
// import Image from "next/image";
import Link from "next/link";
import { useDarkMode } from "usehooks-ts";
// import { useRouter } from "next/router";
import { Bars3Icon, BugAntIcon, BuildingLibraryIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import BuidlGuidlIcon from "~~/public/bg-logo.svg";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Mint",
    href: "/",
    icon: <BuildingLibraryIcon className="h-5 w-5" />,
  },
  {
    label: "Collection",
    href: "/collection",
    icon: <PhotoIcon className="h-5 w-5" />,
  },
  {
    label: "Debug Contracts",
    href: "/debug",
    icon: <BugAntIcon className="h-5 w-5" />,
  },
];

export const HeaderMenuLinks = () => {
  // const router = useRouter();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        // const isActive = router.pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`
              text-xl active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const { isDarkMode } = useDarkMode();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );
  console.log("isDarkMode", isDarkMode);

  return (
    <div
      className={`bg-base-300 sticky border-b border-primary lg:static top-0 navbar min-h-0 flex-shrink-0 justify-between z-20 px-0 sm:px-2`}
    >
      <div className="navbar-start w-auto lg:w-1/2">
        <div className="lg:hidden dropdown" ref={burgerMenuRef}>
          <label
            tabIndex={0}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={() => {
              setIsDrawerOpen(prevIsOpenState => !prevIsOpenState);
            }}
          >
            <Bars3Icon className="h-1/2" />
          </label>
          {isDrawerOpen && (
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 bg-base-100 rounded-box w-52"
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              <HeaderMenuLinks />
            </ul>
          )}
        </div>
        <Link href="/" passHref className="hidden lg:flex items-center gap-1 ml-4 mr-6 shrink-0">
          <div>
            <BuidlGuidlIcon width={35} height={35} alt="github icon" />
          </div>
          <div className="font-lucky text-3xl mt-4">ONLY BUIDLORS</div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
        <SwitchTheme />
      </div>
    </div>
  );
};
