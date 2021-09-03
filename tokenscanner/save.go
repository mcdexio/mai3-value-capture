package main

import (
	"encoding/json"
	"io/ioutil"
	"time"
)

type Save struct {
	LastScan        time.Time
	LastBlockNumber uint64
	TokenList       map[string]bool

	path string
}

func NewSave(path string) *Save {
	return &Save{
		path:      path,
		TokenList: make(map[string]bool),
	}
}

func (s *Save) Load() error {
	b, err := ioutil.ReadFile(s.path)
	if err != nil {
		return err
	}
	return json.Unmarshal(b, s)
}

func (s *Save) Save() error {
	b, err := json.Marshal(s)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(s.path, b, 0755)
}
