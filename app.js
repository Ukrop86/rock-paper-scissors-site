// Адреса вашого контракту на мережі
const CONTRACT_ADDRESS = '0x3B5fd80a8f398f74BE20B3d97f994311e8D00593'; // замініть на адресу вашого контракту

// ABI контракту
const ABI = [
    {
        "inputs": [],
        "name": "contractBalance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "enum RockPaperScissors.Choice",
                "name": "playerChoice",
                "type": "uint8"
            }
        ],
        "name": "placeBet",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "player",
                "type": "address"
            }
        ],
        "name": "playGame",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let web3;
let contract;
let account;

window.onload = async function() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

        document.getElementById('connectWalletBtn').onclick = async function() {
            await connectWallet();
        };

        document.getElementById('withdrawBtn').onclick = async function() {
            const amount = document.getElementById('withdrawAmount').value;
            if (amount <= 0 || !account) {
                alert('Будь ласка, введіть суму для виведення!');
                return;
            }
            await withdrawFromContract(amount);
        };
    } else {
        alert('Будь ласка, встановіть MetaMask!');
    }
};

async function connectWallet() {
    const accounts = await web3.eth.requestAccounts();
    account = accounts[0];
    document.getElementById('walletInfo').innerText = `Підключено: ${account}`;
    document.getElementById('wallet-section').classList.add('hidden');
    document.getElementById('betting-section').classList.remove('hidden');
    document.getElementById('contract-balance-section').classList.remove('hidden');
    await getContractBalance();
}

async function getContractBalance() {
    const balance = await contract.methods.contractBalance().call();
    const etherBalance = web3.utils.fromWei(balance, 'ether');
    document.getElementById('contractBalance').innerText = etherBalance;
}

// Функція для ставлення ставки
async function placeBet(choice) {
    const betAmount = document.getElementById('betAmount').value;
    if (betAmount <= 0 || !account) {
        alert('Будь ласка, введіть ставку!');
        return;
    }

    const weiAmount = web3.utils.toWei(betAmount, 'ether');
    try {
        await contract.methods.placeBet(choice).send({
            from: account,
            value: weiAmount
        });
        document.getElementById('bettingResult').innerText = 'Ставка зроблена успішно!';
        document.getElementById('game-result-section').classList.remove('hidden');
        document.getElementById('betting-section').classList.add('hidden');
        await getContractBalance();
    } catch (error) {
        alert('Сталася помилка при ставці!');
    }
}

// Функція для початку нової гри
async function startNewGame() {
    try {
        await contract.methods.playGame(account).send({ from: account });
        document.getElementById('gameResult').innerText = 'Гра завершена!';
        document.getElementById('startNewGameBtn').disabled = true;
    } catch (error) {
        alert('Сталася помилка при запуску гри!');
    }
}

// Функція для виведення коштів з контракту
async function withdrawFromContract(amount) {
    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');
    try {
        await contract.methods.withdraw(weiAmount).send({
            from: account
        });
        alert(`Виведено ${amount} ETH з контракту!`);
        await getContractBalance(); // Оновлення балансу контракту
    } catch (error) {
        alert('Сталася помилка при виведенні!');
    }
}
