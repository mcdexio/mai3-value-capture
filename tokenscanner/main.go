package main

import (
	"context"
	"fmt"
	"log"
	"math/big"
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

	// fmt.Println(args)
	return nil
}

func main() {

	var args struct {
		SavePath    string `arg:"-s,--save" help:"path to save progress" default:"tokenList.save"`
		RPCEndpoint string `arg:"-e,--endpoint" help:"endpoint" default:"http://server10.jy.mcarlo.com:8747"`
		Recipient   string `arg:"-r,--recipient" help:"recipient of ERC20" default:"0x02e8735cd053fc738170011F7eBc4117f285fE9D"`
	}

	arg.MustParse(&args)

	save := NewSave(args.SavePath)
	client, err := ethclient.Dial(args.RPCEndpoint)
	if err != nil {
		log.Fatalln(err.Error())
	}
	defer client.Close()
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	bn, err := client.BlockNumber(ctx)
	if err != nil {
		log.Fatalln(err.Error())
	}

	parser := &ERC20TransferParser{}
	handler := &TokenDetectHandler{}
	if err = save.Load(); err != nil {
		log.Fatalln(err.Error())
	} else {
		handler.TokenList = save.TokenList
	}

	transferQuery := &ERC20TransferFilter{
		To: hexToAddr(args.Recipient),
		BaseFilter: BaseFilter{
			FromBlock: big.NewInt(int64(save.LastBlockNumber + 1)),
			ToBlock:   big.NewInt(int64(bn)),
		},
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
