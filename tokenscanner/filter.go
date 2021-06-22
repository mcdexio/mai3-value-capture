package main

import (
	"context"
	"log"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Parser interface {
	Parse(l types.Log) ([]interface{}, error)
}

type Handler interface {
	Handle(...interface{}) error
}

type Query interface {
	GetQuery() ethereum.FilterQuery
}

type Filter interface {
	Filter(ctx context.Context) error
}

type SimpleFilter struct {
	parser  Parser
	handler Handler
	client  *ethclient.Client
	query   ethereum.FilterQuery
}

func NewSimpleFilter(client *ethclient.Client, query Query, parser Parser, handler Handler) Filter {
	eh := &SimpleFilter{
		parser:  parser,
		handler: handler,
		client:  client,
		query:   query.GetQuery(),
	}
	return eh
}

func (eh *SimpleFilter) Filter(ctx context.Context) error {
	log.Printf("%+v", eh.query)
	logs, err := eh.client.FilterLogs(ctx, eh.query)
	if err != nil {
		return err
	}

	for _, l := range logs {
		parsed, err := eh.parser.Parse(l)
		if err != nil {
			return err
		}
		err = eh.handler.Handle(parsed...)
		if err != nil {
			return err
		}
	}
	return nil
}
