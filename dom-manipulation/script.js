const quotes = loadQuotes();

function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    return storedQuotes ? JSON.parse(storedQuotes) : [];
}

function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
}

function fetchQuotesFromServer() {
    fetch("https://jsonplaceholder.typicode.com/posts")
        .then(response => response.json())
        .then(data => {
            const serverQuotes = data.map(item => ({
                text: item.title,
                category: "General"
            }));
            syncQuotes(serverQuotes);
        })
        .catch(error => console.error("Error fetching quotes from server:", error));
}

function syncQuotes(serverQuotes) {
    const existingQuotes = loadQuotes();

    serverQuotes.forEach(serverQuote => {
        const index = existingQuotes.findIndex(quote => quote.text === serverQuote.text);

        if (index === -1) {
            existingQuotes.push(serverQuote);
        } else {
            console.log(`Conflict detected for quote: "${serverQuote.text}". Using server version.`);
            existingQuotes[index] = serverQuote;
            notifyUser("Quotes have been updated from the server.");
        }
    });

    saveQuotes(existingQuotes);
    populateCategories();
    filterQuotes();
}

function notifyUser(message) {
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.position = "fixed";
    notification.style.top = "10px";
    notification.style.right = "10px";
    notification.style.background = "lightblue";
    notification.style.padding = "10px";
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}

// Set an interval to fetch new quotes
setInterval(fetchQuotesFromServer, 30000);

// Rest of your functions...
