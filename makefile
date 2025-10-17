.PHONY: all clean build deploy

# Directory paths
BUILD_DIR = build
SCHEMA_FILE = schema.graphql
SUBGRAPH_YAML = subgraph.yaml

# Subgraph details
# SUBGRAPH_NAME = qiro-v1-plume-mainnet/v1.0.0
SUBGRAPH_NAME = qiro-v1-amoy-testnet-webhooks/v1.0.1.1

WEHBHOOK_URL = https://eon9o019ed06ccs.m.pipedream.net

# list of entities for webhooks
# WEBHOOK_ENTITY_1 = wh_investor_whitelisted
# WEBHOOK_ENTITY_2 = supply_redeem
# WEBHOOK_ENTITY_3 = pool_deployed
WEBHOOK_ENTITY_4 = wh_originator_fee_paid

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

# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_1)-webhook --entity $(WEBHOOK_ENTITY_1) --url $(WEHBHOOK_URL)
# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_2)-webhook --entity $(WEBHOOK_ENTITY_2) --url $(WEHBHOOK_URL)
# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_3)-webhook --entity $(WEBHOOK_ENTITY_3) --url $(WEHBHOOK_URL)
deploy-webhooks:
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_4)-webhook --entity $(WEBHOOK_ENTITY_4) --url $(WEHBHOOK_URL)

deploy-subgraph-and-webhooks: deploy deploy-webhooks

# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_1)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_2)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_3)-webhook
delete-webhooks-and-subgraph:
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_4)-webhook
	goldsky subgraph delete $(SUBGRAPH_NAME)