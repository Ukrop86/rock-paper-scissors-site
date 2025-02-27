// Перевірка на наявність Web3
if (typeof Web3 !== 'undefined') {
    console.log("Web3 is available!");
} else {
    console.log("Web3 is not available. Make sure you have MetaMask or a similar extension installed.");
}

let web3;
let contract;

async function connectWallet() {
    if (window.ethereum) {
        console.log("Ethereum wallet detected");
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            const accounts = await web3.eth.getAccounts();
            document.getElementById("status").innerText = `Connected: ${accounts[0]}`;
            
            contract = new web3.eth.Contract(contractABI, contractAddress);
        } catch (error) {
            console.error("Error requesting accounts: ", error);
            document.getElementById("status").innerText = "Connection failed!";
        }
    } else {
        alert("No Ethereum wallet detected. Install MetaMask or OKX Wallet.");
    }
}

async function playGame(move) {
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }

    const accounts = await web3.eth.getAccounts();
    const betAmount = web3.utils.toWei("0.01", "ether"); // Мінімальна ставка

    try {
        await contract.methods.createGame(web3.utils.keccak256(move.toString())).send({
            from: accounts[0],
            value: betAmount
        });
        document.getElementById("status").innerText = "Game created!";
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "Error occurred!";
    }
}

document.getElementById("connectWallet").addEventListener("click", connectWallet);
