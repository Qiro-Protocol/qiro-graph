.PHONY: all clean build deploy

# Default target
all: build deploy

# Directory paths
BUILD_DIR = build
SCHEMA_FILE = schema.graphql
SUBGRAPH_YAML = subgraph.yaml

# Subgraph details
# SUBGRAPH_NAME = qiro-v1-plume-mainnet/v1.0.0
SUBGRAPH_NAME = qiro-v1-amoy-testnet-webhooks/v1.0.1.1

WEHBHOOK_URL = https://eon9o019ed06ccs.m.pipedream.net
WEBHOOK_ENTITY = supply_redeem

# list of entities for webhooks
# WEBHOOK_ENTITY_1 = wh_investor_whitelisted
WEBHOOK_ENTITY_2 = supply_redeem

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

deploy-webhooks:
	# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_1)-webhook --entity $(WEBHOOK_ENTITY_1) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_2)-webhook --entity $(WEBHOOK_ENTITY_2) --url $(WEHBHOOK_URL)

deploy-subgraph-and-webhooks: deploy deploy-webhooks

delete-webhooks-and-subgraph:
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_1)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_2)-webhook
	goldsky subgraph delete $(SUBGRAPH_NAME)