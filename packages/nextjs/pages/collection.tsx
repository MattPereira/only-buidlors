import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { RarityTable } from "~~/components/only-buildors/";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/";

const Collection: NextPage = () => {
  const [bgNft, setBgNft] = useState<any>(null);

  const { data: base64encodedTokenUri } = useScaffoldContractRead({
    contractName: "OnlyBuidlorsNft",
    functionName: "tokenURI",
    args: [0n],
  });

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
            <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold">
              <div>THE</div> COLLECTION
            </h1>
            <div className="text-xl lg:text-2xl xl:text-3xl">See all NFTs that have been minted by the buidlors.</div>
          </div>
          <RarityTable />
        </div>

        <div className="my-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-14">
            {bgNft && <Image width={700} height={700} src={bgNft.image} alt={bgNft.name} className="rounded-xl" />}
          </div>
        </div>
      </section>
    </>
  );
};

export default Collection;
