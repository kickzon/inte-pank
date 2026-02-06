// @ts-nocheck

import './style.css';
import categories from './categories.json';

let myData = [];
/***************************************************/
/********* LÄGG TILL INK OCH UTG ENTER *************/
/***************************************************/

const incomeInput = document.querySelector('#income');
const expensesInput = document.querySelector('#expenses');
incomeInput.addEventListener('keydown', checkInputConfirm);
expensesInput.addEventListener('keydown', checkInputConfirm);
const ENTER_KEY = 13;

function checkInputConfirm(e) {
  if (e.keyCode !== ENTER_KEY) {
    return;
  }

  myData.push({
    text: expensesInput.value,
    amount: parseFloat(expensesInput.value),
    type: 'expense',
  });

  expensesInput.value = '';

  saveDataToLocalStorage();
  renderData();
}


/***************************************************/
/*************** LÄGG TILL KNAPPARNA ***************/
/***************************************************/

const addIncomeBtn = document.querySelector('#addIncomeBtn');
addIncomeBtn.addEventListener('click', addIncome);

const addExpensesBtn = document.querySelector('#addExpensesBtn');
addExpensesBtn.addEventListener('click', addExpense);

function addIncome() {
  const typeSection = document.querySelector('#incomeType');
  const incomeInput = document.querySelector('#income');
  const descriptionInput = document.querySelector('#incomeDescription');

  const category = typeSection.selectedOptions[0].text;
  const incomeValue = parseFloat(incomeInput.value);
  const descriptionValue = descriptionInput.value;

  if (isNaN(incomeValue) || descriptionValue.trim() === '' || category === '') {
    alert('Vänligen fyll i kategori, belopp och beskrivning.');
    return;
  }

  myData.push({
    type: 'income',
    category: category,
    amount: incomeValue,
    description: descriptionValue,
  });

  typeSection.value = '';
  incomeInput.value = '';
  descriptionInput.value = '';

  saveDataToLocalStorage();
  renderData();
  updateBalance();
}

function addExpense() {
  const expenseCategory = document.querySelector('#expenseType');
  const expenseInput = document.querySelector('#expenses');
  const descriptionInput = document.querySelector('#description');

  const expenseCategoryValue = expenseCategory.selectedOptions[0].text;
  const expenseValue = parseFloat(expenseInput.value);
  const descriptionValue = descriptionInput.value;

  if (isNaN(expenseValue) || descriptionValue.trim() === '' || expenseCategoryValue === '') {
    alert('Vänligen fyll i kategori, belopp och beskrivning.');
    return;
  }

  myData.push({
    type: 'expense',
    category: expenseCategoryValue,
    amount: expenseValue,
    description: descriptionValue,
  });

  expenseCategory.value = '';
  expenseInput.value = '';
  descriptionInput.value = '';

  saveDataToLocalStorage();
  renderData();
  updateBalance();
}

/***************************************************/
/*********** SUMMERA INKOMST OCH UTGIFT ************/
/***************************************************/
const balanceElement = document.querySelector('#balance');

function updateBalance() {
  const totalIncome = myData
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = myData
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpenses;
  balanceElement.textContent = `Totalt: ${balance.toLocaleString('sv-SE')} kr`;

  balanceElement.classList.remove('positive', 'negative', 'zero');
  if (balance > 0) {
    balanceElement.classList.add('positive');
  } else if (balance < 0) {
    balanceElement.classList.add('negative');
  } else {
    balanceElement.classList.add('zero');
  }
}

updateBalance();



/***************************************************/
/****************** LOCAL STORAGE ******************/
/***************************************************/

function saveDataToLocalStorage() {
  localStorage.setItem('budgetAppData', JSON.stringify(myData));
}

function loadDataFromLocalStorage() {
  const data = localStorage.getItem('budgetAppData');
  if (data) {
    myData = JSON.parse(data);
  }
}

function deleteDataFromLocalStorage() {
  localStorage.removeItem('budgetAppData');

  myData = [];
  renderData();
}

loadDataFromLocalStorage();

/***************************************************/
/******************** INNER HTML *******************/
/***************************************************/
const dataHtmlContainer = document.querySelector('#data');

function renderData() {
  let html = '';

  myData.forEach((item, index) => {
    const itemClass =
    item.type === 'income' ? 'data-item income-item' : 'data-item expense-item';

    const sign = item.type === 'income' ? '+' : '-';

    html += `
      <div class="${itemClass}">
        <span> <strong>${item.category} - </strong> ${item.description}: ${sign} ${item.amount.toLocaleString('sv-SE')} kr</span>
        <button class="delete-btn" data-id="${index}">Ta bort</button>
      </div>
    `;
  });

  html += '';

  dataHtmlContainer.innerHTML = html;
}

/***************************************************/
/******************* DELETE ITEM *******************/
/***************************************************/
const dataHTMLContainer = document.querySelector('#data');
dataHTMLContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const rowId = Number(e.target.dataset.id);

    myData.splice(rowId, 1);

    saveDataToLocalStorage();
    renderData();
    updateBalance();
  }
});

loadDataFromLocalStorage();
renderData();
updateBalance();

/***************************************************/
/********************* DROPDOWN ********************/
/***************************************************/

const incomecategories = document.querySelector('#incomeType');
if (incomecategories) {
  categories.income.forEach((category) => {
    incomecategories.innerHTML += `<option value="${category.value}">${category.text}</option>`;
  });
}

const expenseCategories = document.querySelector('#expenseType');
if (expenseCategories) {
  categories.expenses.forEach((category) => {
    expenseCategories.innerHTML += `<option value="${category.value}">${category.text}</option>`;
  });
}
