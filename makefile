.PHONY: all clean build deploy

# Default target
all: build deploy

# Directory paths
BUILD_DIR = build
SCHEMA_FILE = schema.graphql
SUBGRAPH_YAML = plume.subgraph.yaml

# Subgraph details
SUBGRAPH_NAME = qiro-plume-testnet-subgraph/v0.0.1

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
	goldsky subgraph deploy $(SUBGRAPH_NAME) --path ./$(BUILD_DIR)

# Build and deploy in one command
deploy-all: build deploy
