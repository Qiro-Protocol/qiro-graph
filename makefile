.PHONY: all clean build deploy

# Directory paths
BUILD_DIR = build
SCHEMA_FILE = schema.graphql
SUBGRAPH_YAML = subgraph.yaml

# Subgraph details
# SUBGRAPH_NAME = qiro-v1-plume-mainnet/v1.0.0
SUBGRAPH_NAME = qiro-v1-amoy-testnet-webhooks/v1.0.1.3

WEHBHOOK_URL = https://eon9o019ed06ccs.m.pipedream.net

# list of entities for webhooks
# WEBHOOK_ENTITY_1 = wh_investor_whitelisted
# WEBHOOK_ENTITY_2 = supply_redeem
# WEBHOOK_ENTITY_3 = pool_deployed
# WEBHOOK_ENTITY_4 = wh_originator_fee_paid
# WEBHOOK_ENTITY_5 = wh_set_create_pool_access
# WEBHOOK_ENTITY_6 = loan_started
# WEBHOOK_ENTITY_7 = loan_withdrawn
# WEBHOOK_ENTITY_8 = wh_value_filed_on_contract
WEBHOOK_ENTITY_9 = wh_writeoff
WEBHOOK_ENTITY_10 = prepayment_applied
WEBHOOK_ENTITY_11 = loan_repayed
WEBHOOK_ENTITY_12 = loan_ended
# # CRITICAL WEBHOOKS
WEBHOOK_ENTITY_13 = wh_ownership_transfer_started
WEBHOOK_ENTITY_14 = wh_ownership_transfer_complete
WEBHOOK_ENTITY_15 = wh_pool_admin_changed
WEBHOOK_ENTITY_16 = wh_timelock_vault_manager_changed
WEBHOOK_ENTITY_17 = wh_timelock_vault_delay_changed
WEBHOOK_ENTITY_18 = wh_pauser_changed
WEBHOOK_ENTITY_19 = wh_borrower_changed
WEBHOOK_ENTITY_20 = wh_whitelist_manager_changed
WEBHOOK_ENTITY_21 = whitelisted_protocol
# EMERGENCY_MECHANISM
WEBHOOK_ENTITY_22 = wh_protocol_paused_unpaused
WEBHOOK_ENTITY_23 = wh_pool_paused_unpaused
WEBHOOK_ENTITY_24 = wh_emergency_exit_executed
WEBHOOK_ENTITY_25 = wh_emergency_exit_batch_size_changed
WEBHOOK_ENTITY_26 = wh_timelock_deposit_created
WEBHOOK_ENTITY_27 = wh_timelock_deposit_withdrawn
WEBHOOK_ENTITY_28 = wh_funds_withdrawn

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
# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_4)-webhook --entity $(WEBHOOK_ENTITY_4) --url $(WEHBHOOK_URL)
# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_5)-webhook --entity $(WEBHOOK_ENTITY_5) --url $(WEHBHOOK_URL)
# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_6)-webhook --entity $(WEBHOOK_ENTITY_6) --url $(WEHBHOOK_URL)
# goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_7)-webhook --entity $(WEBHOOK_ENTITY_7) --url $(WEHBHOOK_URL)
# goldsky subgraph webhook create	$(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_8)-webhook --entity $(WEBHOOK_ENTITY_8) --url $(WEHBHOOK_URL)
deploy-webhooks:
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_9)-webhook --entity $(WEBHOOK_ENTITY_9) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_10)-webhook --entity $(WEBHOOK_ENTITY_10) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_11)-webhook --entity $(WEBHOOK_ENTITY_11) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_12)-webhook --entity $(WEBHOOK_ENTITY_12) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_13)-webhook --entity $(WEBHOOK_ENTITY_13) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_14)-webhook --entity $(WEBHOOK_ENTITY_14) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_15)-webhook --entity $(WEBHOOK_ENTITY_15) --url $(WEHBHOOK_URL)
	goldsky subgraph webhook create $(SUBGRAPH_NAME) --name $(WEBHOOK_ENTITY_16)-webhook --entity $(WEBHOOK_ENTITY_16) --url $(WEHBHOOK_URL)

deploy-subgraph-and-webhooks: deploy deploy-webhooks

# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_1)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_2)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_3)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_4)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_5)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_6)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_7)-webhook
# goldsky subgraph webhook delete $(WEBHOOK_ENTITY_8)-webhook
delete-webhooks-and-subgraph:
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_9)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_10)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_11)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_12)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_13)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_14)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_15)-webhook
	goldsky subgraph webhook delete $(WEBHOOK_ENTITY_16)-webhook
	goldsky subgraph delete $(SUBGRAPH_NAME)

# sample flow for slack messages using piepdream and webhooks
# deploy subgraph -> deploy WH 1 -> test using pipedream flow -> change pipedream code as needed -> delete WH 1 and subgraph
# -> deploy subgraph with WH 2 -> test using pipedream flow -> change pipedream code as needed -> delete WH 2 and subgraph