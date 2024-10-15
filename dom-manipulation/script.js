const quotes = loadQuotes();

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    return storedQuotes ? JSON.parse(storedQuotes) : [];
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Function to fetch quotes from a mock server
function fetchQuotesFromServer() {
    fetch("https://jsonplaceholder.typicode.com/posts")
        .then(response => response.json())
        .then(data => {
            const serverQuotes = data.map(item => ({
                text: item.title,
                category: "General" // You can set a default category or derive it from the data
            }));
            syncQuotes(serverQuotes);
        })
        .catch(error => console.error("Error fetching quotes from server:", error));
}

// Sync local quotes with server quotes
function syncQuotes(serverQuotes) {
    const existingQuotes = loadQuotes();

    serverQuotes.forEach(serverQuote => {
        const index = existingQuotes.findIndex(quote => quote.text === serverQuote.text);

        if (index === -1) {
            // If the quote doesn't exist locally, add it
            existingQuotes.push(serverQuote);
        } else {
            // If the quote exists, resolve conflicts by using the server version
            console.log(`Conflict detected for quote: "${serverQuote.text}". Using server version.`);
            existingQuotes[index] = serverQuote;
            notifyUser("Quotes have been updated from the server.");
        }
    });

    saveQuotes(existingQuotes);
    populateCategories(); // Update categories after syncing
    filterQuotes(); // Refresh displayed quotes
}

// Notify users about updates or conflicts
function notifyUser(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.background = "lightblue";
    notification.style.padding = "10px";
    document.body.appendChild(notification);

    // Automatically remove notification after 5 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}

// Display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById("quoteDisplay");
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteDisplay.innerHTML = `<p>${quotes[randomIndex].text}</p><p><em>Category: ${quotes[randomIndex].category}</em></p>`;
}

// Add new quote through a form
function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value;
    const quoteCategory = document.getElementById("newQuoteCategory").value;

    if (quoteText && quoteCategory) {
        quotes.push({ text: quoteText, category: quoteCategory });
        saveQuotes();
        showRandomQuote(); // Show the newly added quote
        populateCategories(); // Update the category filter
        document.getElementById("newQuoteText").value = ""; // Clear input field
        document.getElementById("newQuoteCategory").value = ""; // Clear input field
    } else {
        alert("Please enter both a quote and a category.");
    }
}

// Populate category filter dynamically
function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const uniqueCategories = Array.from(new Set(quotes.map(quote => quote.category)));

    categoryFilter.innerHTML = '<option value="all">All Categories</option>'; // Reset filter
    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    // Restore last selected filter from local storage
    const lastSelectedFilter = localStorage.getItem("lastCategoryFilter");
    if (lastSelectedFilter) {
        categoryFilter.value = lastSelectedFilter;
        filterQuotes(); // Show quotes based on the last selected filter
    }
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    const quoteDisplay = document.getElementById("quoteDisplay");
    
    // Save the last selected filter in local storage
    localStorage.setItem("lastCategoryFilter", selectedCategory);

    const filteredQuotes = selectedCategory === "all" ? quotes : quotes.filter(quote => quote.category === selectedCategory);
    quoteDisplay.innerHTML = filteredQuotes.length > 0
        ? filteredQuotes.map(quote => `<p>${quote.text}</p><p><em>Category: ${quote.category}</em></p>`).join("")
        : "No quotes available for this category.";
}

// Export quotes to JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url); // Clean up
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // Update category filter
        filterQuotes(); // Refresh displayed quotes
        alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
}

// Fetch new quotes periodically
setInterval(fetchQuotesFromServer, 30000); // Fetch new data every 30 seconds

// Show a random quote when the page loads
document.addEventListener("DOMContentLoaded", () => {
    showRandomQuote();
    populateCategories(); // Populate categories on load
});
