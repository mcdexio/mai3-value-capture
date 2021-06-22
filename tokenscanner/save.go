package main

import (
	"io/ioutil"
	"os"
	"time"

	"gopkg.in/yaml.v2"
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
		if os.IsNotExist(err) {
			return nil
		}
		return err
	}
	return yaml.Unmarshal(b, s)
}

func (s *Save) Save() error {
	b, err := yaml.Marshal(s)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(s.path, b, 0755)
}
