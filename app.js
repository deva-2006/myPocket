/* ---------------------------------------------------
   SHORTCUT: $ = document.getElementById()
--------------------------------------------------- */
const $ = id => document.getElementById(id);

/* ---------------------------------------------------
   APP STATE (income + expenses)
   Loaded from localStorage when page opens
--------------------------------------------------- */
let state = {
    income: Number(localStorage.getItem('sb_income') || 0),

    // If nothing exists → empty array
    expenses: JSON.parse(localStorage.getItem('sb_exp') || '[]') //here we convert json formatted string into js object  , but [] represents an array
};

/* ---------------------------------------------------
   Save state to browser storage
--------------------------------------------------- */
function saveState() {
    localStorage.setItem('sb_income', state.income); // key and value
    localStorage.setItem('sb_exp', JSON.stringify(state.expenses));  //json is saved as a string
}

/* ---------------------------------------------------
   Format ₹ amount nicely
--------------------------------------------------- */
function format(x) {
    return "₹" + Number(x || 0).toLocaleString();  //converts 1000 to ₹1,000
}

/* ---------------------------------------------------
   RENDER FUNCTION
   Updates UI based on "state"
--------------------------------------------------- */
function render() {

    // Show saved income in input box
   $('income').value = state.income > 0 ? state.income : "";



    // Calculate totals
    const totalExp = state.expenses.reduce((sum, e) => sum + e.amount, 0);
    const savings = Math.max(0, state.income - totalExp);

    // Update totals on UI
    $('showIncome').textContent = format(state.income);
    $('showExpenses').textContent = format(totalExp);
    $('showSavings').textContent = format(savings);

    /* ------------------------------------------
       RENDER EXPENSE LIST
    ------------------------------------------ */
    const list = $('list');
    list.innerHTML = ""; // clear old items

    state.expenses.slice().reverse().forEach(
 
            // e is an element fro;m state.expenses and idx is a index for iteration

        (e, idx) => {

        const div = document.createElement('div'); // <div> </div>
        div.className = "item"; // <div class="item"> </div>

        div.innerHTML = 
        //template literal
        `
            <div>
                <strong>${e.cat}</strong><br>
                <span class="muted">${new Date(e.t).toLocaleString()}</span>
            </div>

            <div style="text-align:right;">
                <strong>${format(e.amount)}</strong><br><br>
               
            </div>
        `;
  // creating button in js not in innerHTML
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.dataset.idx = state.expenses.length - 1 - idx; //logic for reverse indexing
         div.children[1].appendChild(deleteBtn); //adding the button to the second div
        deleteBtn.addEventListener("click", () => {
    removeExpense(deleteBtn);
   

});
        list.appendChild(div);
    }
);

    /* ------------------------------------------
       SCORE + MESSAGE
    ------------------------------------------ */
    const score = computeScore(state.income, totalExp, state.expenses);

    $('scoreVal').textContent = score;
    $('meterFill').style.width = score + "%";

    $('scoreMsg').textContent =
        score >= 75 ? "Great — keep going" :
        score >= 50 ? "Okay — try improving" :
        "Poor — fix spending";

    /* ------------------------------------------
       RECOMMENDATIONS
    ------------------------------------------ */
    const recos = generateRecs(state.income, totalExp, state.expenses);

    const ul = $('recoList');
    ul.innerHTML = "";

    recos.forEach(r => {
        const li = document.createElement('li');
        li.textContent = r;
        ul.appendChild(li);
    });
}

/* ---------------------------------------------------
   ADD EXPENSE
--------------------------------------------------- */
$('addExpense').addEventListener('click', () => {

    const amt = Number($('expenseAmt').value);
    const cat = $('expenseCat').value || "Miscellaneous ";

    if (!amt || amt <= 0) return alert("Enter valid amount");

    state.expenses.push({  // here we are saving the expense object
        amount: amt,
        cat: cat.trim(),
        t: Date.now()
    });

    saveState();
    render();

    // Clear input boxes
    $('expenseAmt').value = "";
    $('expenseCat').value = "";
});

/* ---------------------------------------------------
   PRESET BUTTONS (100, 500, 1K, etc.)
--------------------------------------------------- */
document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
        $('expenseAmt').value = btn.dataset.val;
    });
});

/* ---------------------------------------------------
   SAVE INCOME
--------------------------------------------------- */
$('saveIncome').addEventListener('click', () => {
    const inc = Number($('income').value);

    if (!inc || inc <= 0) return alert("Enter valid income");

    state.income = inc; // here we are saving the income
    saveState();
    render();
});

/* ---------------------------------------------------
   REMOVE EXPENSE
--------------------------------------------------- */
function removeExpense(btn) {
    const index = Number(btn.dataset.idx);
    state.expenses.splice(index, 1);

    saveState();
    render();
}

/* ---------------------------------------------------
   UNDO (remove last item)
--------------------------------------------------- */
$('undo').addEventListener('click', () => {
    state.expenses.pop();
    saveState();
    render();
});
 
/* ---------------------------------------------------
   CLEAR ALL
--------------------------------------------------- */
$('clearAll').addEventListener('click', () => {
    if (!confirm("Clear everything?")) return;

    state.income = 0;
    state.expenses = [];
    saveState();
    render();
});

/* ---------------------------------------------------
   SCORE CALCULATION
--------------------------------------------------- */
function computeScore(income, totalExp, expenses) {
    if (!income) return 0;

    const savings = Math.max(0, income - totalExp);
    const savingsRate = savings / income; // the percentage of savings

    
// Identify discretionary spending
const discretionaryCats = ["ott", "food", "shopping", "wifi", "entertainment"];

// Calculate total discretionary spending
const discretionaryTotal = expenses
  .filter(e => {
    // 1. Clean category (lowercase + remove non-letters)
    const c = (e.cat || "")
      .toLowerCase()
      .replace(/[^a-z]/g, ""); 

    // 2. Check if cleaned category contains any keyword
    return discretionaryCats.some(d => c.includes(d));
  })
  .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);


/* ---------------------------------------------------
   RECOMMENDATIONS
--------------------------------------------------- */
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

    return recs;
}

/* ---------------------------------------------------
   INITIAL RENDER (when page loads)
--------------------------------------------------- */
render();
