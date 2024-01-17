import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Button } from "~~/components/only-buildors/";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth/";

const steps = [
  {
    number: 1,
    text: <>Send a transaction to NFT contract to initiate a request to chainlink functions node</>,
  },
  {
    number: 2,
    text: (
      <>Wait for chainlink node to execute off chain API call to BuidlGuidl server and respond to the NFT contract</>
    ),
  },
  {
    number: 3,
    text: <>Send a second transaction to NFT contract to mint a members only NFT</>,
  },
];

const SUBSCRIPTION_ID = 1905n;

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

  useEffect(() => {
    const fetchNftData = async () => {
      try {
        const response = await fetch("/api/get-nft-for-owner");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data.raw.tokenUri);
        const decodedString = atob(data.raw.tokenUri);
        const metadata = JSON.parse(decodedString);
        console.log("metadata", metadata);
        setImgSrc(metadata.image);
      } catch (e) {
        console.log("error", e);
      }
    };

    fetchNftData();
  }, []);

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

  const { data: hasMinted } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getHasMinted",
    args: [address || ""],
  });

  const { data: buidlCount } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "getBuidlCount",
    args: [address || ""],
  });
  console.log("stepsCompleted", stepsCompleted);

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

  return (
    <>
      <MetaHeader />
      {/* <section className="grow flex flex-col justify-end items-end"> */}
      <section>
        <div className="p-5 md:p-10 lg:px-16 2xl:p-24">
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-14 pb-14 items-end border-b border-primary">
            <div>
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-lucky">
                <div>ONLY</div> BUIDLORS
              </h1>
              <div className="text-xl lg:text-2xl xl:text-3xl">
                A dynamic SVG NFT collection for BuidlGuidl members only.
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
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 items-center my-14">
            <div>
              {steps.map(step => (
                <div key={step.number} className="text-2xl flex gap-4 mb-5 items-start">
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
        </div>
      </section>
    </>
  );
};

export default Home;
