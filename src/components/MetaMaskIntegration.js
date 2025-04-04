import React, { useState, useEffect } from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import axios from "axios";
import contractABI from '../config/dbcAbi';

const contractAddress = "0x462A2aCb9128734770A3bd3271276966ad6fc22C"; // DBC Contract Address
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
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x13882',
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'DBC', symbol: 'DBC', decimals: 18 },
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

  // ✅ Fetch DBC Token Balance
  const fetchBalance = async (address) => {
    if (web3) {
      try {
        const contract = new web3.eth.Contract(contractABI, contractAddress);
        const balance = await contract.methods.balanceOf(address).call();
        setBalance(web3.utils.fromWei(balance, "ether"));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  // ✅ Send DBC Transaction
  const sendDBC = async () => {
    if (!web3 || !account || !amount) {
      return alert("Enter amount!");
    }

    try {
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const weiAmount = web3.utils.toWei(amount, "ether");
      setStatus("🚀 Sending transaction...");

      const gasPrice = await web3.eth.getGasPrice(); // Fetch current gas price
      const gasLimit = 100000; // Adjust gas limit for token transfers

      // Call the `transfer` method of the DBC contract
      const tx = await contract.methods.transfer(fixedRecipientAddress, weiAmount).send({
        from: account,
        gas: gasLimit,
        gasPrice,
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
      <h2>Polygon Amoy Testnet - DBC Transfer</h2>
      {account ? (
        <>
          <p><strong>Connected Wallet:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} DBC</p>
          <input
            type="number"
            placeholder="Amount (DBC)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "10px", width: "300px", margin: "10px" }}
          />
          <br />
          <button onClick={sendDBC} style={{ padding: "10px 20px", fontSize: "16px" }}>
            Send DBC
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
