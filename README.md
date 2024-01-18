# Only Buidlors
A dynamic SVG NFT project that uses chainlink functions to fetch off chain data from the BuidlGuidl API. All BuidlGuidl members with at least 1 published build are welcome to mint an NFT with a dynamic background color that changes based on the number of builds submitted!


# TODO

1. Impliment chainlink function to fetch build count from BG api
2. Set up minting on frontend with mainnet ens lookup that is passed as arg to mint function
3. Hook up subgraph for speedy display of the nft collection
4. Different color background depending on number of builds
   1. 0 - 4 builds gets bronze
   2. 5 - 9 builds gets silver
   3. 10+ builds gets rainbow or gold
5. Figure out if account abstraction is possible for the minting to pay users mint fees
6. Set up Chainlink automation to mint NFT by listening for event of chainlink function Response

## Resources

### NFT metadata example

- ipfs://bafybeibc5sgo2plmjkq2tzmhrn54bk3crhnc23zd2msg4ea7a4pxrkgfna/2222

### Subgraphs

- https://thegraph.com/docs/en/developing/creating-a-subgraph/#writing-mappings
- https://docs.alchemy.com/docs/how-to-query-a-subgraph
- https://subgraph.satsuma-prod.com/matts-team--3503850/basic-nft/playground
