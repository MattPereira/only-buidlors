import React from "react";
// import Link from "next/link";
// import { hardhat } from "viem/chains";
// import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
// import { Faucet } from "~~/components/scaffold-eth";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
// import { useGlobalState } from "~~/services/store/store";
import { socials } from "~~/components/Socials";
// import { SwitchTheme } from "~~/components/SwitchTheme";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";

/**
 * Site footer
 */
export const Footer = () => {
  // const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);
  // const { targetNetwork } = useTargetNetwork();
  // const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <div className="min-h-0 py-1 px-10 border-t border-primary">
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center md:justify-between items-center gap-2 text-lg w-full">
            <div className="hidden md:flex">
              Developed by{" "}
              <a
                className="flex justify-center items-center gap-1 ml-1 underline"
                href="https://matt-pereira.vercel.app/"
                target="_blank"
                rel="noreferrer"
              >
                Matt Pereira
              </a>
            </div>
            <div className="flex gap-2">
              {socials.map(({ url, icon, id }) => (
                <a key={id} href={url} className="inline-block p-1 rounded-full" target="_blank" rel="noreferrer">
                  <span className="">{icon}</span>
                </a>
              ))}
            </div>
            <div className="hidden md:flex justify-center items-center gap-2">
              <p className="m-0 text-center">
                Built with <HeartIcon className="inline-block h-4 w-4" /> at
              </p>
              <a
                className="flex justify-center items-center gap-1"
                href="https://buidlguidl.com/"
                target="_blank"
                rel="noreferrer"
              >
                <BuidlGuidlLogo className="w-3 h-5 pb-1" />
                <span className="link">BuidlGuidl</span>
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
