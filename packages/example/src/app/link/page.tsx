"use client";

import "@/lib/types";
import { useState } from "react";
import { ResultDisplay } from "@/components/ResultDisplay";
import { CodeBlock } from "@/components/CodeBlock";
import {
  createNostrLinkrClient,
  createAndSignLinkEvent,
  createLinkEvent,
  hashAndPrepare,
  validateLinkEvent,
} from "nostr-linkr";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { hardhat } from "viem/chains";

export default function LinkPage() {
  const [step, setStep] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [nostrPubkey, setNostrPubkey] = useState<string | null>(null);
  const [signedEvent, setSignedEvent] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setError(null);
    try {
      if (!window.ethereum) {
        setError("No Ethereum wallet found. Install MetaMask or similar.");
        return;
      }
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum),
      });
      const [address] = await walletClient.requestAddresses();
      setWalletAddress(address);
      setStep(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect wallet");
    }
  };

  const connectNostr = async () => {
    setError(null);
    try {
      if (!window.nostr) {
        setError("No Nostr extension found. Install Alby or nos2x.");
        return;
      }
      const pk = await window.nostr.getPublicKey();
      setNostrPubkey(pk);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get Nostr pubkey");
    }
  };

  const signEvent = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!window.nostr || !walletAddress) return;

      const signed = await createAndSignLinkEvent(window.nostr, walletAddress);
      setSignedEvent(JSON.stringify(signed, null, 2));

      const { valid, errors } = validateLinkEvent(signed, walletAddress);
      setValidationResult(valid ? "Valid! Ready for on-chain submission." : `Issues: ${errors.join("; ")}`);
      setStep(3);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to sign event");
    } finally {
      setLoading(false);
    }
  };

  const simulateAndSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!window.ethereum || !signedEvent) return;

      const publicClient = createPublicClient({ chain: hardhat, transport: http() });
      const walletClient = createWalletClient({ chain: hardhat, transport: custom(window.ethereum) });

      const linkr = createNostrLinkrClient({
        chain: hardhat,
        publicClient,
        walletClient,
      });

      // Simulate first
      const parsed = JSON.parse(signedEvent);
      try {
        const sim = await linkr.simulatePushLink(parsed);
        setGasEstimate(String(sim.gasEstimate));
      } catch (e) {
        setGasEstimate("Simulation failed: " + (e instanceof Error ? e.message : "unknown"));
      }

      // Submit
      const hash = await linkr.pushLink(parsed);
      setTxHash(hash);
      setStep(4);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const unlinkIdentity = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!window.ethereum) return;

      const publicClient = createPublicClient({ chain: hardhat, transport: http() });
      const walletClient = createWalletClient({ chain: hardhat, transport: custom(window.ethereum) });

      const linkr = createNostrLinkrClient({
        chain: hardhat,
        publicClient,
        walletClient,
      });

      const hash = await linkr.pullLink();
      setTxHash(hash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to unlink");
    } finally {
      setLoading(false);
    }
  };

  const manualDemo = () => {
    const event = createLinkEvent(
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
    );
    const prepared = hashAndPrepare(event);
    setSignedEvent(JSON.stringify({ ...prepared, sig: "(requires NIP-07 signer)" }, null, 2));
    setStep(2);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Identity Linking</h1>
        <p className="text-zinc-400">
          Full flow: connect wallet, connect Nostr, sign event, simulate, submit on-chain, or unlink.
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {["Connect Wallet", "Connect Nostr", "Sign Event", "Submit", "Done"].map((label, i) => (
          <span key={i} className={`badge ${step >= i ? "badge-success" : "bg-zinc-800 text-zinc-500 border border-zinc-700"}`}>
            {i + 1}. {label}
          </span>
        ))}
      </div>

      {/* Step 0: Connect Wallet */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">1. Connect Ethereum Wallet</h2>
        {walletAddress ? (
          <ResultDisplay label="Connected Address" value={walletAddress} mono />
        ) : (
          <button className="btn btn-primary" onClick={connectWallet}>Connect Wallet</button>
        )}
      </div>

      {/* Step 1: Connect Nostr */}
      {step >= 1 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">2. Connect Nostr Extension</h2>
          {nostrPubkey ? (
            <ResultDisplay label="Nostr Public Key" value={nostrPubkey} mono />
          ) : (
            <div className="flex gap-3">
              <button className="btn btn-primary" onClick={connectNostr}>Connect Nostr</button>
              <button className="btn btn-secondary" onClick={manualDemo}>Demo (no extension)</button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Sign Event */}
      {step >= 2 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">3. Create & Sign Linking Event</h2>
          <button className="btn btn-primary" onClick={signEvent} disabled={loading || !window.nostr}>
            {loading ? "Signing..." : "createAndSignLinkEvent()"}
          </button>
          {signedEvent && <CodeBlock code={signedEvent} />}
          {validationResult && <ResultDisplay label="validateLinkEvent()" value={validationResult} />}
          <CodeBlock code={`const signed = await createAndSignLinkEvent(window.nostr!, walletAddress);
const { valid, errors } = validateLinkEvent(signed, walletAddress);`} />
        </div>
      )}

      {/* Step 3: Submit */}
      {step >= 3 && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">4. Simulate & Submit On-Chain</h2>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={simulateAndSubmit} disabled={loading}>
              {loading ? "Submitting..." : "pushLink()"}
            </button>
            <button className="btn btn-danger" onClick={unlinkIdentity} disabled={loading}>
              pullLink()
            </button>
          </div>
          {gasEstimate && <ResultDisplay label="simulatePushLink() gas estimate" value={gasEstimate} />}
          {txHash && <ResultDisplay label="Transaction Hash" value={txHash} mono />}
          <CodeBlock code={`// Simulate first
const { gasEstimate } = await linkr.simulatePushLink(signedEvent);

// Submit
const txHash = await linkr.pushLink(signedEvent);

// Unlink
const unlinkHash = await linkr.pullLink();`} />
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
