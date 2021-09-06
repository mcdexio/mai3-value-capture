#!/bin/bash

docker run \
    -e ARBITRUM_RPC_ENDPOINT=https://arb1.arbitrum.io/rpc \
    -e VALUE_CAPTURE_ADMIN_KEY="" \
    -e SLACK_BOT_API=https://hooks.slack.com/services/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 \
    tokenutils