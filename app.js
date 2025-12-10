
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
  document.body.classList.toggle('dark', theme === 'dark');

  const btn = $('themeToggle');
  if (!btn) return;

  const isDark = theme === 'dark';
  btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  btn.textContent = isDark ? '☀️' : '🌙';
}


(function initTheme() {
  const savedTheme = localStorage.getItem('sb_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  $('themeToggle')?.addEventListener('click', () => {
    const nowDark = document.body.classList.toggle('dark');
    localStorage.setItem('sb_theme', nowDark ? 'dark' : 'light');
    applyTheme(nowDark ? 'dark' : 'light');
  });
})();


function render() {
  const range = $('incomeRange');
  if (range) {
    range.value = state.income;
    $('incomePreview').textContent = format(state.income);
  }

  const totalExp = state.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
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
    left.innerHTML = `<strong>${e.cat || 'Miscellaneous'}</strong><br>
                      <div class="muted small">${new Date(e.t).toLocaleString()}</div>`;


    const right = document.createElement('div');
    right.style.textAlign = 'right';

    const amt = document.createElement('strong');
    amt.textContent = format(e.amount);

    const actions = document.createElement('div');
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'btn btn-danger';
    del.textContent = 'Delete';
    del.dataset.idx = origIdx;

    del.addEventListener('click', () => removeExpense(del));
    actions.appendChild(del);

    right.appendChild(amt);
    right.appendChild(document.createElement('br'));
    right.appendChild(actions);

    item.append(left, right);
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
  ul.innerHTML = "";
  recos.forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    ul.appendChild(li);
  });

  try { renderFIRE(); } catch {}
}


$('addExpense')?.addEventListener('click', () => {
  const amt = Number($('expenseAmt').value);
  const cat = ($('expenseCat').value || "Miscellaneous").trim();

  if (!amt || amt <= 0) return alert("Enter valid amount");

  state.expenses.push({ amount: amt, cat, t: Date.now() });
  saveState();
  render();

  $('expenseAmt').value = "";
  $('expenseCat').value = "";
});

document.querySelectorAll('.preset').forEach(btn => {
  btn.addEventListener('click', () => $('expenseAmt').value = btn.dataset.val);
});

$('incomeRange')?.addEventListener('input', () => {
  $('incomePreview').textContent = format(Number(incomeRange.value || 0));
});

$('saveIncome')?.addEventListener('click', () => {
  const v = Number($('incomeRange').value);
  if (!v || v <= 0) return alert("Enter valid income");

  state.income = v;
  saveState();
  render();
});

function removeExpense(btn) {
  const i = Number(btn.dataset.idx);
  if (Number.isFinite(i)) {
    state.expenses.splice(i, 1);
    saveState();
    render();
  }
}

$('undo')?.addEventListener('click', () => {
  state.expenses.pop();
  saveState();
  render();
});

$('clearAll')?.addEventListener('click', () => {
  if (!confirm("Clear everything?")) return;
  state.income = 0;
  state.expenses = [];
  saveState();
  render();
});

function computeScore(income, totalExp, expenses) {
  if (!income) return 0;

  const savings = Math.max(0, income - totalExp);
  const savingsRate = savings / income;

  const badCats = ["ott", "food", "shopping", "wifi", "entertainment"];
  const discretionaryTotal = expenses
    .filter(e => badCats.some(d => (e.cat || "").toLowerCase().includes(d)))
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const discretionaryRate = discretionaryTotal / Math.max(1, income);

  const savingsScore = Math.min(40, Math.round(savingsRate * 40));
  const discPenalty = Math.min(40, Math.round(discretionaryRate * 40));

  return Math.max(0, Math.min(100, 50 + savingsScore - discPenalty));
}

function generateRecs(income, totalExp, expenses) {
  const recs = [];
  if (!income) return ["Enter your income to get recommendations."];

  const savings = Math.max(0, income - totalExp);
  const rate = savings / income;

  if (rate < 0.1) recs.push("Try to save at least 10% of your income.");
  else if (rate < 0.2) recs.push("Aim for 20% savings to improve score.");
  else recs.push("Good savings! Consider long-term investments.");

  const byCat = expenses.reduce((m, e) => {
    const c = (e.cat || "Misc").trim();
    m[c] = (m[c] || 0) + Number(e.amount || 0);
    return m;
  }, {});

  const topCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  if (topCat && topCat[1] > 0) {
    recs.push(`Consider cutting down on ${topCat[0]} (₹${topCat[1].toLocaleString()})`);
  }

  return recs;
}


render();


(function initFIRE() {
  const defaults = {
    monthlyExpenses: 16000,
    currentAge: 28,
    retirementAge: 42,
    lifeExpectancy: 89,
    inflation: 6.0
  };

  let fireState = JSON.parse(localStorage.getItem('sb_fire') || '{}');
  window.fireState = { ...defaults, ...fireState };

  setupDualInputs();
  syncUIFromState();
  renderFIRE();

  $('mp-reset-fire')?.addEventListener('click', () => {
    if (!confirm('Reset FIRE inputs to defaults?')) return;
    Object.assign(window.fireState, defaults);
    persistFIRE();
    syncUIFromState();
    renderFIRE();
  });
})();


function persistFIRE() {
  localStorage.setItem('sb_fire', JSON.stringify(window.fireState || {}));
}


function syncUIFromState() {
  document.querySelectorAll('.mp-dual-row').forEach(row => {
    const key = row.dataset.key;
    const range = row.querySelector('.mp-range');
    const pill = row.querySelector('.mp-pill');
    if (!key || !range || !pill) return;

    const v = Number(window.fireState[key]);
    range.value = v;
    pill.textContent = displayPillValue(key, v);
  });
}


function displayPillValue(key, v) {
  if (key === 'inflation') return v.toFixed(1) + "%";
  if (["currentAge", "retirementAge", "lifeExpectancy"].includes(key)) return String(Math.round(v));
  return format(Math.round(v));
}


function setupDualInputs() {
  document.querySelectorAll('.mp-dual-row').forEach(row => {
    const key = row.dataset.key;
    const range = row.querySelector('.mp-range');
    const pill = row.querySelector('.mp-pill');
    if (!key || !range || !pill) return;

    const min = Number(range.min);
    const max = Number(range.max);
    const step = Number(range.step);


    range.addEventListener('input', () => {
      const v = Number(range.value);
      window.fireState[key] = v;
      pill.textContent = displayPillValue(key, v);
      persistFIRE();
      renderFIRE();
    });


    pill.addEventListener('click', () => {
      if (pill.classList.contains('input-mode')) return;

      pill.classList.add('input-mode');
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'mp-pill-input';
      input.min = min;
      input.max = max;
      input.step = step;
      input.value = window.fireState[key];

      pill.textContent = "";
      pill.appendChild(input);
      input.focus();
      input.select();


      function commit() {
        let v = Number(input.value || 0);
        v = Math.min(max, Math.max(min, v));
        if (key !== 'inflation') v = Math.round(v);

        window.fireState[key] = v;
        persistFIRE();
        range.value = v;
        pill.classList.remove('input-mode');
        pill.textContent = displayPillValue(key, v);
        renderFIRE();
      }

      input.addEventListener('blur', commit);
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') input.blur();
        if (e.key === 'Escape') {
          pill.classList.remove('input-mode');
          pill.textContent = displayPillValue(key, Number(range.value));
        }
      });
    });
  });
}


function renderFIRE() {
  const s = window.fireState;
  const monthly = Number(s.monthlyExpenses);
  const currentAge = Number(s.currentAge);
  const retireAge = Number(s.retirementAge);
  const inflation = Number(s.inflation) / 100;

  const yearsToRetire = Math.max(0, retireAge - currentAge);
  const annual = monthly * 12;
  const futureExpenses = annual * Math.pow(1 + inflation, yearsToRetire);

  const lean = futureExpenses * 25;
  const fat = futureExpenses * 30;
  const main = Math.max(lean, fat);

  const ex = id => $(id);

  ex('mp-fire-number').textContent = format(main);
  ex('mp-current-age').textContent = `Age: ${currentAge}`;
  ex('mp-years-to-retire').textContent = `Years to go: ${yearsToRetire}`;
  ex('mp-retire-age').textContent = `Retirement Age: ${retireAge}`;

  ex('mp-annual-expenses').textContent = format(annual);
  ex('mp-exp-at-retire').textContent = format(futureExpenses);
  ex('mp-lean-fire').textContent = format(lean);
  ex('mp-fat-fire').textContent = format(fat);
}
