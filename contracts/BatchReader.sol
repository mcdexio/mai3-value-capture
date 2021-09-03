// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.4;
pragma experimental ABIEncoderV2;

/// note: Please deploy this contract with remix
contract BatchReader {
    function staticcall(address[] calldata targets, bytes[] calldata calldatas)
        external
        view
        returns (bytes[] memory results)
    {
        require(
            targets.length == calldatas.length,
            "BatchReader::read::UnmatchArgLength"
        );
        results = new bytes[](calldatas.length);
        for (uint256 i = 0; i < calldatas.length; i++) {
            (, results[i]) = targets[i].staticcall(calldatas[i]);
        }
    }

    function call(address[] calldata targets, bytes[] calldata calldatas)
        external
        returns (bytes[] memory results)
    {
        require(
            targets.length == calldatas.length,
            "BatchReader::read::UnmatchArgLength"
        );
        results = new bytes[](calldatas.length);
        for (uint256 i = 0; i < calldatas.length; i++) {
            (, results[i]) = targets[i].call(calldatas[i]);
        }
    }
}
