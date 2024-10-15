let quotes = [];
const mockServerUrl = "https://jsonplaceholder.typicode.com/posts"; // Replace this with the actual mock server URL if needed

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Fetch quotes from the mock server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(mockServerUrl);
        const serverQuotes = await response.json();

        // Resolve conflicts: Server data takes precedence
        if (serverQuotes && Array.isArray(serverQuotes)) {
            mergeQuotesWithServer(serverQuotes);
        }
    } catch (error) {
        console.error("Failed to fetch data from the server:", error);
    }
}

// Merge local quotes with server quotes
function mergeQuotesWithServer(serverQuotes) {
    let conflicts = false;

    serverQuotes.forEach(serverQuote => {
        // If quote does not exist locally, add it
        if (!quotes.find(q => q.text === serverQuote.title)) {
            quotes.push({
                text: serverQuote.title,
                category: "Server Imported" // Default category
            });
            conflicts = true;
        }
    });

    if (conflicts) {
        alert("New quotes were added from the server.");
        saveQuotes();
        populateCategories();
    }
}

// Periodically sync with the server every 30 seconds
function startPeriodicSync() {
    setInterval(fetchQuotesFromServer, 30000);
}

// Sync changes to the server
async function syncChangesToServer() {
    try {
        // For simplicity, post the entire quotes array to the server
        await fetch(mockServerUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quotes)
        });
        alert("Quotes synced with the server successfully.");
    } catch (error) {
        console.error("Failed to sync data with the server:", error);
    }
}

// Add a new quote locally and sync with the server
function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (quoteText === "" || quoteCategory === "") {
        alert("Please enter both the quote text and category.");
        return;
    }

    quotes.push({ text: quoteText, category: quoteCategory });
    saveQuotes();

    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    populateCategories(); // Update categories after adding a new quote
    syncChangesToServer(); // Sync changes to the server
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    loadQuotes();
    populateCategories();

    document.getElementById("newQuote").addEventListener("click", filterQuotes);
    document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
    
    startPeriodicSync(); // Start periodic syncing with the server
});
