(function createTOCSidebar() {
    // Create the container for the TOC if it doesn't already exist
    let tocContainer = document.getElementById('chatgpt-toc-container');
    if (!tocContainer) {
        tocContainer = document.createElement('div');
        tocContainer.id = 'chatgpt-toc-container';

        // Create and add a title
        const tocTitle = document.createElement('h2');
        tocTitle.textContent = 'Table of Contents';
        tocContainer.appendChild(tocTitle);

        // Create the list element
        const tocList = document.createElement('ul');
        tocList.id = 'chatgpt-toc-list';
        tocContainer.appendChild(tocList);

        // Create a handle that remains visible for hover
        const tocHandle = document.createElement('div');
        tocHandle.id = 'chatgpt-toc-handle';
        tocHandle.textContent = 'TOC';
        tocContainer.appendChild(tocHandle);

        // Append the container to the document body
        document.body.appendChild(tocContainer);
    }

    // Function to update the TOC list
    function updateTOC() {
        const tocList = document.getElementById('chatgpt-toc-list');
        // Clear current TOC items
        tocList.innerHTML = '';

        // Query for heading elements inside articles.
        // Exclude headings with the class "sr-only" (usually for accessibility only).
        const headings = document.querySelectorAll(
            'article h1:not(.sr-only), article h2:not(.sr-only), article h3:not(.sr-only), article h4:not(.sr-only), article h5:not(.sr-only), article h6:not(.sr-only)'
        );

        headings.forEach((heading, index) => {
            // If the heading doesn't have an id, assign one.
            if (!heading.id) {
                heading.id = 'chatgpt-heading-' + index;
            }

            // Create a list item and an anchor linking to the heading.
            const li = document.createElement('li');
            // Indent based on heading level (e.g., h1: no indent, h2: slight indent, etc.)
            const level = parseInt(heading.tagName.substring(1));
            li.style.marginLeft = (level - 1) * 10 + 'px';

            const a = document.createElement('a');
            a.textContent = heading.innerText.trim();
            a.href = '#' + heading.id;

            li.appendChild(a);
            tocList.appendChild(li);
        });
    }

    // Initial TOC build
    updateTOC();

    // Use a MutationObserver to detect changes in the document (dynamically loaded headings)
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector('h1, h2, h3, h4, h5, h6')) {
                            shouldUpdate = true;
                        }
                    }
                });
            }
        });
        if (shouldUpdate) {
            updateTOC();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
