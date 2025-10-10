.PHONY: all clean build deploy

# Default target
all: build deploy

# Directory paths
BUILD_DIR = build
SCHEMA_FILE = schema.graphql
SUBGRAPH_YAML = subgraph.yaml

# Subgraph details
# SUBGRAPH_NAME = qiro-v1-plume-mainnet/v1.0.0
SUBGRAPH_NAME = qiro-v1-amoy-testnet/v1.0.0

# Clean build directory
clean:
	rm -rf $(BUILD_DIR)
	mkdir -p $(BUILD_DIR)

# Build the subgraph
build: 
	graph codegen
	graph build
	cp $(SUBGRAPH_YAML) $(BUILD_DIR)/subgraph.yaml

# Deploy the subgraph
deploy:
	graph codegen
	graph build
	goldsky subgraph deploy $(SUBGRAPH_NAME) --path .

# Build and deploy in one command
deploy-all: build deploy
