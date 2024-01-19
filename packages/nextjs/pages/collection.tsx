import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import useSWR from "swr";
import { RarityTable } from "~~/components/only-buildors/";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth/";

// Define the fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

const Collection: NextPage = () => {
  const [nfts, setNfts] = useState<any>([]);

  const { data: onlyBuildorsNftContract } = useDeployedContractInfo("OnlyBuidlorsNft");

  const getNftsForContractUrl = onlyBuildorsNftContract?.address
    ? `/api/get-nfts-for-contract?contractAddress=${onlyBuildorsNftContract?.address}`
    : null;

  const { data: nftsData, error: nftsError } = useSWR(getNftsForContractUrl, fetcher);

  if (nftsError) {
    console.log("nftsError", nftsError);
  }

  useEffect(() => {
    if (nftsData) {
      try {
        const decodedNfts = nftsData.map((nft: any) => {
          const utf8String = Buffer.from(nft.raw.tokenUri, "base64").toString("utf-8");
          return JSON.parse(utf8String);
        });
        setNfts(decodedNfts);
      } catch (e) {
        console.log("error", e);
      }
    }
  }, [nftsData]);

  return (
    <>
      <section className="p-5 md:p-10 xl:p-14">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 py-14 items-end border-b border-primary">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-lucky">
              <div>THE</div> COLLECTION
            </h1>
            <div className="text-xl lg:text-2xl xl:text-3xl">See all NFTs that have been minted by the buidlors</div>
          </div>
          <div className="flex justify-center">
            <RarityTable />
          </div>
        </div>

        <div className="my-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-14">
            {nfts.length > 0
              ? nfts.map((nft: any) => (
                  <Image
                    key={nft.image}
                    width={700}
                    height={700}
                    src={nft.image}
                    alt={nft.name}
                    className="rounded-xl"
                  />
                ))
              : Array.from(Array(4).keys()).map((_, idx) => (
                  <div key={idx} className="skeleton animate-pulse bg-base-100 rounded-xl w-full h-72"></div>
                ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Collection;
