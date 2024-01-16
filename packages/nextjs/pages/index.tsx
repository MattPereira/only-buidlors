import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CheckIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { Button } from "~~/components/only-buildors/";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth/";

const INITIAL_STEPS_STATE = [
  {
    number: 1,
    text: <>Send a transaction to NFT contract to initiate a request to chainlink functions node</>,
    completed: false,
  },
  {
    number: 2,
    text: <>Wait for chainlink node to execute off chain API call and respond to the NFT smart contract</>,
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
 */
const Home: NextPage = () => {
  const [imgSrc, setImgSrc] = useState<string>("/pixel-art.png");
  const [steps, setSteps] = useState(INITIAL_STEPS_STATE);
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
      completeStep(1);
    },
  });

  const completeStep: any = (stepNumber: any) => {
    setSteps(prevSteps => prevSteps.map(step => (step.number === stepNumber ? { ...step, completed: true } : step)));
  };

  const {
    writeAsync: mintNft,
    // isLoading: mintIsLoading,
    // isMining: mintIsMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "mintNft",
    onBlockConfirmation: () => {
      completeStep(3);
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

  useEffect(() => {
    if (hasMinted) {
      setImgSrc("/pixel-art.png");
      completeStep(1);
      completeStep(2);
      completeStep(3);
    } else if (buidlCount && buidlCount > 0n) {
      completeStep(1);
      completeStep(2);
      setImgSrc("/step-3.jpg");
    } else if (requestTxIsMining || requestTxIsLoading) {
      setImgSrc("/step-1.jpg");
    } else {
      setImgSrc("/pixel-art.png");
    }
  }, [hasMinted, buidlCount, requestTxIsMining, requestTxIsLoading]);

  return (
    <>
      <MetaHeader />
      <section className="p-5 md:p-10 xl:p-14">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 pb-14 items-end border-b border-primary">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold">
              <div>ONLY</div> BUIDLORS
            </h1>
            <div className="text-xl lg:text-2xl xl:text-3xl">
              A dynamic SVG NFT collection for BuidlGuidl members only.
            </div>
          </div>
          <div className="flex justify-center">
            <Image
              src={imgSrc}
              width={10000}
              height={10000}
              alt="builders constructing a castle"
              className="rounded-xl"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 items-center my-14">
          <div>
            {steps.map(step => (
              <div key={step.number} className="text-2xl flex gap-4 mb-5 items-center">
                <div
                  style={{ minWidth: "40px" }}
                  className={`${
                    step.completed ? "bg-green-600" : "bg-primary"
                  } font-bold w-10 h-10 flex items-center justify-center rounded-full text-primary-content`}
                >
                  {step.completed ? <CheckIcon className="w-6 h-6 text-white" /> : step.number}
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
              <Button onClick={() => sendRequest()}>Send Request</Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
