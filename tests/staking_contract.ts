import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingContract } from "../target/types/staking_contract";
import { expect } from "chai";

describe("staking_contract", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  const user = provider.wallet;

  const [pdaAccount] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("client1"), user.publicKey.toBuffer()],
    program.programId
  );

  it("Initializes the PDA account", async () => {
    try {
      await program.methods
        .createPdaAccount()
        .accounts({
          payer: user.publicKey,
          // @ts-ignore
          pdaAccount: pdaAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const account = await program.account.stakeAccount.fetch(pdaAccount);
      expect(account.owner.toString()).to.equal(user.publicKey.toString());
      expect(account.stakedAmount.toNumber()).to.equal(0);
      expect(account.totalPoints.toNumber()).to.equal(0);
    } catch (e) {
      // If already initialized, it's fine for manual runs
      if (!e.message.includes("already in use")) {
        throw e;
      }
    }
  });

  it("Stakes SOL", async () => {
    const stakeAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL);
    
    await program.methods
      .stake(stakeAmount)
      .accounts({
        user: user.publicKey,
        // @ts-ignore
        pdaAccount: pdaAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.stakeAccount.fetch(pdaAccount);
    expect(account.stakedAmount.toNumber()).to.equal(stakeAmount.toNumber());
  });

  it("Gets points (logs them)", async () => {
    await program.methods
      .getPoints()
      .accounts({
        user: user.publicKey,
        // @ts-ignore
        pdaAccount: pdaAccount,
      })
      .rpc();
  });

  it("Unstakes SOL", async () => {
    const unstakeAmount = new anchor.BN(0.5 * anchor.web3.LAMPORTS_PER_SOL);
    
    await program.methods
      .unstake(unstakeAmount)
      .accounts({
        user: user.publicKey,
        // @ts-ignore
        pdaAccount: pdaAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const account = await program.account.stakeAccount.fetch(pdaAccount);
    expect(account.stakedAmount.toNumber()).to.equal(0.5 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Claims points", async () => {
    await program.methods
      .claimPoints()
      .accounts({
        user: user.publicKey,
        // @ts-ignore
        pdaAccount: pdaAccount,
      })
      .rpc();

    const account = await program.account.stakeAccount.fetch(pdaAccount);
    expect(account.totalPoints.toNumber()).to.equal(0);
  });
});

