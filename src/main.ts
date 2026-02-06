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
  const incomeInput = document.querySelector('#income');
  const descriptionInput = document.querySelector('#incomeDescription');

  const incomeValue = parseFloat(incomeInput.value);
  const descriptionValue = descriptionInput.value;

  if (isNaN(incomeValue) || descriptionValue.trim() === '') {
    alert('Vänligen ange ett giltigt belopp och en beskrivning.');
    return;
  }

  myData.push({
    type: 'income',
    amount: incomeValue,
    description: descriptionValue,
  });

  incomeInput.value = '';
  descriptionInput.value = '';

  saveDataToLocalStorage();
  renderData();
}

function addExpense() {
  const expenseInput = document.querySelector('#expenses');
  const descriptionInput = document.querySelector('#description');

  const expenseValue = parseFloat(expenseInput.value);
  const descriptionValue = descriptionInput.value;

  if (isNaN(expenseValue) || descriptionValue.trim() === '') {
    alert('Vänligen ange ett giltigt belopp och en beskrivning.');
    return;
  }

  myData.push({
    type: 'expense',
    amount: expenseValue,
    description: descriptionValue,
  });

  expenseInput.value = '';
  descriptionInput.value = '';

  saveDataToLocalStorage();
  renderData();
}

/***************************************************/
/**************** SUMMERA INKOMST ******************/
/***************************************************/




/***************************************************/
/***************** SUMMERA UTGIFT ******************/
/***************************************************/




/***************************************************/
/*********** SUMMERA INKOMST OCH UTGIFT ************/
/***************************************************/



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
  myData.forEach((item) => {
    html += `
      <div class="data-item">
        <span>${item.description}: ${item.amount} kr</span>
        <button class="delete-btn" data-id="${myData.indexOf(item)}">Ta bort</button>
      </div>
    `;
  });

  html += '';

  dataHtmlContainer.innerHTML = html;
}

document.querySelectorAll('.delete-btn').forEach((btn) => {
  btn.addEventListener('click', deleteItem);
});

function deleteItem(e) {
  const id = Number(e.target.dataset.id);

  myData.splice(id, 1);

  saveDataToLocalStorage();
  renderData();
  loadDataFromLocalStorage();
}

loadDataFromLocalStorage();
renderData();

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
