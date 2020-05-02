.PHONY: node_modules
node_modules:
	yarn

eslint: node_modules
	./tools/eslint

build: node_modules
	lerna exec -- make build

test: eslint node_modules
	lerna exec -- make test