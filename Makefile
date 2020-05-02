.PHONY: node_modules
node_modules:
	yarn

eslint: node_modules
	yarn run eslint packages/**/*/src/**/*.js --fix --format codeframe

build: node_modules
	lerna exec -- make build

test: eslint node_modules
	lerna exec -- make test