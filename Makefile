tokenscanner_targets=$(wildcard ./tokenscanner/*.go)
tokenscanner: $(tokenscanner_targets)
	go build -o bin/tokenscanner $(tokenscanner_targets)

run:
	go run main.go


all: tokenscanner