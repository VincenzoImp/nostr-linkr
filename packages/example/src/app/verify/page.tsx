"use client";

import { useState } from "react";
import { linkrClient } from "@/lib/client";
import { ResultDisplay } from "@/components/ResultDisplay";
import { CodeBlock } from "@/components/CodeBlock";
import {
  createLinkEvent,
  hashEvent,
  hashAndPrepare,
  serializeEvent,
  validateLinkEvent,
  isValidPubkey,
  isTimestampValid,
  addressToContent,
  isValidAddressContent,
  pubkeyToBytes32,
  bytes32ToPubkey,
  isValidSchnorrSig,
} from "nostr-linkr";

export default function VerifyPage() {
  const [pubkey, setPubkey] = useState("3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d");
  const [address, setAddress] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  const [timestamp, setTimestamp] = useState(String(Math.floor(Date.now() / 1000)));

  // Event creation results
  const [eventJson, setEventJson] = useState<string | null>(null);
  const [serialized, setSerialized] = useState<string | null>(null);
  const [eventHash, setEventHash] = useState<string | null>(null);
  const [onChainHash, setOnChainHash] = useState<string | null>(null);
  const [hashMatch, setHashMatch] = useState<boolean | null>(null);
  const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Util demo results
  const [utilResults, setUtilResults] = useState<Record<string, string> | null>(null);

  const runEventDemo = async () => {
    setLoading(true);
    try {
      // 1. Create unsigned event
      const event = createLinkEvent(address, pubkey, Number(timestamp));
      setEventJson(JSON.stringify(event, null, 2));

      // 2. Serialize (NIP-01 canonical)
      const ser = serializeEvent(event);
      setSerialized(ser);

      // 3. Hash
      const hash = hashEvent(event);
      setEventHash(hash);

      // 4. hashAndPrepare
      const prepared = hashAndPrepare(event);

      // 5. Compare with on-chain hash
      try {
        const chainHash = await linkrClient.getEventHashOnChain(event);
        const chainHashHex = chainHash.startsWith("0x") ? chainHash.slice(2) : chainHash;
        setOnChainHash(chainHashHex);
        setHashMatch(hash === chainHashHex);
      } catch {
        setOnChainHash("Contract not available");
        setHashMatch(null);
      }

      // 6. Validate (will fail since we don't have a real signature)
      const fakeSignedEvent = { ...prepared, sig: "a".repeat(128) };
      const result = validateLinkEvent(fakeSignedEvent, address);
      setValidation(result);
    } finally {
      setLoading(false);
    }
  };

  const runUtilDemo = () => {
    const content = addressToContent(address);
    const bytes32 = pubkeyToBytes32(pubkey);
    const backToPk = bytes32ToPubkey(bytes32);
    const tsValid = isTimestampValid(Number(timestamp));

    setUtilResults({
      "isValidPubkey(pubkey)": String(isValidPubkey(pubkey)),
      "addressToContent(address)": content,
      "isValidAddressContent(content)": String(isValidAddressContent(content)),
      "pubkeyToBytes32(pubkey)": bytes32,
      "bytes32ToPubkey(bytes32)": backToPk ?? "null",
      "isValidSchnorrSig('a'.repeat(128))": String(isValidSchnorrSig("a".repeat(128))),
      "isTimestampValid(timestamp)": JSON.stringify(tsValid),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Event Creation & Verification</h1>
        <p className="text-zinc-400">
          Create, hash, serialize, and validate Nostr linking events. Compare client-side and on-chain hashes.
        </p>
      </div>

      {/* Input */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Input Parameters</h2>
        <input className="input" placeholder="Nostr pubkey (64 hex)" value={pubkey} onChange={(e) => setPubkey(e.target.value)} />
        <input className="input" placeholder="Ethereum address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="input" placeholder="Timestamp (Unix seconds)" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} />
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={runEventDemo} disabled={loading}>
            {loading ? "Running..." : "Run Event Pipeline"}
          </button>
          <button className="btn btn-secondary" onClick={runUtilDemo}>
            Run Utility Functions
          </button>
        </div>
      </div>

      {/* Event Pipeline Results */}
      {eventJson && (
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold">Event Pipeline</h2>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">1. createLinkEvent()</p>
            <CodeBlock code={eventJson} />
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">2. serializeEvent() — NIP-01 canonical</p>
            <ResultDisplay label="Serialized" value={serialized} mono />
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">3. hashEvent() — SHA-256</p>
            <ResultDisplay label="Client-side hash" value={eventHash} mono />
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">4. getEventHashOnChain() — Contract SHA-256</p>
            <ResultDisplay label="On-chain hash" value={onChainHash} mono />
            {hashMatch !== null && (
              <div className={`mt-2 ${hashMatch ? "badge badge-success" : "badge badge-error"}`}>
                {hashMatch ? "Hashes match!" : "Hash mismatch!"}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-zinc-400 mb-2">5. validateLinkEvent()</p>
            {validation && (
              <div className="space-y-2">
                <span className={`badge ${validation.valid ? "badge-success" : "badge-warning"}`}>
                  {validation.valid ? "Valid" : `${validation.errors.length} issue(s)`}
                </span>
                {validation.errors.map((err, i) => (
                  <p key={i} className="text-sm text-amber-400">• {err}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Utility Functions */}
      {utilResults && (
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Utility Functions</h2>
          {Object.entries(utilResults).map(([key, value]) => (
            <ResultDisplay key={key} label={key} value={value} mono />
          ))}
          <CodeBlock code={`import {
  isValidPubkey, addressToContent, isValidAddressContent,
  pubkeyToBytes32, bytes32ToPubkey, isValidSchnorrSig,
  isTimestampValid,
} from "nostr-linkr";`} />
        </div>
      )}
    </div>
  );
}
