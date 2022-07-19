# near-arbitrage

## factory
near dev-deploy res/token_factory.wasm
FACTORY_ID=dttfactory.testnet
TOKEN1=dtt.dev-1656188046462-83531633920883
TOKEN2=dtt1.dev-1656188046462-83531633920883
TOKEN3=dtt2.dev-1656188046462-83531633920883
TOKEN4=dtt3.dev-1656188046462-83531633920883
TOKEN5=dtt4.dev-1656188046462-83531633920883
near call $FACTORY_ID new --account-id $FACTORY_ID
near call $FACTORY_ID storage_deposit --account-id $FACTORY_ID --deposit 50
near call $FACTORY_ID create_token "{"args": {"owner_id":\"$FACTORY_ID\", "total_supply": "100000000000", "can_faucet": true, "metadata": {"spec": "ft-1.0.0","name": "DTT Token","symbol": "DTT","decimals": 2}}}" --account-id $FACTORY_ID --gas 200000000000000
near call $FACTORY_ID create_token "{\"args\": {\"owner_id\":\"$FACTORY_ID\", \"total_supply\": \"100000000000\", \"can_faucet\": true, \"metadata\": {\"spec\": \"ft-1.0.0\",\"name\": \"DTT Token1\",\"symbol\": \"DTT1\",\"decimals\": 2}}}" --account-id $FACTORY_ID --gas 200000000000000
near call $FACTORY_ID create_token "{\"args\": {\"owner_id\":\"$FACTORY_ID\", \"total_supply\": \"100000000000\", \"can_faucet\": true, \"metadata\": {\"spec\": \"ft-1.0.0\",\"name\": \"DTT Token2\",\"symbol\": \"DTT2\",\"decimals\": 2}}}" --account-id $FACTORY_ID --gas 200000000000000
near call $FACTORY_ID create_token "{\"args\": {\"owner_id\":\"$FACTORY_ID\", \"total_supply\": \"100000000000\", \"can_faucet\": true, \"metadata\": {\"spec\": \"ft-1.0.0\",\"name\": \"DTT Token3\",\"symbol\": \"DTT3\",\"decimals\": 2}}}" --account-id $FACTORY_ID --gas 200000000000000
near call $FACTORY_ID create_token "{\"args\": {\"owner_id\":\"$FACTORY_ID\", \"total_supply\": \"100000000000\", \"can_faucet\": true, \"metadata\": {\"spec\": \"ft-1.0.0\",\"name\": \"DTT Token4\",\"symbol\": \"DTT4\",\"decimals\": 2}}}" --account-id $FACTORY_ID --gas 200000000000000
near call $TOKEN1 faucet --account-id $FACTORY_ID

## ref-exchange
near dev-deploy res/ref_exchange_release.wasm
CONTRACT_ID=dev-1656234694287-14038558864682
USER_ID=dev-1656188046462-83531633920883
near call $DEX1 new "{\"owner_id\": \"$USER_ID\", \"exchange_fee\": 0, \"referral_fee\": 0}" --accountId $DEX1 && near call $DEX2 new "{\"owner_id\": \"$USER_ID\", \"exchange_fee\": 0, \"referral_fee\": 0}" --accountId $DEX2 && near call $DEX3 new "{\"owner_id\": \"$USER_ID\", \"exchange_fee\": 0, \"referral_fee\": 0}" --accountId $DEX3 && near call $DEX4 new "{\"owner_id\": \"$USER_ID\", \"exchange_fee\": 0, \"referral_fee\": 0}" --accountId $DEX4 && near call $DEX5 new "{\"owner_id\": \"$USER_ID\", \"exchange_fee\": 0, \"referral_fee\": 0}" --accountId $DEX5

near call $CONTRACT_ID extend_whitelisted_tokens "{\"tokens\": [\"$TOKEN3\", \"$TOKEN4\", \"$TOKEN5\"]}" --accountId $CONTRACT_ID --depositYocto 1
near call $CONTRACT_ID storage_deposit --accountId $USER_ID --deposit 1
near call $TOKEN1 storage_deposit "{\"account_id\": \"$CONTRACT_ID\"}" --accountId $CONTRACT_ID --deposit 0.125
near call $TOKEN2 storage_deposit "{\"account_id\": \"$CONTRACT_ID\"}" --accountId $CONTRACT_ID --deposit 0.125
near call $TOKEN3 storage_deposit "{\"account_id\": \"$CONTRACT_ID\"}" --accountId $CONTRACT_ID --deposit 0.125
near call $TOKEN4 storage_deposit "{\"account_id\": \"$CONTRACT_ID\"}" --accountId $CONTRACT_ID --deposit 0.125
near call $TOKEN5 storage_deposit "{\"account_id\": \"$CONTRACT_ID\"}" --accountId $CONTRACT_ID --deposit 0.125
near call $CONTRACT_ID register_tokens "{\"token_ids\": [\"$TOKEN3\", \"$TOKEN4\", \"$TOKEN5\"]}" --accountId $USER_ID --depositYocto 1

near call $TOKEN1 ft_transfer_call "{\"receiver_id\": \"$CONTRACT_ID\", \"amount\": \"10000000\", \"msg\": \"\"}" --accountId $USER_ID --depositYocto 1 --gas 200000000000000
near call $TOKEN2 ft_transfer_call "{\"receiver_id\": \"$CONTRACT_ID\", \"amount\": \"2000000\", \"msg\": \"\"}" --accountId $USER_ID --depositYocto 1 --gas 200000000000000
near call $CONTRACT_ID add_simple_pool "{\"tokens\": [\"$TOKEN3\", \"$TOKEN5\"], \"fee\": 0}" --accountId $USER_ID --deposit 0.1
near call $CONTRACT_ID add_liquidity '{"pool_id": 6, "amounts": ["1000000", "1400000"]}' --accountId $USER_ID --deposit 1

## Arbitrage
near dev-deploy res/arbitrage.wasm
ARBITRAGE_ID=dev-1657604972480-41950724296317
near call $ARBITRAGE_ID new --account-id $ARBITRAGE_ID
near call $ARBITRAGE_ID add_dexs "{\"dexs\": [\"$DEX1\", \"$DEX2\", \"$DEX3\", \"$DEX4\", \"$DEX5\"]}" --account-id $ARBITRAGE_ID --depositYocto 1
near call $TOKEN2 storage_deposit --account-id $ARBITRAGE_ID --deposit 0.25 && near call $TOKEN5 storage_deposit --account-id $ARBITRAGE_ID --deposit 0.25 && near call $TOKEN1 faucet --account-id $ARBITRAGE_ID && near call $TOKEN5 faucet --account-id $ARBITRAGE_ID && near call $CONTRACT_ID storage_deposit --account-id $ARBITRAGE_ID --deposit 1 && near call $TOKEN1 ft_transfer_call "{\"receiver_id\": \"$CONTRACT_ID\", \"amount\": \"100000\", \"msg\": \"\"}" --accountId $ARBITRAGE_ID --depositYocto 1 --gas 200000000000000 && near call $TOKEN5 ft_transfer_call "{\"receiver_id\": \"$CONTRACT_ID\", \"amount\": \"100000\", \"msg\": \"\"}" --accountId $ARBITRAGE_ID --depositYocto 1 --gas 200000000000000

near call $TOKEN1 ft_transfer_call "{\"receiver_id\": \"$ARBITRAGE_ID\", \"amount\": \"1000\", \"msg\": \"{\"dex_id\":\"$CONTRACT_ID\", \"actions\": [{\"pool_id\": 0, \"token_in\": \"$TOKEN1\", \"amount_in\": \"1000\", \"token_out\": \"$TOKEN2\", \"min_amount_out\": \"1\"}]}\"}" --accountId $USER_ID --depositYocto 1 --gas 300000000000000
