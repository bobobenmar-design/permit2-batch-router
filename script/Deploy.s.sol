// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/BatchTokenTransferRouter.sol";

contract DeployBatchTokenTransferRouter is Script {
    function run() external returns (BatchTokenTransferRouter router) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        router = new BatchTokenTransferRouter();
        vm.stopBroadcast();

        console.log("BatchTokenTransferRouter deployed at:", address(router));
    }
}
