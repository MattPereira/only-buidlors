import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth/";

const steps = [
  {
    number: 1,
    text: <>Send a transaction to NFT contract to initiate a request to chainlink functions node</>,
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

const SUBSCRIPTION_ID = 11n;

/**
 * 1. display latest NFT that has been minted
 * 2. button to send request to chainlink node
 * 3. animation for transaction mining
 * 4. animation for waiting for chainlink functions node to respond
 * 5. button to mint nft
 * 6. animation for transaction mining
 * 7. display latest NFT that has been minted
 * 8. button to see the full collection
 */
const Home: NextPage = () => {
  const { address } = useAccount();

  const {
    writeAsync: sendRequest,
    // isLoading,
    // isMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "sendRequest",
    args: [SUBSCRIPTION_ID, [address || ""], "matthu.eth"],
    // blockConfirmations: 1,
    // onBlockConfirmation: txnReceipt => {
    //   console.log("Transaction blockHash", txnReceipt.blockHash);
    // },
  });

  const {
    writeAsync: mintNft,
    // isLoading: mintIsLoading,
    // isMining: mintIsMining,
  } = useScaffoldContractWrite({
    contractName: "OnlyBuidlorsNft",
    functionName: "mintNft",
    // blockConfirmations: 1,
    // onBlockConfirmation: txnReceipt => {
    //   console.log("Transaction blockHash", txnReceipt.blockHash);
    // },
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
              src="/pixel-art.png"
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
                  className="border-2 font-bold border-primary w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-content"
                >
                  {step.number}
                </div>
                <div>{step.text}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center items-center">
            {hasMinted ? (
              <button className="btn btn-primary btn-lg btn-outline px-10 text-2xl">See Collection</button>
            ) : buidlCount && buidlCount > 0n ? (
              <button className="btn btn-primary btn-lg btn-outline px-10 text-2xl" onClick={() => mintNft()}>
                Mint NFT
              </button>
            ) : hasMinted ? (
              <button>See Collection</button>
            ) : (
              <button className="btn btn-primary btn-lg btn-outline px-10 text-2xl" onClick={() => sendRequest()}>
                Send Request
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
