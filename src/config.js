
const ENV = {
    ARBITRUM_RPC_ENDPOINT: "https://arb1.arbitrum.io/rpc",
    VALUE_CAPTURE_ADMIN_KEY: process.env["VALUE_CAPTURE_ADMIN_KEY"],
    SLACK_BOT_API: "https://hooks.slack.com/services/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",
}

const ADDRESS = {
    VALUE_CAPTURE: "0xa04197E5F7971E7AEf78Cf5Ad2bC65aaC1a967Aa",
    BATCH_READER: "0xE7eBF22d9CB3DF2967fc51D35Db7a0d72b272587",
}

const ABI = {
    BATCH_READER: [
        "function staticcall(address[] calldata targets, bytes[] calldata calldatas) external view returns (bytes[] memory results)",
        "function call(address[] calldata targets, bytes[] calldata calldatas) external returns (bytes[] memory results)",
    ],
    VALUE_CAPTURE: [
        "function forwardMultiAssets(address[] memory tokens, uint256[] memory amountsIn)",
        "function listUSDTokens(uint256 begin, uint256 end) external view returns (address[] memory result)",
        "function externalExchanges(address token) view returns (address)",
    ],
    ERC20: [
        "function balanceOf(address) view returns (uint256)"
    ],
}

module.exports = {
    ENV,
    ABI,
    ADDRESS,
}