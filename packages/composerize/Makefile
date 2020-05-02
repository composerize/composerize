.PHONY: node_modules
node_modules:
	yarn

eslint: node_modules
	yarn run eslint cli.js src/**/*.js --fix --format codeframe

test: eslint node_modules
	yarn flow check
	yarn run jest --no-watchman

build: node_modules
	yarn rollup -c