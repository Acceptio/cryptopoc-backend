geth --dev --datadir "$DATA_DIR" --rpc --rpcaddr "$RPC_IP" --rpcport "$RPC_PORT" --rpccorsdomain "$FRONTEND_URL" --rpcapi "personal,admin,eth" --mine
