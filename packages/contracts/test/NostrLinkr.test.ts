import { expect } from "chai";
import { ethers } from "hardhat";
import { NostrLinkr } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NostrLinkr", function () {
  let nostrLinkr: NostrLinkr;
  let deployer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  // Test constants
  const VALID_PUBKEY = "0x3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d";
  const VALID_PUBKEY_2 = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const ZERO_PUBKEY = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const VALID_KIND = 13372n;
  const VALID_TAGS = "[]";

  // 64-byte signature with valid range values
  const VALID_SIG =
    "0x" +
    "0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b" +
    "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b";

  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    const NostrLinkrFactory = await ethers.getContractFactory("NostrLinkr");
    nostrLinkr = (await NostrLinkrFactory.deploy()) as NostrLinkr;
    await nostrLinkr.waitForDeployment();
  });

  describe("Deployment", () => {
    it("should have empty mappings initially", async () => {
      expect(await nostrLinkr.addressPubkey(user1.address)).to.equal(ZERO_PUBKEY);
      expect(await nostrLinkr.pubkeyAddress(VALID_PUBKEY)).to.equal(ethers.ZeroAddress);
    });
  });

  describe("pushLinkr validation", () => {
    it("should revert with invalid signature length", async () => {
      const shortSig = "0x1234";
      const now = Math.floor(Date.now() / 1000);

      await expect(
        nostrLinkr.connect(user1).pushLinkr(VALID_PUBKEY, now, VALID_KIND, VALID_TAGS, shortSig),
      ).to.be.revertedWith("Invalid signature length");
    });

    it("should accept any event kind", async () => {
      const now = Math.floor(Date.now() / 1000);
      // Any kind should pass the kind check (no kind validation in contract)
      // Will revert on signature verification, NOT on kind
      await expect(
        nostrLinkr.connect(user1).pushLinkr(VALID_PUBKEY, now, 1n, VALID_TAGS, VALID_SIG),
      ).to.be.revertedWith("Invalid Nostr signature");
    });

    it("should accept non-empty tags", async () => {
      const now = Math.floor(Date.now() / 1000);
      const nonEmptyTags = '[["p","abc"]]';
      // Non-empty tags should pass the tags check (no tags validation in contract)
      // Will revert on signature verification, NOT on tags
      await expect(
        nostrLinkr.connect(user1).pushLinkr(VALID_PUBKEY, now, VALID_KIND, nonEmptyTags, VALID_SIG),
      ).to.be.revertedWith("Invalid Nostr signature");
    });

    it("should revert with timestamp too far in the future", async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 700; // 700s > 600s tolerance

      await expect(
        nostrLinkr.connect(user1).pushLinkr(VALID_PUBKEY, futureTime, VALID_KIND, VALID_TAGS, VALID_SIG),
      ).to.be.revertedWith("CreatedAt too far in the future");
    });

    it("should revert with timestamp too far in the past", async () => {
      const pastTime = Math.floor(Date.now() / 1000) - 90000; // 25 hours ago (> 24h tolerance)

      await expect(
        nostrLinkr.connect(user1).pushLinkr(VALID_PUBKEY, pastTime, VALID_KIND, VALID_TAGS, VALID_SIG),
      ).to.be.revertedWith("CreatedAt too far in the past");
    });
  });

  describe("pullLinkr", () => {
    it("should revert when no link exists", async () => {
      await expect(nostrLinkr.connect(user1).pullLinkr()).to.be.revertedWith("No link found for this address");
    });
  });

  describe("verifyNostrEvent", () => {
    it("should revert with invalid signature length", async () => {
      const fakeId = ethers.keccak256("0x00");
      const shortSig = "0x1234";

      await expect(
        nostrLinkr.verifyNostrEvent(fakeId, VALID_PUBKEY, 1000, 13372, "[]", "test", shortSig),
      ).to.be.revertedWith("Signature must be 64 bytes");
    });

    it("should revert when event ID doesn't match computed hash", async () => {
      const wrongId = ethers.keccak256("0x00");
      const now = 1700000000;

      await expect(
        nostrLinkr.verifyNostrEvent(wrongId, VALID_PUBKEY, now, 13372, "[]", "test", VALID_SIG),
      ).to.be.revertedWith("Event ID mismatch");
    });
  });

  describe("getEventHash consistency", () => {
    it("should produce consistent hashes with verifyNostrEvent serialization", async () => {
      const pubkey = VALID_PUBKEY;
      const createdAt = 1700000000;
      const kind = 13372;
      const tags = "[]";
      const content = "0xtest_content_address_placeholder00000";

      const hash = await nostrLinkr.getEventHash(pubkey, createdAt, kind, tags, content);

      expect(hash).to.not.equal(ZERO_PUBKEY);

      try {
        await nostrLinkr.verifyNostrEvent(hash, pubkey, createdAt, kind, tags, content, VALID_SIG);
      } catch (error: any) {
        expect(error.message).to.not.include("Event ID mismatch");
      }
    });
  });

  describe("Utility functions via getEventHash", () => {
    it("should compute non-zero hash for valid inputs", async () => {
      const hash = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 13372, "[]", "test");
      expect(hash).to.not.equal(ZERO_PUBKEY);
    });

    it("should produce different hashes for different inputs", async () => {
      const hash1 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 13372, "[]", "content1");
      const hash2 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 13372, "[]", "content2");
      expect(hash1).to.not.equal(hash2);
    });

    it("should produce different hashes for different timestamps", async () => {
      const hash1 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 13372, "[]", "test");
      const hash2 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000001, 13372, "[]", "test");
      expect(hash1).to.not.equal(hash2);
    });

    it("should produce different hashes for different pubkeys", async () => {
      const hash1 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 13372, "[]", "test");
      const hash2 = await nostrLinkr.getEventHash(VALID_PUBKEY_2, 1700000000, 13372, "[]", "test");
      expect(hash1).to.not.equal(hash2);
    });

    it("should produce different hashes for different kinds", async () => {
      const hash1 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 13372, "[]", "test");
      const hash2 = await nostrLinkr.getEventHash(VALID_PUBKEY, 1700000000, 1, "[]", "test");
      expect(hash1).to.not.equal(hash2);
    });
  });
});
