# Solana Staking Contract & Dashboard

A complete, end-to-end Solana staking application built with **Anchor (Rust)** and **React (Vite)**. Users can stake SOL, earn points based on their staked amount and time, and claim those points through a premium, glassmorphic dashboard.

## 🚀 Features

- **On-Chain Staking**: Securely stake and unstake SOL using Anchor-based PDAs.
- **Dynamic Rewards**: Earn points calculated per-second based on the amount of SOL staked.
- **Premium Dashboard**: A modern, responsive React frontend with real-time updates and Solana Wallet integration.
- **Robust Tests**: Comprehensive integration tests covering the entire lifecycle of a staking account.
- **Devnet Ready**: Fully configured for Solana Devnet with one-command deployment.

## 📁 Project Structure

- `programs/staking_contract`: The Anchor smart contract source code (Rust).
- `tests/`: Integration tests written in TypeScript.
- `app/`: The React frontend application (Vite + TS + Vanilla CSS).
- `Anchor.toml`: Anchor configuration file for different clusters.

## 🛠️ Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- [Node.js & npm](https://nodejs.org/en/download/)

### Contract Build & Test

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Build the contract:
   ```bash
   anchor build
   ```
3. Run integration tests:
   ```bash
   anchor test
   ```

### Frontend Setup

1. Navigate to the `app` directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment

### Contract (Devnet)

1. Ensure your Solana CLI is set to devnet:
   ```bash
   solana config set --url devnet
   ```
2. Airdrop SOL if needed:
   ```bash
   solana airdrop 2
   ```
3. Deploy:
   ```bash
   anchor deploy
   ```

### Frontend (Vercel)

The frontend can be deployed easily on Vercel:
1. Import the project in Vercel.
2. Set the **Root Directory** to `app`.
3. Vercel will automatically detect the Vite build settings.

## 📜 License

ISC
