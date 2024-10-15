let quotes = [];
const mockServerUrl = "https://jsonplaceholder.typicode.com/posts"; // Mock server URL

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
        filterQuotes(); // Update the displayed quotes
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
    filterQuotes(); // Update the displayed quotes
    syncChangesToServer(); // Sync changes to the server
}

// Populate categories dynamically in the dropdown
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset categories

    // Get unique categories from the quotes
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];
    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = ""; // Clear previous quotes

    const filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    // Display the filtered quotes
    filteredQuotes.forEach(quote => {
        const quoteItem = document.createElement("div");
        quoteItem.textContent = `"${quote.text}" - (${quote.category})`;
        quoteDisplay.appendChild(quoteItem);
    });

    // Save the last selected filter to local storage
    localStorage.setItem("lastSelectedCategory", selectedCategory);
}

// Load the last selected filter from local storage
function loadLastSelectedFilter() {
    const lastSelectedCategory = localStorage.getItem("lastSelectedCategory");
    if (lastSelectedCategory) {
        document.getElementById("categoryFilter").value = lastSelectedCategory;
        filterQuotes();
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
    loadQuotes();
    populateCategories();
    loadLastSelectedFilter();

    document.getElementById("newQuote").addEventListener("click", filterQuotes);
    document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
    document.getElementById("categoryFilter").addEventListener("change", filterQuotes);

    startPeriodicSync(); // Start periodic syncing with the server
});
