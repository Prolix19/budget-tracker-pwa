// Create variable to hold the database connection
let db;

// Establish a connection to IndexedDB
const request = indexedDB.open('budget', 1);

// Event to emit if version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result; // Save reference to database
    db.createObjectStore('newBudget', { autoIncrement: true }); // Create object store called 'newBudget'
};

// Mass upload transactions to server when online
request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    }
};

// Error handling
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// saveRecord function is called by index.js to add a transaction to the database
function saveRecord(entry) {
    const transaction = db.transaction(['newBudget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('newBudget');
    budgetObjectStore.add(entry);
};

function uploadTransactions() {
    const transaction = db.transaction(['newBudget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('newBudget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['newBudget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('newBudget');
                budgetObjectStore.clear();
                alert("All deposits and expenses entered while offline have been added successfully");
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadTransactions);