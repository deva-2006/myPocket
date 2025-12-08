const $ = id => document.getElementById(id);

let state = {
  income: Number(localStorage.getItem('sb_income') || 0),
  expenses: JSON.parse(localStorage.getItem('sb_exp') || '[]')
};

function saveState() {
  localStorage.setItem('sb_income', state.income);
  localStorage.setItem('sb_exp', JSON.stringify(state.expenses));
}

function format(x) {
  return "₹" + Number(x || 0).toLocaleString();
}

function applyTheme(theme) {
  if (theme === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');

  const btn = $('themeToggle');
  if (btn) {
    const pressed = theme === 'dark';
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    btn.textContent = pressed ? '☀️' : '🌙';
  }
}

(function initTheme() {
  const savedTheme = localStorage.getItem('sb_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  const themeToggle = $('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isNowDark = document.body.classList.toggle('dark');
      localStorage.setItem('sb_theme', isNowDark ? 'dark' : 'light');
      themeToggle.setAttribute('aria-pressed', isNowDark ? 'true' : 'false');
      themeToggle.textContent = isNowDark ? '☀️' : '🌙';
    });
  }
})();

function render() {
  const range = $('incomeRange');
  if (range) {
    range.value = state.income || 0;
    const preview = $('incomePreview');
    if (preview) preview.textContent = format(state.income);
  }

  const totalExp = state.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const savings = Math.max(0, state.income - totalExp);

  $('showIncome').textContent = format(state.income);
  $('showExpenses').textContent = format(totalExp);
  $('showSavings').textContent = format(savings);

  const list = $('list');
  if (!list) return;

  list.innerHTML = "";

  state.expenses.slice().reverse().forEach((e, idx) => {
    const origIdx = state.expenses.length - 1 - idx;

    const item = document.createElement('div');
    item.className = 'item';

    const left = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = e.cat || 'Miscellaneous';
    const time = document.createElement('div');
    time.className = 'muted small';
    time.textContent = new Date(e.t).toLocaleString();

    left.appendChild(title);
    left.appendChild(document.createElement('br'));
    left.appendChild(time);

    const right = document.createElement('div');
    right.style.textAlign = 'right';

    const amt = document.createElement('strong');
    amt.textContent = format(e.amount);

    const actions = document.createElement('div');

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.dataset.idx = origIdx;

    deleteBtn.addEventListener('click', () => {
      removeExpense(deleteBtn);
    });

    actions.appendChild(deleteBtn);

    right.appendChild(amt);
    right.appendChild(document.createElement('br'));
    right.appendChild(actions);

    item.appendChild(left);
    item.appendChild(right);

    list.appendChild(item);
  });

  const score = computeScore(state.income, totalExp, state.expenses);
  $('scoreVal').textContent = score;
  $('meterFill').style.width = score + "%";

  $('scoreMsg').textContent =
    score >= 75 ? "Great — keep going" :
    score >= 50 ? "Okay — try improving" :
    "Poor — fix spending";

  const recos = generateRecs(state.income, totalExp, state.expenses);
  const ul = $('recoList');
  if (ul) {
    ul.innerHTML = "";
    recos.forEach(r => {
      const li = document.createElement('li');
      li.textContent = r;
      ul.appendChild(li);
    });
  }
}

const addExpenseBtn = $('addExpense');
if (addExpenseBtn) {
  addExpenseBtn.addEventListener('click', () => {
    const amt = Number($('expenseAmt').value);
    const cat = ($('expenseCat').value || "Miscellaneous").trim();

    if (!amt || amt <= 0) return alert("Enter valid amount");

    state.expenses.push({ amount: amt, cat, t: Date.now() });
    saveState();
    render();

    $('expenseAmt').value = "";
    $('expenseCat').value = "";
  });
}

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => {
    $('expenseAmt').value = btn.dataset.val;
  });
});

const incomeRangeEl = $('incomeRange');
if (incomeRangeEl) {
  incomeRangeEl.addEventListener('input', () => {
    const v = Number(incomeRangeEl.value || 0);
    const preview = $('incomePreview');
    if (preview) preview.textContent = format(v);
  });
}

const saveIncomeBtn = $('saveIncome');
if (saveIncomeBtn) {
  saveIncomeBtn.addEventListener('click', () => {
    const rangeEl = $('incomeRange');
    const inc = rangeEl ? Number(rangeEl.value) : Number($('income')?.value);

    if (!inc || inc <= 0) return alert("Enter valid income");

    state.income = inc;
    saveState();
    render();
  });
}

function removeExpense(btn) {
  const index = Number(btn.dataset.idx);
  if (!Number.isFinite(index)) return;
  state.expenses.splice(index, 1);
  saveState();
  render();
}

const undoBtn = $('undo');
if (undoBtn) {
  undoBtn.addEventListener('click', () => {
    state.expenses.pop();
    saveState();
    render();
  });
}

const clearAllBtn = $('clearAll');
if (clearAllBtn) {
  clearAllBtn.addEventListener('click', () => {
    if (!confirm("Clear everything?")) return;
    state.income = 0;
    state.expenses = [];
    saveState();
    render();
  });
}

function computeScore(income, totalExp, expenses) {
  if (!income) return 0;

  const savings = Math.max(0, income - totalExp);
  const savingsRate = savings / income;

  const discretionaryCats = ["ott", "food", "shopping", "wifi", "entertainment"];
  const discretionaryTotal = expenses
    .filter(e => {
      const c = (e.cat || "").toLowerCase().replace(/[^a-z]/g, "");
      return discretionaryCats.some(d => c.includes(d));
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const discretionaryRate = discretionaryTotal / Math.max(1, income);

  const savingsScore = Math.min(40, Math.round(savingsRate * 40));
  const discPenalty = Math.min(40, Math.round(discretionaryRate * 40));
  let score = 50 + savingsScore - discPenalty;

  return Math.max(0, Math.min(100, score));
}

function generateRecs(income, totalExp, expenses) {
  const recs = [];
  if (!income) {
    recs.push("Enter your income to get recommendations.");
    return recs;
  }

  const savings = Math.max(0, income - totalExp);
  const rate = savings / income;
  if (rate < 0.1) recs.push("Try to save at least 10% of your income.");
  else if (rate < 0.2) recs.push("Aim for 20% savings to improve score.");
  else recs.push("Good savings! Consider long-term investments.");

  const byCat = expenses.reduce((m, e) => {
    const cat = (e.cat || "Misc").trim();
    m[cat] = (m[cat] || 0) + Number(e.amount || 0);
    return m;
  }, {});
  const topCat = Object.entries(byCat).sort((a,b) => b[1] - a[1])[0];
  if (topCat && topCat[1] > 0) {
    recs.push(`Consider cutting down on ${topCat[0]} (₹${topCat[1].toLocaleString()})`);
  }

  return recs;
}

render();
