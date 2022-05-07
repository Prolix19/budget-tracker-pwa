// Create variable to hold the database connection
let db;

// Establish a connection to IndexedDB
const request = indexedDB.open('budget', 1);

// Event to emit if version changes
request.onupgradeneeded = function(event) {
    const db = event.target.result; // Save reference to database
    db.createObjectStore('newBudget', { autoIncrement: true }); // Create object store called 'newBudget'
};

request.onsuccess = function(event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

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
                alert("All budget transactions have been submitted successfully!");
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
};

window.addEventListener('online', uploadTransactions);