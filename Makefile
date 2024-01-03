.PHONY: node_modules
node_modules:
	yarn

eslint: node_modules
	./tools/eslint

build: node_modules
	yarn lerna exec make build

test: eslint node_modules
	yarn lerna exec make test

serve: build
	serve -s packages/composerize-website/build/
