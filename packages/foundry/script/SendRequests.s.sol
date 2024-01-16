//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DeployHelpers.s.sol";
import {Script, console} from "forge-std/Script.sol";
import {OnlyBuidlorsNft} from "../contracts/OnlyBuidlorsNft.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

/**
 * Send requests to chainlink function for a few sample buidlors
 *
 * forge script script/SendRequests.s.sol --rpc-url https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}
 */
contract SendRequestsScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }

        HelperConfig helperConfig = new HelperConfig();
        (, , uint64 subscriptionId, ) = helperConfig.activeNetworkConfig();

        console.log("subscriptionId:", subscriptionId);
        console.log("deployerPrivateKey", deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        OnlyBuidlorsNft onlyBuildorsNft = OnlyBuidlorsNft(
            0x822736A04Df5323BC55A45368dd0a6e09F7ECDe9
        );

        string[] memory args = new string[](1);
        args[0] = "0xbE13CA20B7ff5fEf2D04f67aBf2A2a07feAfA102";

        onlyBuildorsNft.sendRequestOnBehalfOf(
            subscriptionId,
            args,
            "shravansunder.eth",
            0xbE13CA20B7ff5fEf2D04f67aBf2A2a07feAfA102
        );

        vm.stopBroadcast();
    }
}
