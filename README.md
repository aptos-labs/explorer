# Aptos Explorer

## How to use

Clone the repo. Requires `yarn`.

Run below to start the app:

```sh
yarn start
```

## Generating OpenAPI

```sh
npx @openapitools/openapi-generator-cli generate -g typescript-fetch -i doc/openapi.yaml -o ./src/api_client --package-name api_client --additional-properties=supportsES6=1,typescriptThreePlus=1
```

Manual Changes:

1. replace `\/\* eslint\-disable \*\/` with `/* eslint-disable */\n// @ts-nocheck`)
2. replace `as Array<any>)`
   with `as Array<any> || [])` to handle nulls due to missing refinement