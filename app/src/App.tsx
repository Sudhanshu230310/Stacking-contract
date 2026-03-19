import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import idl from './idl/staking_contract.json';
import { type StakingContract } from './types/staking_contract';
import './App.css';

const PROGRAM_ID = new PublicKey('AZuXHBmsM91NMd2Ws6ovfknB32x2VQnmsKQ66J68nFHn');

function App() {
  const { connection } = useConnection();
  const { publicKey, wallet } = useWallet();
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [stakeInput, setStakeInput] = useState<string>('');
  const [unstakeInput, setUnstakeInput] = useState<string>('');

  const getProgram = useCallback(() => {
    if (!wallet || !wallet.adapter) return null;
    const provider = new AnchorProvider(connection, wallet.adapter as any, { commitment: 'confirmed' });
    return new Program(idl as StakingContract, provider);
  }, [connection, wallet]);

  const fetchAccount = useCallback(async () => {
    if (!publicKey) return;
    try {
      const program = getProgram();
      if (!program) return;

      const [pdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("client1"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      const account = await (program.account as any).stakeAccount.fetch(pdaAccount);
      setStakedAmount(account.stakedAmount.toNumber() / LAMPORTS_PER_SOL);
      setTotalPoints(account.totalPoints.toNumber() / 1_000_000);
    } catch (e) {
      console.log("Account not found or error fetching", e);
      setStakedAmount(0);
      setTotalPoints(0);
    }
  }, [publicKey, getProgram]);

  useEffect(() => {
    if (publicKey) {
      fetchAccount();
      const interval = setInterval(fetchAccount, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [publicKey, fetchAccount]);

  const handleCreateAccount = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) return;

      const [pdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("client1"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      await (program.methods as any)
        .createPdaAccount()
        .accounts({
          payer: publicKey,
          // @ts-ignore
          pdaAccount,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      await fetchAccount();
      alert("Staking account created!");
    } catch (e) {
      console.error(e);
      alert("Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async () => {
    if (!publicKey || !stakeInput) return;
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) return;

      const amount = new BN(parseFloat(stakeInput) * LAMPORTS_PER_SOL);
      const [pdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("client1"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      await (program.methods as any)
        .stake(amount)
        .accounts({
          user: publicKey,
          // @ts-ignore
          pdaAccount,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStakeInput('');
      await fetchAccount();
      alert("Staked successfully!");
    } catch (e) {
      console.error(e);
      alert("Error staking");
    } finally {
      setLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!publicKey || !unstakeInput) return;
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) return;

      const amount = new BN(parseFloat(unstakeInput) * LAMPORTS_PER_SOL);
      const [pdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("client1"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      await (program.methods as any)
        .unstake(amount)
        .accounts({
          user: publicKey,
          // @ts-ignore
          pdaAccount,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setUnstakeInput('');
      await fetchAccount();
      alert("Unstaked successfully!");
    } catch (e) {
      console.error(e);
      alert("Error unstaking");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const program = getProgram();
      if (!program) return;

      const [pdaAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("client1"), publicKey.toBuffer()],
        PROGRAM_ID
      );

      await (program.methods as any)
        .claimPoints()
        .accounts({
          user: publicKey,
          // @ts-ignore
          pdaAccount,
        })
        .rpc();

      await fetchAccount();
      alert("Points claimed!");
    } catch (e) {
      console.error(e);
      alert("Error claiming points");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <header className="header">
          <h1 className="logo">SOL Staking</h1>
          <WalletMultiButton />
        </header>

        {publicKey ? (
          <div className="grid-layout">
            {/* Stats Card */}
            <div className="card">
              <h2 className="card-title">Dashboard</h2>
              <div className="stats-container">
                <div className="stat-group">
                  <p>Total Staked</p>
                  <p>{stakedAmount.toFixed(4)} SOL</p>
                </div>
                <div className="stat-group">
                  <p>Points Earned</p>
                  <p className="points-value">{totalPoints.toFixed(2)} pts</p>
                </div>
                <button 
                  onClick={handleClaim}
                  disabled={loading || totalPoints === 0}
                  className="btn-primary"
                >
                  {loading ? 'Processing...' : 'Claim Points'}
                </button>
              </div>
            </div>

            {/* Actions Card */}
            <div className="actions-stack">
              {stakedAmount === 0 && totalPoints === 0 ? (
                <div className="card">
                  <h3 className="card-title">Get Started</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    You need to initialize your staking account first.
                  </p>
                  <button 
                    onClick={handleCreateAccount}
                    disabled={loading}
                    className="btn-primary"
                    style={{ background: 'white', color: 'black' }}
                  >
                    Initialize Account
                  </button>
                </div>
              ) : (
                <>
                  <div className="card action-form">
                    <h3 className="card-title">Stake SOL</h3>
                    <div className="input-group">
                      <input 
                        type="number" 
                        placeholder="Amount in SOL"
                        value={stakeInput}
                        onChange={(e) => setStakeInput(e.target.value)}
                      />
                      <button 
                        onClick={handleStake}
                        disabled={loading || !stakeInput}
                        className="btn-action btn-stake"
                      >
                        Stake
                      </button>
                    </div>
                  </div>

                  <div className="card action-form">
                    <h3 className="card-title">Unstake SOL</h3>
                    <div className="input-group">
                      <input 
                        type="number" 
                        placeholder="Amount in SOL"
                        value={unstakeInput}
                        onChange={(e) => setUnstakeInput(e.target.value)}
                      />
                      <button 
                        onClick={handleUnstake}
                        disabled={loading || !unstakeInput}
                        className="btn-action btn-unstake"
                      >
                        Unstake
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <h2>Connect Your Wallet</h2>
            <p>
              Stake your SOL and earn points. Connect your wallet to view your dashboard and start staking.
            </p>
            <WalletMultiButton />
          </div>
        )}

        <footer className="footer">
          SOL Staking Contract Demo • Built with Anchor & React
        </footer>
      </div>
    </div>
  );
}

export default App;
