// Regular expression to match
const regexp = /yellownote=/g; // Replace with your regexp
let previousMatches = new Set(); // To track the previous matches

// Function to process the entire document body and highlight matches
function scanDocument() {
    const currentMatches = new Set();
    const nodes = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = nodes.nextNode())) {
        const matches = [...node.textContent.matchAll(regexp)];

        matches.forEach(match => {
            console.log(match);
            console.log("############");
            const matchText = match[0];
            currentMatches.add(matchText);

            // If this is a new match, log it
            if (!previousMatches.has(matchText)) {
                console.log(`New match found: ${matchText}`);
            }

            // Highlight the match
            const highlightedText = `<span class="highlight">${matchText}</span>`;
            node.textContent = node.textContent.replace(matchText, highlightedText);
        });
    }

    // Log matches that are no longer present
    previousMatches.forEach(match => {
        if (!currentMatches.has(match)) {
            console.log(`Match no longer present: ${match}`);
        }
    });

    previousMatches = currentMatches;
}

// Run the scan every 5 seconds
setInterval(scanDocument, 5000);

// Initial run
scanDocument();