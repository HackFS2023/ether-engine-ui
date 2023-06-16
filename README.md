# Ether Engine UI

## Introduction

*Ether Engine UI* is a decentralized job marketplace where users can request computations and providers can discover these jobs, respond with scripts, and perform the computations. The project is under the HackFS2023 organization.

The project uses several technologies:

- **Polybase**: Polybase is a privacy-preserving decentralized database built on zk-STARKs. It uses a zk-rollup combined with native indexing to allow decentralized database rules, fast queries, and scalable writes. It's similar to a NoSQL-like database, with validation rules written in a JavaScript-like language. The SDK is similar to Firestore and Supabase. Polybase is designed to combine the best attributes of web2 databases and blockchains, offering row-level token gating, wallet-based permissions, and "self-sovereign data". It's significantly cheaper than on-chain storage, making it a more efficient solution for scalable structured data storage.

- **Nostr**: A decentralized event system. It is used to handle events and responses between users and providers.

- **IPFS**: InterPlanetary File System, a protocol and network designed to create a content-addressable, peer-to-peer method of storing and sharing hypermedia in a distributed file system.

- **Filecoin Virtual Machine**: The computational layer of the Filecoin network where smart contracts are executed.

## Getting Started

This project was bootstrapped with [Create React App](https://create-react-app.dev/).

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository

`git clone https://github.com/HackFS2023/ether-engine-ui.git`

2. Install NPM packages

`npm install`


### Usage

In the project directory, you can run:

- `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

- `npm test`

Launches the test runner in the interactive watch mode.

- `npm run build`

Builds the app for production to the `build` folder.

- `npm run eject`

Note: this is a one-way operation. Once you eject, you can't go back!

## Instructions

At a high level, the workflow of the Ether Engine UI is as follows:

1. A user creates a request for a computation.
2. A developer discovers this job and creates a Docker specification that satisfies the user's request.
3. The user then computes the job using a smart contract that interacts with Lilypad (Bachalao Oracle FVM).
4. Once the computation is complete, the user can download the output results.

## License

[MIT](https://choosealicense.com/licenses/mit/)
