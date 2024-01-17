import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { RarityTable } from "~~/components/only-buildors/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/";

const Collection: NextPage = () => {
  const [bgNft, setBgNft] = useState<any>(null);
  const [nfts, setNfts] = useState<any>([]);

  const { data: base64encodedTokenUri } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "tokenURI",
    args: [0n],
  });

  useEffect(() => {
    const fetchNftData = async () => {
      try {
        const response = await fetch("/api/get-nfts-for-contract");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const decodedNfts = data.map((nft: any) => {
          const utf8String = Buffer.from(nft.raw.tokenUri, "base64").toString("utf-8");
          return JSON.parse(utf8String);
        });
        setNfts(decodedNfts);
      } catch (e) {
        console.log("error", e);
      }
    };

    fetchNftData();
  }, []);

  console.log("nfts", nfts);

  useEffect(() => {
    if (!base64encodedTokenUri) return;
    // Decode the Base64 string
    const decodedString = atob(base64encodedTokenUri);

    // Parse the JSON metadata
    const metadata = JSON.parse(decodedString);

    // Set the NFT data
    setBgNft(metadata);
  }, [base64encodedTokenUri]);

  console.log(bgNft);
  return (
    <>
      <section className="p-5 md:p-10 xl:p-14">
        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8 py-14 items-end border-b border-primary">
          <div>
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-lucky">
              <div>THE</div> COLLECTION
            </h1>
            <div className="text-xl lg:text-2xl xl:text-3xl">See all NFTs that have been minted by the buidlors.</div>
          </div>
          <RarityTable />
        </div>

        <div className="my-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-14">
            {nfts.map((nft: any) => (
              <Image key={nft.image} width={700} height={700} src={nft.image} alt={nft.name} className="rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Collection;
