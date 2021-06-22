package main

import (
	"fmt"
	"math/big"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
)

type ERC20TransferParser struct {
}

func (f *ERC20TransferParser) Parse(l types.Log) ([]interface{}, error) {
	token := l.Address
	if len(l.Topics) < 3 {
		return nil, fmt.Errorf("invalid topics, expect %v, got %v", 3, len(l.Topics))
	}
	sender := common.BytesToAddress(l.Topics[1].Bytes())
	recipient := common.BytesToAddress(l.Topics[2].Bytes())
	if len(l.Data) < 32 {
		return nil, fmt.Errorf("invalid data, expect %v, got %v", 32, len(l.Data))
	}
	amount := common.Bytes2Hex(l.Data)
	return []interface{}{token, sender, recipient, amount}, nil
}

type BaseFilter struct {
	FromBlock *big.Int
	ToBlock   *big.Int
}

type ERC20TransferFilter struct {
	BaseFilter
	Emitter *common.Address
	From    *common.Address
	To      *common.Address
}

func (f *ERC20TransferFilter) GetQuery() ethereum.FilterQuery {
	var (
		addresses = []common.Address{}
		topics    = [][]common.Hash{}
	)
	if f.Emitter != nil {
		addresses = append(addresses, *f.Emitter)
	}
	topics = append(topics, []common.Hash{GetEventHash("Transfer(address,address,uint256)")})
	if f.From != nil {
		topics = append(topics, []common.Hash{f.From.Hash()})
	}
	if f.To != nil {
		if f.From != nil {
			topics = append(topics, []common.Hash{f.To.Hash()})
		} else {
			topics = append(topics, []common.Hash{}, []common.Hash{f.To.Hash()})
		}
	}
	return ethereum.FilterQuery{
		Addresses: addresses,
		Topics:    topics,
		FromBlock: f.FromBlock,
		ToBlock:   f.ToBlock,
	}
}

func GetEventHash(signature string) common.Hash {
	return crypto.Keccak256Hash([]byte(signature))
}
