package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
	"os"
	"time"

	"github.com/alexflint/go-arg"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

func hexToAddr(h string) *common.Address {
	addr := common.HexToAddress(h)
	return &addr
}

type TokenDetectHandler struct {
	Incremental []string
	TokenList   map[string]bool
}

func (h *TokenDetectHandler) Handle(args ...interface{}) error {
	if len(args) < 1 {
		return fmt.Errorf("missing token address")
	}
	token, ok := args[0].(common.Address)
	if !ok {
		fmt.Errorf("expect common.Address, got %+v", args[0])
	}
	addr := token.Hex()
	if _, ok := h.TokenList[addr]; !ok {
		log.Printf("found new token %s", addr)
		h.TokenList[addr] = true
		h.Incremental = append(h.Incremental, addr)
	}
	return nil
}

func main() {

	var args struct {
		From        uint64 `arg:"-t,--to" help:"start block" default:"0"`
		SavePath    string `arg:"-s,--save" help:"path to save progress" default:"tokenscanner.json"`
		RPCEndpoint string `arg:"-e,--endpoint" help:"endpoint" default:"https://arb1.arbitrum.io/rpc"`
		Recipient   string `arg:"-r,--recipient" help:"recipient of ERC20" default:"0xa04197E5F7971E7AEf78Cf5Ad2bC65aaC1a967Aa"`
	}

	arg.MustParse(&args)

	save := NewSave(args.SavePath)
	client, err := ethclient.Dial(args.RPCEndpoint)
	if err != nil {
		log.Fatalln(err.Error())
	}
	defer client.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 120*time.Second)
	defer cancel()

	var fromBlock *big.Int
	parser := &ERC20TransferParser{}
	handler := &TokenDetectHandler{TokenList: make(map[string]bool)}
	if err = save.Load(); err != nil {
		if !os.IsNotExist(err) {
			log.Fatalln(err.Error())
		}
		fromBlock = big.NewInt(int64(args.From))
	} else {
		handler.TokenList = save.TokenList
		fromBlock = big.NewInt(int64(save.LastBlockNumber + 1))
	}
	bn, err := client.BlockNumber(ctx)
	if err != nil {
		log.Fatalln(err.Error())
	}
	transferQuery := &ERC20TransferFilter{
		BaseFilter: BaseFilter{
			FromBlock: fromBlock,
			ToBlock:   big.NewInt(int64(bn)),
		},
		To: hexToAddr(args.Recipient),
	}
	filter := NewSimpleFilter(
		client,
		transferQuery,
		parser,
		handler,
	)
	defer func() {
		save.LastScan = time.Now()
		save.LastBlockNumber = bn
		save.TokenList = handler.TokenList
		save.Save()
	}()
	if err := filter.Filter(ctx); err != nil {
		log.Fatalln(err.Error())
	}

	log.Printf("[Summary] scanning from %v to %v, found new tokens: %v", save.LastBlockNumber, bn, handler.Incremental)
}
