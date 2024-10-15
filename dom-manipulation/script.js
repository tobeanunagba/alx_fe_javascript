const quotes = loadQuotes();

function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    if (storedQuotes) {
        return JSON.parse(storedQuotes);
    }
    return [];
}

function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = new Set(quotes.map(quote => quote.category));

    categoryFilter.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    storeLastViewedQuoteIndex(randomIndex);
    const quote = quotes[randomIndex];
    const quoteDisplay = document.getElementById("quoteDisplay");
    quoteDisplay.innerHTML = `<p>${quote.text}</p><small>Category: ${quote.category}</small>`;
}

function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value;
    const newQuoteCategory = document.getElementById("newQuoteCategory").value;

    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        populateCategories();
        alert("New quote added successfully!");
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
        
        filterQuotes(); // Refresh displayed quotes
    } else {
        alert("Please fill in both the quote and category.");
    }
}

function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const quoteDisplay = document.getElementById("quoteDisplay");

    quoteDisplay.innerHTML = "";

    const filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    filteredQuotes.forEach(quote => {
        quoteDisplay.innerHTML += `<p>${quote.text}</p><small>Category: ${quote.category}</small>`;
    });

    localStorage.setItem("selectedCategory", selectedCategory);
}

function restoreLastSelectedFilter() {
    const lastCategory = localStorage.getItem("selectedCategory");
    if (lastCategory) {
        document.getElementById("categoryFilter").value = lastCategory;
        filterQuotes(); // Show last selected category's quotes
    }
}

// Event listeners
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportQuotes").addEventListener("click", exportQuotes);
createAddQuoteForm();
populateCategories(); // Call this on initialization
restoreLastSelectedFilter(); // Restore last selected filter
