//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DeployHelpers.s.sol";
import {Script, console} from "forge-std/Script.sol";
import {BuidlCountNft} from "../contracts/BuidlCountNft.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {IFunctionsSubscriptions} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/interfaces/IFunctionsSubscriptions.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }

        HelperConfig helperConfig = new HelperConfig();
        (
            address router,
            bytes32 donId,
            uint64 subscriptionId,
            uint32 gasLimit
        ) = helperConfig.activeNetworkConfig();

        console.log("router:", router);
        // console.logBytes(donId);
        console.log("subscriptionId:", subscriptionId);
        console.log("gasLimit:", gasLimit);

        vm.startBroadcast(deployerPrivateKey);

        BuidlCountNft buidlCountNft = new BuidlCountNft(
            router,
            donId,
            gasLimit
        );
        console.log(
            "BuidlGuild NFT contract deployed at: ",
            address(buidlCountNft)
        );

        IFunctionsSubscriptions chainlinkRouter = IFunctionsSubscriptions(
            router
        );

        chainlinkRouter.addConsumer(subscriptionId, address(buidlCountNft));

        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function test() public {}
}
