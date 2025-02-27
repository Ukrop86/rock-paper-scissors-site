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
            
            contract = new web3.eth.Contract(contractABI, contractAddress); // контракт ABI та адресу
            console.log("Contract initialized:", contract);
        } catch (error) {
            console.error("Error requesting accounts: ", error);
            document.getElementById("status").innerText = "Connection failed!";
        }
    } else {
        alert("No Ethereum wallet detected. Please install MetaMask or another supported wallet.");
    }
}

async function playGame(move) {
    console.log(`Play game with move: ${move}`);
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }

    const betAmount = document.getElementById("betAmount").value || 0.01; // Вибір ставки
    const accounts = await web3.eth.getAccounts();

    // Перевірка, чи є ставка
    if (betAmount < 0.01) {
        alert("Bet must be at least 0.01 ETH!");
        return;
    }

    const moveHash = web3.utils.keccak256(move.toString()); // Генерація хешу вибраного ходу
    console.log(`Generated moveHash: ${moveHash}`);

    try {
        // Створення гри на контракті
        await contract.methods.createGame(moveHash).send({
            from: accounts[0],
            value: web3.utils.toWei(betAmount.toString(), "ether")
        });
        document.getElementById("status").innerText = `Game created with bet: ${betAmount} ETH`;
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "Error occurred during game creation!";
    }
}

// Функція для гри з ботом
async function playAgainstBot() {
    console.log("Playing against bot...");
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }

    const betAmount = document.getElementById("betAmount").value || 0.01; // Вибір ставки
    const move = prompt("Choose your move (Rock, Paper, Scissors):");
    const moveHash = web3.utils.keccak256(move); // Генерація хешу для руху гравця
    console.log(`Move chosen: ${move}, Move hash: ${moveHash}`);

    const accounts = await web3.eth.getAccounts();

    try {
        // Створення гри з ботом
        await contract.methods.createGame(moveHash).send({
            from: accounts[0],
            value: web3.utils.toWei(betAmount.toString(), "ether")
        });
        
        document.getElementById("status").innerText = `You played against bot with bet: ${betAmount} ETH`;

        // Прослуховування події GameRevealed для отримання результату гри
        contract.events.GameRevealed({ filter: { player: accounts[0] } }, function(error, event) {
            if (error) {
                console.error(error);
                document.getElementById("status").innerText = "Error while revealing game result.";
            } else {
                // Виведення результату гри
                const result = event.returnValues.result; // "You Win", "You Lose", "Draw"
                console.log(`Game result: ${result}`);
                document.getElementById("status").innerText = `Game result: ${result}`;
            }
        });
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "Error occurred during bot game creation!";
    }
}



// Функція для отримання коштів з крана
async function claimFaucet() {
    console.log("Claiming faucet...");
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }

    const accounts = await web3.eth.getAccounts();

    try {
        await contract.methods.claimFaucet().send({
            from: accounts[0]
        });
        document.getElementById("status").innerText = "Faucet claimed successfully!";
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "Error occurred during faucet claim!";
    }
}

// Оновлення лідерборду
async function updateLeaderboard() {
    console.log("Updating leaderboard...");
    if (!contract) {
        alert("Connect wallet first!");
        return;
    }

    try {
        const leaderboard = await contract.methods.getLeaderboard().call(); // Отримання лідерборду з контракту
        const leaderboardTable = document.getElementById("leaderboardData");
        leaderboardTable.innerHTML = ''; // Очищуємо попередні дані

        leaderboard.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player[0]}</td>
                <td>${web3.utils.fromWei(player[1], 'ether')} ETH</td>
            `;
            leaderboardTable.appendChild(row);
        });
    } catch (error) {
        console.error(error);
        document.getElementById("status").innerText = "Error fetching leaderboard!";
    }
}

// Оновлення лідерборду через певний інтервал
setInterval(updateLeaderboard, 5000);

// Подія для підключення гаманця
document.getElementById("connectWallet").addEventListener("click", connectWallet);

// Подія для гри з ботом
document.getElementById("playBot").addEventListener("click", playAgainstBot);

// Подія для крана
document.getElementById("claimFaucet").addEventListener("click", claimFaucet);

// Подія для вибору ходу в грі
document.getElementById("playRock").addEventListener("click", () => {
    console.log("Rock button clicked");
    playGame(1);
});
document.getElementById("playPaper").addEventListener("click", () => {
    console.log("Paper button clicked");
    playGame(2);
});
document.getElementById("playScissors").addEventListener("click", () => {
    console.log("Scissors button clicked");
    playGame(3);
});
