const nameInput = document.getElementById("name");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categoryInput = document.getElementById("category");
const addBtn = document.getElementById("add-button");
const listEl = document.getElementById("operations-list");
const totalEl = document.getElementById("total-amount");
const monthInput = document.getElementById("month");
const categoryFilter = document.getElementById("category-filter");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

const saveToLocalStorage = () => {
  localStorage.setItem("transactions", JSON.stringify(transactions));
};

const isDataCorrect = () => {
  if (!nameInput.value.trim()) {
    alert("Название пустое!");
    return false;
  }

  if (isNaN(+amountInput.value)) {
    alert("Проверьте корректность ввода");
    return false;
  }

  if (!dateInput.value) {
    alert("Введите дату!");
    return false;
  }

  return true;
};

const cleanInput = () => {
  nameInput.value = "";
  amountInput.value = "";
  dateInput.value = "";
};

const render = () => {
  listEl.innerHTML = "";

  const selectedCategoryFilter = categoryFilter.value;
  const selectedMonth = monthInput.value;
  let filteredTransactions = transactions;

  if (selectedMonth) {
    filteredTransactions = transactions.filter((tx) =>
      tx.date.startsWith(selectedMonth)
    );
  }

  if (selectedCategoryFilter !== "all") {
    filteredTransactions = filteredTransactions.filter(
      (tx) => tx.category === selectedCategoryFilter
    );
  }

  filteredTransactions.sort(
    (low, high) => new Date(high.date) - new Date(low.date)
  );

  const totals = filteredTransactions.reduce(
    (acc, tx) => {
      if (tx.category === "Расход") {
        acc.expense += tx.amount;
      }
      if (tx.category === "Доход") {
        acc.income += tx.amount;
      }

      return acc;
    },
    { income: 0, expense: 0 }
  );

  let total = totals.income - totals.expense;
  totalEl.textContent = total.toFixed(2);
  totalEl.classList.toggle("negative", total < 0);

  filteredTransactions.forEach((tx) => {
    const newList = document.createElement("li");
    newList.textContent = `${tx.date} - ${tx.description} - ${tx.amount} - (${tx.category})`;
    newList.classList.add(tx.category === "Доход" ? "income" : "expense");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Удалить";
    deleteButton.title = "Удалить";
    deleteButton.className = "delete-button";

    newList.appendChild(deleteButton);
    
    deleteButton.addEventListener("click", () => {
      transactions = transactions.filter((t) => t.id !== tx.id);
      saveToLocalStorage();
      render();
    });
    listEl.appendChild(newList);
  });

  totalEl.textContent = total.toFixed(2);
};

monthInput.addEventListener("change", () => render());

categoryFilter.addEventListener("change", () => render());

addBtn.addEventListener("click", () => {
  const newData = {
    id: Date.now(),
    description: nameInput.value.trim(),
    amount: +amountInput.value,
    date: dateInput.value,
    category: categoryInput.value,
  };

  if (!isDataCorrect()) return;

  transactions.push(newData);
  saveToLocalStorage();
  render();
  cleanInput();
});

window.addEventListener("DOMContentLoaded", () => {
  render();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;

  monthInput.value = `${year}-${month}`;
});
