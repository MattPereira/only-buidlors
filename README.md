![OnlyBuidlors Thumbnail](https://only-buidlors.vercel.app/readme/project-title.png)

A dynamic SVG NFT project that uses chainlink functions to fetch off chain data from the BuidlGuidl API. All BuidlGuidl members with at least 1 published build are welcome to mint an NFT with a dynamic background color that changes based on the number of builds submitted!

![OnlyBuidlors Collection Page](https://only-buidlors.vercel.app/readme/collection-page.png)

## Getting Started

### Run It Locally

1. Clone the repo

```bash
git clone https://github.com/MattPereira/only-buidlors
```

2. Install the packages with yarn

```
yarn install
```

3. Add a `.env` file to `/packages/nextjs` with a valid `ALCHEMY_API_KEY`. (The frontend does not expose it because its only used in route handlers)

4. Start the project on localhost

```
yarn start
```

### Create Chainlink Functions Subscription

1. The deployment script is setup to automatically add any freshly deployed contract to a chainlink functions subscription, but the subscription itself must be created at functions.chain.link

2. Change the subscriptionId for the corresponding network where your subscriptionw was created in the `HelperConfig.s.sol`

3. Change `SUBSCRIPTION_ID` constant on the frontend homepage `index.tsx` which is needed for kicking off request to chainlink functions node

### Deploying Contracts

1. Add `.env` file to `/packages/foundry` with a valid `PRIVATE_KEY` and `ETHERSCAN_API_KEY`

2. Run the deploy command

```
yarn deploy --network arbitrumSepolia
```

\*Foundry `HelperConfig.s.sol` script is also setup to support deployment to eth-sepolia and mumbai

### Technology Stack

- Scaffold ETH 2
- Chainlink Functions
- Alchemy NFT API
