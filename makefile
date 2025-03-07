.PHONY: all clean build-plume deploy-plume

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
build-plume: clean
	cp $(SUBGRAPH_YAML) $(BUILD_DIR)/subgraph.yaml
	cp -r src/ $(BUILD_DIR)/src/
	cp $(SCHEMA_FILE) $(BUILD_DIR)/
	graph codegen
	graph build

# Deploy the subgraph
deploy-plume: build-plume
	goldsky subgraph deploy $(SUBGRAPH_NAME) --path ./build

deploy-plume-2:
	goldsky subgraph deploy qiro-plume-subgraph/v0.0.1 --from-ipfs-hash QmVeajBbuSM789JAyBu62MhR2yjqXTQT228cFpLrg4oAzc
