import './style.css';
import categories from './categories.json';


/***************************************************/
/******************** TYPES ************************/
/***************************************************/

type TransactionType = 'income' | 'expense';

interface Transaction {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
}

let myData: Transaction[] = [];

/***************************************************/
/******************* SPARMÅL ************************/
/***************************************************/

const SAVINGS_GOAL_KEY = 'budgetSavingsGoal';
let savingsGoal: number = Number(localStorage.getItem(SAVINGS_GOAL_KEY)) || 10000;

/***************************************************/
/********* LÄGG TILL INK OCH UTG ENTER *************/
/***************************************************/

const incomeInput = document.querySelector<HTMLInputElement>('#income')!;
const expensesInput = document.querySelector<HTMLInputElement>('#expenses')!;
const savingsContainer = document.querySelector<HTMLDivElement>('#savingsGoalContainer');

incomeInput.addEventListener('keydown', checkInputConfirm);
expensesInput.addEventListener('keydown', checkInputConfirm);

function checkInputConfirm(e: KeyboardEvent): void {
  if (e.key !== 'Enter') return;
  

  myData.push({
    type: 'expense',
    category: 'Övrigt',
    description: expensesInput.value,
    amount: parseFloat(expensesInput.value),
  });

  expensesInput.value = '';

  saveDataToLocalStorage();
  renderData();
}

/***************************************************/
/*************** LÄGG TILL KNAPPARNA ***************/
/***************************************************/

const addIncomeBtn = document.querySelector<HTMLButtonElement>('#addIncomeBtn')!;
addIncomeBtn.addEventListener('click', addIncome);

const addExpensesBtn = document.querySelector<HTMLButtonElement>('#addExpensesBtn')!;
addExpensesBtn.addEventListener('click', addExpense);

function addIncome(): void {
  const typeSection = document.querySelector<HTMLSelectElement>('#incomeType')!;
  const incomeInput = document.querySelector<HTMLInputElement>('#income')!;
  const descriptionInput = document.querySelector<HTMLInputElement>('#incomeDescription')!;

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
  renderSavingsGoal();
}

function addExpense(): void {
  const expenseCategory = document.querySelector<HTMLSelectElement>('#expenseType')!;
  const expenseInput = document.querySelector<HTMLInputElement>('#expenses')!;
  const descriptionInput = document.querySelector<HTMLInputElement>('#description')!;

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
  renderSavingsGoal();
}

/***************************************************/
/*********** SUMMERA INKOMST OCH UTGIFT ************/
/***************************************************/
const balanceElement = document.querySelector<HTMLDivElement>('#balance')!;

function updateBalance(): void {
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

/***************************************************/
/**************** RÄKNA SPARANDE ********************/
/***************************************************/

function calculateSavings(): number {
  const totalIncome = myData
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpenses = myData
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  return totalIncome - totalExpenses;
}

/***************************************************/
/****************** LOCAL STORAGE ******************/
/***************************************************/

function saveDataToLocalStorage(): void {
  localStorage.setItem('budgetAppData', JSON.stringify(myData));
}

function loadDataFromLocalStorage(): void {
  const data = localStorage.getItem('budgetAppData');
  if (!data) return;

  try {
    myData = JSON.parse(data) as Transaction[];
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    myData = [];
  }
}

loadDataFromLocalStorage();

/***************************************************/
/******************** INNER HTML *******************/
/***************************************************/
const dataHtmlContainer = document.querySelector<HTMLDivElement>('#data')!;

function renderData(): void {
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

  dataHtmlContainer.innerHTML = html;
}

/***************************************************/
/**************** VISA SPARMÅL **********************/
/***************************************************/


function renderSavingsGoal(): void {
  if (!savingsContainer) return;
  const currentSavings = calculateSavings();
  const progress = Math.max(0, Math.min(100, (currentSavings / savingsGoal) * 100));

  let message = '';

  if (progress >= 100) {
    message = '🎉 Du har nått ditt sparmål!';
  } else if (progress >= 75) {
    message = '🔥 Nästan där!';
  } else if (progress >= 50) {
    message = '💪 Halvvägs!';
  } else {
    message = '🌱 Bra start!';
  }

  savingsContainer.innerHTML = `
    <div class="savings-box">
      <h3>Sparmål: ${savingsGoal.toLocaleString('sv-SE')} kr</h3>

      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%"></div>
      </div>

      <p>${currentSavings.toLocaleString('sv-SE')} kr sparat (${progress.toFixed(1)}%)</p>
      <p>${message}</p>

      <button id="changeGoalBtn">Ändra mål</button>
    </div>
  `;
}

/***************************************************/
/******************* DELETE ITEM *******************/
/***************************************************/
const dataHTMLContainer = document.querySelector<HTMLDivElement>('#data')!;
dataHTMLContainer.addEventListener('click', (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  if (target.classList.contains('delete-btn')) {
    const rowId = Number(target.dataset.id);

    myData.splice(rowId, 1);

    saveDataToLocalStorage();
    renderData();
    updateBalance();
    renderSavingsGoal();
  }
});

/***************************************************/
/********************* DROPDOWN ********************/
/***************************************************/

function initCategories(): void {

  const incomeSelect = document.querySelector<HTMLSelectElement>('#incomeType')!;
  const expenseSelect = document.querySelector<HTMLSelectElement>('#expenseType')!;

  incomeSelect.innerHTML = '<option value="" disabled selected>Välj kategori</option>';
  expenseSelect.innerHTML = '<option value="" disabled selected>Välj kategori</option>';

  categories.income.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.value;
    opt.textContent = cat.text;
    incomeSelect.appendChild(opt);
  });

  categories.expenses.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.value;
    opt.textContent = cat.text;
    expenseSelect.appendChild(opt);
  });
}

/***************************************************/
/**************** ÄNDRA SPARMÅL *********************/
/***************************************************/
if (savingsContainer) {
savingsContainer.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  if (target.id === 'changeGoalBtn') {
    const newGoal = prompt('Ange nytt sparmål (kr):');

    if (!newGoal) return;

    const parsed = Number(newGoal);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Ogiltigt belopp');
      return;
    }

    savingsGoal = parsed;
    localStorage.setItem(SAVINGS_GOAL_KEY, String(parsed));
    renderSavingsGoal();
  }
});
}
/***************************************************/
/******************** INIT APP *********************/
/***************************************************/


window.addEventListener('DOMContentLoaded', () => {
  initCategories();
  loadDataFromLocalStorage();
  renderData();
  updateBalance();
  renderSavingsGoal();
});


