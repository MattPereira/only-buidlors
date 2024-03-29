import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import useSWR from "swr";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { CheckIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Button } from "~~/components/only-buildors/";
import {
  useDeployedContractInfo,
  useScaffoldContractRead,
  useScaffoldContractWrite,
  useScaffoldEventSubscriber,
} from "~~/hooks/scaffold-eth/";
import BuidlGuidlIcon from "~~/public/bg-logo.svg";

// Define the steps for the minting process outside component to save resources
const steps = [
  {
    number: 1,
    text: " Send a transaction to the NFT contract that emits an event which chainlink function nodes are listening for",
  },
  {
    number: 2,
    text: "Wait for chainlink node to execute off chain API call to BuidlGuidl server and relay the response to the NFT contract",
  },
  {
    number: 3,
    text: "Send a second transaction to the NFT contract to mint your OnlyBuidlors NFT",
  },
];

// Define the subscription ID for the Chainlink functions (specific to each network)
const SUBSCRIPTION_ID = 11n; // arb-sepolia

// Define the fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

// Create a public client for querying ENS names
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Home page handles minting NFT for eligable users
 */
const Home: NextPage = () => {
  const [imgSrc, setImgSrc] = useState<string>("/pixel-art.jpg");
  const [stepsCompleted, setStepsCompleted] = useState(0);
  const [ensName, setEnsName] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(1); // State for controlling opacity of image
  console.log("stepsCompleted", stepsCompleted);

  const { address } = useAccount();

  // Save ENS name to state for arg in the minting NFT transaction
  useEffect(() => {
    const fetchEnsName = async () => {
      if (address) {
        try {
          const ensName = await publicClient.getEnsName({ address: address });
          setEnsName(ensName);
        } catch (error) {
          console.error("Error fetching ENS name:", error);
        }
      }
    };

    fetchEnsName();
  }, [address]);

  /*** Read Contract ***/
  const { data: onlyBuildorsNftContract } = useDeployedContractInfo("OnlyBuidlorsNft");

  const { data: buidlCount } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getBuidlCount",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  const { data: hasMinted } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getHasMinted",
    args: [address || "0x0000000000000000000000000000000000000000"],
  });

  /*** Event Subscribers ***/
  useScaffoldEventSubscriber({
    contractName: "OnlyBuidlorsNft",
    eventName: "Response",
    listener: () => {
      setStepsCompleted(2);
    },
  });

  useScaffoldEventSubscriber({
    contractName: "OnlyBuidlorsNft",
    eventName: "Minted",
    listener: () => {
      setStepsCompleted(3);
    },
  });

  /*** API requests ***/

  // Only make BuidlGuidl API Request if the eoa and contract address are defined AND the user has minted an NFT
  const bgBuildersUrl = address ? `https://buidlguidl-v3.appspot.com/builders/${address}` : null;
  const { data: isBuilder, error: isBuilderError } = useSWR(bgBuildersUrl, fetcher, {
    shouldRetryOnError: false, // Do not retry on error
    onError: error => {
      if (error.status === 404) {
        console.error("Builder ddress not found in database:", error.info);
      }
    },
  });
  if (isBuilderError) {
    console.log("isBuilderError", isBuilderError);
  }

  // Only make NFT collection request to Alchemy API if eoa and contract address are defined AND the user has minted an NFT
  const getNftForOwnerUrl =
    address && onlyBuildorsNftContract?.address && (hasMinted || stepsCompleted === 3)
      ? `/api/get-nft-for-owner?eoaAddress=${address}&nftContract=${onlyBuildorsNftContract?.address}`
      : null;
  const { data: nftData, error: nftError } = useSWR(getNftForOwnerUrl, fetcher);
  if (nftError) {
    console.log("nftError", nftError);
  }

  /*** Write Contract ***/
  const {
    writeAsync: sendRequest,
    isLoading: requestTxIsLoading,
    isMining: requestTxIsMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "sendRequest",
    args: [SUBSCRIPTION_ID, [address || "0x000"], ensName || ""],
    onBlockConfirmation: () => {
      if (stepsCompleted === 0) {
        setStepsCompleted(1);
      }
    },
  });

  const {
    writeAsync: mintNft,
    isLoading: mintIsLoading,
    isMining: mintIsMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "mintNft",
    onBlockConfirmation: () => {
      if (stepsCompleted !== 3) {
        setStepsCompleted(3);
      }
    },
  });

  // Controls the image/button displayed based on the state of the minting process
  useEffect(() => {
    const updateImageWithFade = async (newSrc: string) => {
      setOpacity(0); // Fade out current image
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for fade-out
      setImgSrc(newSrc); // Set new image source
      setOpacity(1); // Fade in new image
    };

    if (hasMinted || stepsCompleted === 3) {
      if (stepsCompleted !== 3) {
        setStepsCompleted(3);
      }
      if (nftData) {
        try {
          const decodedString = Buffer.from(nftData.raw.tokenUri, "base64").toString("utf-8");
          const metadata = JSON.parse(decodedString);
          updateImageWithFade(metadata.image);
        } catch (e) {
          console.log("error", e);
        }
      }
    } else if (buidlCount && buidlCount > 0n) {
      setStepsCompleted(2);
      updateImageWithFade("/step-3.jpg");
    } else if (stepsCompleted === 1) {
      updateImageWithFade("/step-2.jpg");
    } else if ((requestTxIsMining || requestTxIsLoading) && stepsCompleted === 0) {
      updateImageWithFade("/step-1.jpg");
    } else {
      updateImageWithFade("/pixel-art.jpg");
    }
  }, [hasMinted, buidlCount, requestTxIsMining, requestTxIsLoading, stepsCompleted, nftData]);

  return (
    <>
      <MetaHeader />
      <section className="p-5 md:p-10 lg:px-16 2xl:p-24 grow flex flex-col">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-14 pb-20 items-end border-b border-primary">
          <div>
            <div className="flex justify-center lg:justify-start">
              <div className="mr-5 w-[120px] h-[120px] lg:w-[200px] lg:h-[300px]">
                <BuidlGuidlIcon alt="github icon" />
              </div>
              <div className="mt-5 lg:mt-20">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-lucky">
                  <div>ONLY</div> BUIDLORS
                </h1>
              </div>
            </div>
            <div className="text-xl sm:text-2xl xl:text-3xl">A dynamic SVG NFT collection for the BuidlGuidl</div>
          </div>

          <div className="flex justify-center">
            <Image
              src={imgSrc}
              width={800}
              height={700}
              alt="dynamic image of minting proccess and final NFT"
              className="rounded-xl transition-opacity duration-1000"
              style={{ opacity }} // apply dynamic opacity based on state
            />
          </div>
        </div>

        <div className="grow flex flex-col items-center justify-center py-10">
          {isBuilder ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-20 items-center">
              <div>
                {steps.map(step => (
                  <div key={step.number} className="text-2xl flex gap-4 mb-8 items-start">
                    <div
                      style={{ minWidth: "55px" }}
                      className={`${
                        stepsCompleted >= step.number ? "bg-green-600" : "bg-base-300"
                      } border-2 border-base-content text-3xl font-bold w-[55px] h-[55px] flex items-center justify-center rounded-full text-base-content`}
                    >
                      {stepsCompleted >= step.number ? <CheckIcon className="w-8 h-8 text-primary" /> : step.number}
                    </div>
                    <div>{step.text}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center items-center">
                {hasMinted || stepsCompleted === 3 ? (
                  <Link href="/collection">
                    <Button>View Collection</Button>
                  </Link>
                ) : buidlCount && buidlCount > 0n ? (
                  <Button disabled={mintIsLoading || mintIsMining} onClick={() => mintNft()}>
                    {mintIsLoading || mintIsMining ? (
                      <div className="flex gap-2">
                        Minting<span className="loading loading-dots loading-lg"></span>
                      </div>
                    ) : (
                      "Mint NFT"
                    )}
                  </Button>
                ) : (
                  <Button onClick={() => sendRequest()} disabled={stepsCompleted >= 1}>
                    {stepsCompleted >= 1 ? (
                      <div className="flex gap-2">
                        Request proccessing<span className="loading loading-dots loading-lg"></span>
                      </div>
                    ) : (
                      "Send Request"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <InvalidAddressExplanation />
          )}
        </div>
      </section>
    </>
  );
};

export default Home;

/**
 * Shows if wallet not connected or address not associated with a BuidlGuidl profile
 */
const InvalidAddressExplanation = () => {
  return (
    <div className="text-xl sm:text-2xl xl:text-3xl text-center">
      <div className="mb-10">
        Connect the wallet associated with your{" "}
        <a
          className="underline text-accent"
          target="_blank"
          rel="noopener noreferrer"
          href="https://app.buidlguidl.com/builders/0x41f727fA294E50400aC27317832A9F78659476B9"
        >
          BuidlGuidl profile
        </a>{" "}
        to mint an NFT
      </div>
      <div>
        If you are not a member yet, join us by the completing challenges at{" "}
        <a
          className="underline text-accent"
          target="_blank"
          rel="noopener noreferrer"
          href="https://speedrunethereum.com/"
        >
          Speedrun Ethereum
        </a>
      </div>
    </div>
  );
};
