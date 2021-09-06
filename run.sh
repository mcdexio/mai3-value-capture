#!/bin/bash

docker run \
    -e ARBITRUM_RPC_ENDPOINT=https://arb1.arbitrum.io/rpc \
    -e VALUE_CAPTURE_ADMIN_KEY="" \
    -e SLACK_BOT_API=https://hooks.slack.com/services/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 \
    tokenutils