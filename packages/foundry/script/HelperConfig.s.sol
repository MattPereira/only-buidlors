// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        address router;
        bytes32 donId;
        uint64 subscriptionId;
        uint32 gasLimit;
    }

    uint256 public constant DEFAULT_ANVIL_PRIVATE_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    NetworkConfig public activeNetworkConfig;

    /**
     * logic in constructor controls which network config is active
     */
    constructor() {
        if (block.chainid == 421614) {
            activeNetworkConfig = getArbitrumSepoliaConfig();
        } else if (block.chainid == 80001) {
            activeNetworkConfig = getMumbaiConfig();
        } else if (block.chainid == 11155111) {
            activeNetworkConfig = getEthereumSepoliaConfig();
        } else {
            revert("unsupported network");
        }
    }

    function getEthereumSepoliaConfig()
        public
        pure
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                router: 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0,
                donId: 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000,
                subscriptionId: 1905,
                gasLimit: 300000
            });
    }

    function getArbitrumSepoliaConfig()
        public
        pure
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                router: 0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C,
                donId: 0x66756e2d617262697472756d2d7365706f6c69612d3100000000000000000000,
                subscriptionId: 11,
                gasLimit: 300000
            });
    }

    function getMumbaiConfig() public pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                router: 0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C,
                donId: 0x66756e2d706f6c79676f6e2d6d756d6261692d31000000000000000000000000,
                subscriptionId: 1268,
                gasLimit: 300000
            });
    }
}
