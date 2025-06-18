test:
	anchor test --skip-build --skip-deploy -- --verbose --provider.cluster devnet

deploy:
	anchor build && anchor deploy --program-name payment_processor --program-keypair deploy-keypair.json
