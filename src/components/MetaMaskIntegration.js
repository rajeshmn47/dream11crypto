import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import axios from "axios";
import contractABI from '../config/dbcAbi';

const contractAddress = "0x462A2aCb9128734770A3bd3271276966ad6fc22C";
const fixedRecipientAddress = "0xac96ceaf54eb9511a6664806f2e0649ea02c2fd7"; // Fixed recipient address

const MetaMaskIntegration = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState(""); // Amount to send
  const [status, setStatus] = useState(""); // Status messages

  // ✅ Initialize Web3 on Load
  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
      } else {
        console.log("MetaMask not installed!");
      }
    };
    init();
  }, []);

  // ✅ Connect MetaMask Wallet
  const connectWallet = async () => {
    try {
      if (!web3) return alert("Web3 not initialized. Install MetaMask.");
      if (!window.ethereum) {
        alert("MetaMask is not installed! Please install it from https://metamask.io/");
        return;
      }
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x13882") { // 0x13882 is 80002 in hex
        alert("⚠️ Please switch to Polygon Amoy Testnet in MetaMask!");
        await switchToPolygonTestnet();
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      fetchBalance(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // ✅ Switch to Polygon Amoy Testnet
  const switchToPolygonTestnet = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // Try switching first
      });
    } catch (switchError) {
      // If chain is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.maticvigil.com/'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            },
          ],
        });
      } else {
        console.error("Error switching chain:", switchError);
      }
    }
  };

  // ✅ Fetch Balance
  const fetchBalance = async (address) => {
    if (web3) {
      const balance = await web3.eth.getBalance(address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    }
  };

  // ✅ Send POL Transaction
  const sendPOL = async () => {
    if (!web3 || !account || !amount) {
      return alert("Enter amount!");
    }

    try {
      const weiAmount = web3.utils.toWei(amount, "ether");
      setStatus("🚀 Sending transaction...");

      const gasPrice = await web3.eth.getGasPrice(); // Fetch current gas price
      const tx = await web3.eth.sendTransaction({
        from: account,
        to: fixedRecipientAddress,
        value: weiAmount,
        gas: 21000, // Gas limit for transfers
        gasPrice: web3.utils.toWei("5", "gwei"), // Explicit gas price
      });

      console.log("✅ Transaction successful:", tx);
      setStatus(`✅ Transaction Hash: ${tx.transactionHash}`);
      fetchBalance(account); // Update balance after transaction

      // Send transaction details to backend
      await axios.post("/api/crypto/sendDBC", {
        sender: account,
        recipient: fixedRecipientAddress,
        amount,
        txHash: tx.transactionHash
      });

    } catch (error) {
      console.error("❌ Transaction failed:", error);
      setStatus("❌ Transaction failed. Check gas settings.");
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Polygon Amoy Testnet - POL Transfer</h2>
      {account ? (
        <>
          <p><strong>Connected Wallet:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} POL</p>
          <input
            type="number"
            placeholder="Amount (POL)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "10px", width: "300px", margin: "10px" }}
          />
          <br />
          <button onClick={sendPOL} style={{ padding: "10px 20px", fontSize: "16px" }}>
            Send POL
          </button>
          <p>{status}</p>
        </>
      ) : (
        <button onClick={connectWallet} style={{ padding: "10px 20px", fontSize: "16px" }}>
          Connect MetaMask
        </button>
      )}
    </div>
  );
};

export default MetaMaskIntegration;
