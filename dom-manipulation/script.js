let quotes = loadQuotes();

function createAddQuoteForm() {
    const formContainer = document.createElement("div");
    formContainer.id = "addQuoteFormContainer";
    formContainer.innerHTML = `
        <form id="addQuoteForm">
            <label for="newQuoteText">Quote:</label>
            <input type="text" id="newQuoteText" placeholder="Enter the quote" required>
            <label for="newQuoteCategory">Category:</label>
            <input type="text" id="newQuoteCategory" placeholder="Enter the category" required>
            <button type="submit">Add Quote</button>
        </form>
    `;
    document.body.appendChild(formContainer);
    async function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value;
    const quoteCategory = document.getElementById("newQuoteCategory").value;

    if (quoteText && quoteCategory) {
        const newQuote = { text: quoteText, category: quoteCategory };
        quotes.push(newQuote); // Add the new quote to the array
        await postQuoteToServer(newQuote); // Optionally sync with the server
        saveQuotes(); // Save the updated array to local storage
        filterQuotes(); // Refresh the displayed quotes based on the current filter
        showRandomQuote(); // Optionally show the newly added quote

        // Clear the input fields after adding
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
    } else {
        notifyUser("Please enter both a quote and a category.", "error");
    }
}
// Event listener for the "Show New Quote" button
document.getElementById("showNewQuoteBtn").addEventListener("click", showRandomQuote);


    // Attach an event listener to handle the form submission
    document.getElementById("addQuoteForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the form from submitting the traditional way
        addQuote(); // Call the addQuote function to add the new quote
    });
}

// Initialize the add quote form when the page loads
document.addEventListener("DOMContentLoaded", () => {
    createAddQuoteForm();
    showRandomQuote();
    populateCategories();
});


// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    try {
        return storedQuotes ? JSON.parse(storedQuotes) : [];
    } catch (error) {
        console.error("Error loading quotes from local storage:", error);
        return [];
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Fetch quotes from a mock server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts");
        const data = await response.json();
        const serverQuotes = data.map(item => ({
            text: item.title,
            category: "General" // Set a default category or derive it from the data
        }));
        await syncQuotes(serverQuotes);
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
    }
}

// Sync local quotes with server quotes
async function syncQuotes(serverQuotes) {
    const existingQuotes = loadQuotes();
    const updatedQuotes = [...existingQuotes]; // Create a copy of existing quotes for updates
    let conflicts = false;

    for (const serverQuote of serverQuotes) {
        const index = updatedQuotes.findIndex(quote => quote.text === serverQuote.text);

        if (index === -1) {
            // If the quote doesn't exist locally, add it
            updatedQuotes.push(serverQuote);
        } else {
            // If the quote exists, resolve conflicts by using the server version
            console.log(`Conflict detected for quote: "${serverQuote.text}". Using server version.`);
            conflicts = true;
            updatedQuotes[index] = serverQuote; // Overwrite with server version
        }
    }

    if (conflicts) {
        notifyUser("Quotes have been updated from the server. Conflicts resolved.", "info");
    } else {
        alert("Quotes synced with server!"); // Alert for successful sync without conflicts
    }

    quotes = updatedQuotes; // Update the global quotes array
    saveQuotes(); // Save the updated quotes array
    filterQuotes(); // Refresh displayed quotes
}

// Post new quote to server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(quote)
        });

        if (!response.ok) {
            throw new Error("Failed to post quote to server.");
        }
        const data = await response.json();
        console.log("Quote posted successfully:", data);
        
        // Update local quotes with the server response
        quotes.push(data); // Assuming server returns the same structure
        saveQuotes(); // Save the updated quotes
    } catch (error) {
        console.error("Error posting quote to server:", error);
        notifyUser("Failed to post quote to server. Please try again.", "error");
    }
}

// Notify users about updates or conflicts
function notifyUser(message, type = "info") {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.background = type === "error" ? "salmon" : "lightblue"; // Different colors for different types
    notification.style.color = "black";
    notification.style.padding = "10px";
    notification.style.zIndex = 1000; // Ensure it appears on top
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
async function addQuote() {
    const quoteText = document.getElementById("newQuoteText").value;
    const quoteCategory = document.getElementById("newQuoteCategory").value;

    if (quoteText && quoteCategory) {
        const newQuote = { text: quoteText, category: quoteCategory };
        quotes.push(newQuote);
        await postQuoteToServer(newQuote); // Post to server
        showRandomQuote(); // Show the newly added quote
        populateCategories(); // Update the category filter
        document.getElementById("newQuoteText").value = ""; // Clear input field
        document.getElementById("newQuoteCategory").value = ""; // Clear input field
    } else {
        notifyUser("Please enter both a quote and a category.", "error");
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
        try {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories(); // Update category filter
            filterQuotes(); // Refresh displayed quotes
            notifyUser('Quotes imported successfully!');
        } catch (error) {
            console.error("Error importing quotes:", error);
            notifyUser("Failed to import quotes. Please ensure the file is valid.", "error");
        }
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
