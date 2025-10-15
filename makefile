.PHONY: all clean build deploy

# Default target
all: build deploy

# Directory paths
BUILD_DIR = build
SCHEMA_FILE = schema.graphql
SUBGRAPH_YAML = subgraph.yaml

# Subgraph details
# SUBGRAPH_NAME = qiro-v1-plume-mainnet/v1.0.0
SUBGRAPH_NAME = qiro-v1-amoy-testnet-webhooks/v1.0.1

WEHBHOOK_URL = https://eomex107jh13mhn.m.pipedream.net
WEBHOOK_ENTITY = wh_investor_whitelisted

# Clean build directory
clean:
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)

# Build the subgraph
build: 
	graph codegen
	graph build

# Deploy the subgraph
deploy:
	graph codegen
	graph build
	goldsky subgraph deploy $(SUBGRAPH_NAME) --path .

# Build and deploy in one command
deploy-all: build deploy

deploy-webhook:
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY)-webhook --entity $(WEBHOOK_ENTITY) --url $(WEHBHOOK_URL)