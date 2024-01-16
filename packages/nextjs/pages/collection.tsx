import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth/";

const Collection: NextPage = () => {
  const [bgNft, setBgNft] = useState<any>(null);

  const { data: base64encodedTokenUri } = useScaffoldContractRead({
    contractName: "BuidlCountNft",
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
      <h1 className="text-7xl text-center my-14 font-bold">ONLY BUIDLORS</h1>

      <div className="flex justify-center ">
        {bgNft && <Image width={700} height={700} src={bgNft.image} alt={bgNft.name} className="rounded-xl" />}
      </div>
    </>
  );
};

export default Collection;
