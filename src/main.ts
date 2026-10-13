import './style.css';
import categories from './categories.json';
import type { Transaction, TransactionType } from './models';

const DATA_KEY = 'budgetAppData',
  GOAL_KEY = 'budgetSavingsGoal',
  GOAL_NAME_KEY = 'budgetSavingsGoalName';
const money = new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 });
const transactions: Transaction[] = loadTransactions();
let currentType: TransactionType = 'expense';
let savingsGoal = Number(localStorage.getItem(GOAL_KEY)) || 10000;
let goalName = localStorage.getItem(GOAL_NAME_KEY) || 'Din buffert';

function el<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`#${id} saknas`);
  return node as T;
}
const form = el<HTMLFormElement>('transactionForm'),
  category = el<HTMLSelectElement>('category'),
  amount = el<HTMLInputElement>('amount'),
  description = el<HTMLInputElement>('description'),
  data = el<HTMLDivElement>('data'),
  goal = el<HTMLElement>('savingsGoalContainer'),
  dialog = el<HTMLDialogElement>('goalDialog');

function loadTransactions(): Transaction[] {
  try {
    const stored = JSON.parse(localStorage.getItem(DATA_KEY) || '[]') as Partial<Transaction>[];
    if (!Array.isArray(stored)) return [];
    return stored
      .filter(i => i.type && i.category && Number(i.amount) > 0)
      .map((i, n) => ({
        id: i.id || `${Date.now()}-${n}`,
        type: i.type as TransactionType,
        category: String(i.category),
        amount: Number(i.amount),
        description: String(i.description || 'Utan beskrivning'),
        createdAt: i.createdAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
}
function save(): void {
  localStorage.setItem(DATA_KEY, JSON.stringify(transactions));
}
function totals() {
  const income = transactions.filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0);
  const expenses = transactions.filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0);
  return { income, expenses, balance: income - expenses };
}
function safe(value: string): string {
  const node = document.createElement('div');
  node.textContent = value;
  return node.innerHTML;
}

function renderSummary(): void {
  const { income, expenses, balance } = totals();
  const balanceNode = el('balance');
  balanceNode.textContent = money.format(balance);
  balanceNode.classList.toggle('negative', balance < 0);
  el('totalIncome').textContent = money.format(income);
  el('totalExpenses').textContent = money.format(expenses);
  el('savingsRate').textContent = `${income ? Math.round((balance / income) * 100) : 0} %`;
  el('balanceMessage').textContent = !transactions.length
    ? 'Lägg till din första transaktion för att börja.'
    : balance >= 0
      ? 'Du håller dig på rätt sida nollan. Snyggt!'
      : 'Utgifterna är större än inkomsterna just nu.';
}
function renderTransactions(): void {
  el<HTMLButtonElement>('clearAllBtn').hidden = !transactions.length;
  if (!transactions.length) {
    data.innerHTML =
      '<div class="empty-state"><span>↙</span><h3>Här var det tomt</h3><p>Lägg till en inkomst eller utgift så dyker den upp här.</p></div>';
    return;
  }
  data.innerHTML = [...transactions]
    .reverse()
    .map(
      i =>
        `<article class="transaction-item"><span class="transaction-icon ${i.type}">${safe(i.category[0])}</span><div><strong>${safe(i.description)}</strong><small>${safe(i.category)}</small></div><em class="${i.type}">${i.type === 'income' ? '+' : '−'}${money.format(i.amount)}</em><button class="delete-button" data-id="${i.id}" aria-label="Ta bort ${safe(i.description)}">×</button></article>`
    )
    .join('');
}
function renderGoal(): void {
  const saved = Math.max(0, totals().balance),
    progress = Math.min(100, (saved / savingsGoal) * 100),
    remaining = Math.max(0, savingsGoal - saved);
  goal.innerHTML = `<div><p class="eyebrow">NÄSTA STOPP</p><h2>${safe(goalName)}</h2><p>${remaining ? `${money.format(remaining)} kvar till målet.` : 'Målet är nått – otroligt jobbat!'}</p><button id="changeGoalBtn" class="secondary-button">Justera mål</button></div><div class="goal-visual"><div class="goal-numbers"><strong>${money.format(saved)}</strong><span>av ${money.format(savingsGoal)}</span></div><div class="goal-track" role="progressbar" aria-valuenow="${Math.round(progress)}"><span style="width:${progress}%"></span></div><b>${Math.round(progress)}%</b></div>`;
}
function render(): void {
  renderSummary();
  renderTransactions();
  renderGoal();
}
function populate(): void {
  const list = currentType === 'income' ? categories.income : categories.expenses;
  category.innerHTML =
    '<option value="">Välj kategori</option>' + list.map(i => `<option value="${i.value}">${i.text}</option>`).join('');
}
function setType(type: TransactionType): void {
  currentType = type;
  document.querySelectorAll<HTMLButtonElement>('.type-tab').forEach(b => {
    const active = b.dataset.type === type;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', String(active));
  });
  populate();
}

document
  .querySelectorAll<HTMLButtonElement>('.type-tab')
  .forEach(b => b.addEventListener('click', () => setType(b.dataset.type as TransactionType)));
form.addEventListener('submit', event => {
  event.preventDefault();
  const value = Number(amount.value),
    text = description.value.trim(),
    option = category.selectedOptions[0];
  if (!option?.value || !text || !Number.isFinite(value) || value <= 0) {
    el('formError').textContent = 'Fyll i kategori, ett positivt belopp och en beskrivning.';
    return;
  }
  transactions.push({
    id: crypto.randomUUID(),
    type: currentType,
    category: option.text,
    amount: value,
    description: text,
    createdAt: new Date().toISOString(),
  });
  save();
  form.reset();
  el('formError').textContent = '';
  setType(currentType);
  render();
  category.focus();
});
data.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.delete-button');
  if (!button) return;
  const index = transactions.findIndex(i => i.id === button.dataset.id);
  if (index >= 0) transactions.splice(index, 1);
  save();
  render();
});
el('clearAllBtn').addEventListener('click', () => {
  if (confirm('Vill du ta bort alla transaktioner?')) {
    transactions.length = 0;
    save();
    render();
  }
});
goal.addEventListener('click', event => {
  if ((event.target as HTMLElement).id !== 'changeGoalBtn') return;
  el<HTMLInputElement>('goalName').value = goalName;
  el<HTMLInputElement>('goalAmount').value = String(savingsGoal);
  dialog.showModal();
});
el<HTMLFormElement>('goalForm').addEventListener('submit', event => {
  const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
  if (submitter?.value === 'cancel') return;
  event.preventDefault();
  const value = Number(el<HTMLInputElement>('goalAmount').value);
  if (value <= 0) return;
  savingsGoal = value;
  goalName = el<HTMLInputElement>('goalName').value.trim() || 'Din buffert';
  localStorage.setItem(GOAL_KEY, String(value));
  localStorage.setItem(GOAL_NAME_KEY, goalName);
  dialog.close();
  renderGoal();
});
populate();
render();
