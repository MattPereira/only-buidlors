import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import useSWR from "swr";
import { useAccount } from "wagmi";
import { CheckIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Button } from "~~/components/only-buildors/";
import { useDeployedContractInfo, useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth/";

// Define the steps for the minting process outside component to save resources
const steps = [
  {
    number: 1,
    text: <>Send a transaction to on chain NFT contract to send a request to chainlink functions node</>,
  },
  {
    number: 2,
    text: (
      <>
        Wait for chainlink node to execute off chain API call to BuidlGuidl server and relay the response to the NFT
        contract
      </>
    ),
  },
  {
    number: 3,
    text: <>Send a second transaction to NFT contract to mint a members only NFT</>,
  },
];

// Define the subscription ID for the Chainlink functions (specific to each network)
const SUBSCRIPTION_ID = 1905n;

// Define the fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * 1. display latest NFT that has been minted
 * 2. button to send request to chainlink node
 * 3. animation for transaction mining
 * 4. animation for waiting for chainlink functions node to respond
 * 5. button to mint nft
 * 6. animation for transaction mining
 * 7. display the newly minted NFT in spot where button to mint was before
 *
 * @TODO resolve ens name using mainnet contract and plug into sendRequest writeAsync method
 */
const Home: NextPage = () => {
  const [imgSrc, setImgSrc] = useState<string>("/pixel-art.png");
  const [stepsCompleted, setStepsCompleted] = useState(0);

  const { address } = useAccount();

  const {
    writeAsync: sendRequest,
    isLoading: requestTxIsLoading,
    isMining: requestTxIsMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "sendRequest",
    args: [SUBSCRIPTION_ID, [address || ""], "matthu.eth"],
    // blockConfirmations: 1,
    onBlockConfirmation: () => {
      setStepsCompleted(1);
    },
  });

  const {
    writeAsync: mintNft,
    // isLoading: mintIsLoading,
    // isMining: mintIsMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "mintNft",
    onBlockConfirmation: () => {
      setStepsCompleted(3);
    },
  });

  const { data: buidlCount } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getBuidlCount",
    args: [address || ""],
  });

  const { data: hasMinted } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getHasMinted",
    args: [address || ""],
  });

  const { data: onlyBuildorsNftContract } = useDeployedContractInfo("OnlyBuidlorsNft");

  // only make the request if the eoa and contract address are defined AND the user has minted an NFT
  const getNftForOwnerUrl =
    address && onlyBuildorsNftContract?.address && hasMinted
      ? `/api/get-nft-for-owner?eoaAddress=${address}&nftContract=${onlyBuildorsNftContract?.address}`
      : null;

  const { data: nftData, error: nftError } = useSWR(getNftForOwnerUrl, fetcher);

  if (nftError) {
    console.log("nftError", nftError);
  }

  // only change the image source if the nftData has been successfully fetched
  useEffect(() => {
    if (nftData) {
      try {
        const decodedString = Buffer.from(nftData.raw.tokenUri, "base64").toString("utf-8");
        const metadata = JSON.parse(decodedString);
        setImgSrc(metadata.image);
      } catch (e) {
        console.log("error", e);
      }
    }
  }, [nftData]);

  // Do I need a state variable in contract to track if member has completed SendRequest (step 1)?
  // How to track when chainlink node has responsed to the request?
  useEffect(() => {
    if (hasMinted) {
      setImgSrc("/pixel-art.png"); // CHANGE TO SHOWING THE NFT IMAGE
      setStepsCompleted(3);
    } else if (buidlCount && buidlCount > 0n) {
      setImgSrc("/step-3.jpg");
      setStepsCompleted(2);
    } else if (stepsCompleted === 1) {
      setImgSrc("/step-2.jpg");
    } else if (requestTxIsMining || requestTxIsLoading) {
      setImgSrc("/step-1.jpg");
    } else {
      setImgSrc("/pixel-art.png");
    }
  }, [hasMinted, buidlCount, requestTxIsMining, requestTxIsLoading, stepsCompleted]);

  // only make the request if the eoa and contract address are defined AND the user has minted an NFT
  const bgBuildersUrl = address ? `https://buidlguidl-v3.appspot.com/builders/${address}` : null;

  const { data: isBuilder, error: isBuilderError } = useSWR(bgBuildersUrl, fetcher, {
    shouldRetryOnError: false, // Do not retry on error
    onError: error => {
      if (error.status === 404) {
        // Handle the 404 error specifically
        console.error("Builder ddress not found in database:", error.info);
      }
    },
  });

  if (isBuilderError) {
    console.log("isBuilderError", isBuilderError);
  }

  return (
    <>
      <MetaHeader />
      <section className="p-5 md:p-10 lg:px-16 2xl:p-24 grow flex flex-col">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-14 pb-20 items-end border-b border-primary">
          <div className="flex justify-center lg:justify-start">
            <div>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-lucky">
                <div>ONLY</div> BUIDLORS
              </h1>
              <div className="text-xl sm:text-2xl xl:text-3xl">
                A dynamic SVG NFT collection for BuidlGuidl members only.
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src={imgSrc}
              width={800}
              height={700}
              alt="dynamic image of minting proccess and final NFT"
              className="rounded-xl"
            />
          </div>
        </div>

        <div className="grow flex flex-col items-center justify-center py-10">
          {isBuilder ? (
            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-20 items-center">
              <div>
                {steps.map(step => (
                  <div key={step.number} className="text-2xl flex gap-4 mb-8 items-start">
                    <div
                      style={{ minWidth: "40px" }}
                      className={`${
                        stepsCompleted >= step.number ? "bg-green-600" : "bg-primary"
                      } font-bold w-10 h-10 flex items-center justify-center rounded-full text-primary-content`}
                    >
                      {stepsCompleted >= step.number ? <CheckIcon className="w-6 h-6 text-white" /> : step.number}
                    </div>
                    <div>{step.text}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center items-center">
                {hasMinted ? (
                  <Link href="/collection">
                    <Button>View Collection</Button>
                  </Link>
                ) : buidlCount && buidlCount > 0n ? (
                  <Button onClick={() => mintNft()}>Mint NFT</Button>
                ) : (
                  <Button onClick={() => sendRequest()} disabled={stepsCompleted >= 1}>
                    {stepsCompleted >= 1 ? "Request proccessing..." : "Send Request"}
                  </Button>
                )}
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
