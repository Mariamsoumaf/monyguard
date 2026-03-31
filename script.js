document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("transaction-form");
    const dateInput = document.getElementById("date");
    const typeInput = document.getElementById("type");
    const categoryInput = document.getElementById("category");
    const amountInput = document.getElementById("amount");

    const totalIncome = document.getElementById("total-income");
    const totalExpenses = document.getElementById("total-expenses");
    const finalBalance = document.getElementById("final-balance");
    const transactionList = document.getElementById("transaction-list");

    const initialBalanceInput = document.getElementById("initial-balance");
    const minimumBalanceInput = document.getElementById("minimum-balance");
    const alertStatus = document.getElementById("alert-status");

    const resetBtn = document.getElementById("reset-btn");
    const successMsg = document.getElementById("success-msg");

    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let initialBalance = Number(localStorage.getItem("initialBalance")) || 0;
    let minimumBalance = Number(localStorage.getItem("minimumBalance")) || 0;

    initialBalanceInput.value = initialBalance || "";
    minimumBalanceInput.value = minimumBalance || "";
    dateInput.valueAsDate = new Date();

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const today = new Date().toISOString().split("T")[0];
        if (dateInput.value > today) {
            alert("Date cannot be in the future");
            return;
        }

        const transaction = {
            date: dateInput.value,
            type: typeInput.value,
            category: categoryInput.value,
            amount: Number(amountInput.value)
        };

        if (transaction.date === "" || transaction.amount <= 0 || isNaN(transaction.amount)) {
            alert("Please enter valid data");
            return;
        }

        transactions.push(transaction);
        saveTransactions();
        updateSummary();
        renderTransactions();
        updateGoalStatus();

        successMsg.style.display = "block";
        setTimeout(() => successMsg.style.display = "none", 2000);

        form.reset();
        dateInput.valueAsDate = new Date();
    });

    initialBalanceInput.addEventListener("input", function () {
        initialBalance = Number(initialBalanceInput.value) || 0;
        localStorage.setItem("initialBalance", initialBalance);
        updateSummary();
        updateGoalStatus();
    });

    minimumBalanceInput.addEventListener("input", function () {
        minimumBalance = Number(minimumBalanceInput.value) || 0;
        localStorage.setItem("minimumBalance", minimumBalance);
        updateGoalStatus();
    });

    function updateSummary() {
        let income = 0;
        let expenses = 0;

        transactions.forEach(function (transaction) {
            if (transaction.type === "income") {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });

        const balance = initialBalance + income - expenses;

        totalIncome.textContent = income + " USD";
        totalExpenses.textContent = expenses + " USD";
        finalBalance.textContent = balance + " USD";

        if (balance >= 0) {
            finalBalance.style.color = "#16a34a";
        } else {
            finalBalance.style.color = "#dc2626";
        }
    }

    function renderTransactions() {
        transactionList.innerHTML = "";

        transactions.forEach(function (transaction, index) {
            const row = document.createElement("tr");
            const typeClass = transaction.type === "income" ? "income-text" : "expense-text";

            row.innerHTML = `
                <td>${transaction.date}</td>
                <td class="${typeClass}">${transaction.type}</td>
                <td>${transaction.category}</td>
                <td>${transaction.amount} USD</td>
                <td><button class="delete-btn" onclick="window.deleteTransaction(${index})">Delete</button></td>
            `;

            transactionList.appendChild(row);
        });
    }

    function saveTransactions() {
        localStorage.setItem("transactions", JSON.stringify(transactions));
    }

    function updateGoalStatus() {
        let income = 0;
        let expenses = 0;

        transactions.forEach(function (transaction) {
            if (transaction.type === "income") {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });

        const balance = initialBalance + income - expenses;

        if (balance < minimumBalance && minimumBalance > 0) {
            alertStatus.textContent = "Warning: Balance is below the safe limit";
            alertStatus.classList.remove("safe-text");
            alertStatus.classList.add("danger-text");
        } else {
            alertStatus.textContent = "Safe";
            alertStatus.classList.remove("danger-text");
            alertStatus.classList.add("safe-text");
        }
    }

    function deleteTransaction(index) {
        transactions.splice(index, 1);
        saveTransactions();
        updateSummary();
        renderTransactions();
        updateGoalStatus();
    }

    window.deleteTransaction = deleteTransaction;

    resetBtn.addEventListener("click", function () {
        const confirmDelete = confirm("Are you sure you want to delete ALL data?");
        if (confirmDelete) {
            localStorage.clear();
            transactions = [];
            initialBalance = 0;
            minimumBalance = 0;

            form.reset();
            initialBalanceInput.value = "";
            minimumBalanceInput.value = "";
            dateInput.valueAsDate = new Date();

            updateSummary();
            renderTransactions();
            updateGoalStatus();
            successMsg.style.display = "none";
        }
    });

    updateSummary();
    renderTransactions();
    updateGoalStatus();
});