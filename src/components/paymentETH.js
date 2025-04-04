import styled from '@emotion/styled';
import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";
import axios from "axios";
import { API } from '../actions/userAction';
import { URL } from '../constants/userConstants';

const Wrapper = styled.div`
  font-family: system-ui !important;
  line-height: 1.2;
  background: #fff;
  margin-bottom: 20px;
  padding-top: 35px;
  padding-bottom: 39px;
  div {
    // border: 1px solid red;
  }
`;

const Logo = styled.div`
  left: -35px;
  width: 0px;
  height: 0px;
  background-color: #282c3f;
  box-shadow: 0 3px 5px 0 rgba(40, 44, 63, 0.4);
  top: -10px;
  padding: 0px !important;
`;

const Title = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: #282c3f;
  text-align: center;
  margin-bottom: 5px;
`;

const Wallet = styled.img`
  height: 50px;
  width: 50px;
  vertical-align: inherit;
  box-shadow: 0 3px 5px 0 rgba(40, 44, 63, 0.4);
`;

const WarningText = styled.p`
  font-size: 13px;
  color: #93959f;
  margin-bottom: 8px;
  font-weight: 300;
  line-height: 16px;
  overflow: hidden;
  border: 1px dashed #60b246;
  padding-right: 0px;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 10px;
  margin-top: 50px;
`;

const BalanceContainer = styled.div`
  margin-bottom: 20px;
  text-align: center;
  p {
    margin: 5px 0;
    font-size: 16px;
    color: #555;
  }
  h5 {
    margin: 5px 0;
    font-size: 18px;
    font-weight: 600;
    color: #000;
  }
`;

const fixedRecipientAddress = "0xac96ceaf54eb9511a6664806f2e0649ea02c2fd7"; // Fixed recipient address

function Payment() {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        if (user && user.wallet) {
          fetchWalletBalance(user.cryptoWallet);
          fetchUserBalance(user.wallet);
        }
      } else {
        console.log("MetaMask not installed!");
      }
    };
    init();
  }, [user]);

  const fetchWalletBalance = async (address) => {
    try {
      const balance = await web3.eth.getBalance(address);
      setWalletBalance(web3.utils.fromWei(balance, "ether"));
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  const fetchUserBalance = async (address) => {
    try {
      //const response = await axios.get(`/api/crypto/getBalance/${address}`);
      setUserBalance(user?.cryptoWallet);
    } catch (error) {
      console.error("Error fetching user balance:", error);
    }
  };

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
      fetchWalletBalance(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

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

  const handlePayment = async (e) => {
    e.preventDefault();
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

      // Send transaction details to backend

      const data = await API.post(`${URL}/crypto/depositDBC`, {
        userAddress: account,
        amount,
        txHash: tx.transactionHash
      });

      fetchWalletBalance(account); // Update wallet balance
      fetchUserBalance(account); // Update user balance
      navigate('/');
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      setStatus("❌ Transaction failed. Check gas settings.");
    }
  };

  return (
    <Container>
      <Title>Add Amount</Title>
      <BalanceContainer>
        <p>Wallet Balance:</p>
        <h5>{walletBalance ? `${walletBalance} ETH` : "Loading..."}</h5>
        <p>User Balance:</p>
        <h5>{userBalance>-1 ? `eth ${userBalance}` : "Loading..."}</h5>
      </BalanceContainer>
      {account ? (
        <>
          <TextField
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount to be added"
            size="small"
          />
          <button className="paybtn" onClick={handlePayment}>
            Deposit
          </button>
          <p>{status}</p>
        </>
      ) : (
        <button className="paybtn" onClick={connectWallet}>
          Connect MetaMask
        </button>
      )}
    </Container>
  );
}

export default Payment;
