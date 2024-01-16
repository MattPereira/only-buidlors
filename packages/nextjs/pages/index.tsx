import Image from "next/image";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { RarityTable } from "~~/components/only-buildors/RarityTable";

const steps = [
  {
    number: 1,
    text: <>Send a transaction to initiate a request to chainlink functions node</>,
  },
  {
    number: 2,
    text: <>Wait for chainlink node to execute off chain API call and return the response data to NFT smart contract</>,
  },
  {
    number: 3,
    text: <>Send a second transaction to mint a members only NFT</>,
  },
];

const Home: NextPage = () => {
  ////////////////SVG NFT ////////////////////////

  return (
    <>
      <MetaHeader />

      <section className="p-5 md:p-10 xl:p-14">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 mb-14 items-end">
          <div>
            <h3 className="text-5xl md:text-6xl lg:text-7xl font-bold">ONLY BUIDLORS</h3>
            <div className="text-xl lg:text-2xl mb-5">
              A dynamic SVG NFT collection that enourages BuidlGuidl members to ship more builds.
            </div>
            <RarityTable />
          </div>
          <div className="flex justify-center">
            <Image
              src="/pixel-art.png"
              width={1000}
              height={1000}
              alt="builders constructing a castle"
              className="rounded-xl border-2 border-primary"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 2xl:grid-cols-2 items-center">
          <div>
            {steps.map(step => (
              <div key={step.number} className="text-2xl flex gap-4 mb-5 items-center">
                <div
                  style={{ minWidth: "40px" }}
                  className="border-2 font-bold border-primary w-10 h-10 flex items-center justify-center rounded-full"
                >
                  {step.number}
                </div>
                <div>{step.text}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-col justify-center items-center">
            <button className="btn btn-accent btn-lg">Send Request</button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
