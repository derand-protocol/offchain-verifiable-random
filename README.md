# DeRand OFFCHAIN-VERIFIABLE-RANDOM

## Dependencies

1. install [MongoDB](https://www.mongodb.com/docs/manual/installation/)
2. install [NodeJs & NPM](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

## Setup and Running

If you already have Node.js and NPM installed, you can setup and run this project with following commands:

```bash
$ npm i  
$ cp .env.example .env
$ npm run start
```
## Usage

You should pass the NFT id to the api and it will retrieve a verifiable random number from the MUON network. The API uses the combination of chain id, token address, and NFT id as the pre-seed of the random number. When the random number is fetched, it will be used to specify the metadata of the NFT.

```bash
$ curl -l http://localhost:5002/<nftId>
```