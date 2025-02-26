(function createTOCSidebar() {
    // Create the container for the TOC if it doesn't already exist.
    let tocContainer = document.getElementById('chatgpt-toc-container');
    if (!tocContainer) {
        tocContainer = document.createElement('div');
        tocContainer.id = 'chatgpt-toc-container';

        // (Optional) Uncomment if you want a title when open.
        // const tocTitle = document.createElement('h2');
        // tocTitle.textContent = 'Table of Contents';
        // tocContainer.appendChild(tocTitle);

        // Create the list element to hold TOC items.
        const tocList = document.createElement('ul');
        tocList.id = 'chatgpt-toc-list';
        tocContainer.appendChild(tocList);

        // Create a handle that remains visible when the panel is hidden.
        // This handle shows "Table of Contents" vertically.
        const tocHandle = document.createElement('div');
        tocHandle.id = 'chatgpt-toc-handle';
        tocHandle.textContent = 'Table of Contents';
        tocContainer.appendChild(tocHandle);

        // Create a pin button to let the user lock the panel in place.
        const pinButton = document.createElement('button');
        pinButton.id = 'toc-pin-button';
        pinButton.textContent = 'Pin';
        // Style the button in the top-right corner of the panel.
        pinButton.style.position = 'absolute';
        pinButton.style.top = '5px';
        pinButton.style.right = '5px';
        pinButton.style.zIndex = '10001';
        tocContainer.appendChild(pinButton);

        // Append the container to the document body.
        document.body.appendChild(tocContainer);

        // Load saved pinned state from localStorage.
        let isPinned = localStorage.getItem('chatgptTocPinned') === 'true';
        if (isPinned) {
            tocContainer.classList.add('pinned');
            pinButton.textContent = 'Unpin';
        }

        // Set up the pin button click handler.
        pinButton.addEventListener('click', function (e) {
            e.stopPropagation();
            // Toggle the pinned state.
            const currentlyPinned = tocContainer.classList.toggle('pinned');
            // Update button text.
            pinButton.textContent = currentlyPinned ? 'Unpin' : 'Pin';
            // Save the state to localStorage.
            localStorage.setItem('chatgptTocPinned', currentlyPinned);
        });
    }

    // Function to update the TOC list by processing each conversation article.
    function updateTOC() {
        const tocList = document.getElementById('chatgpt-toc-list');
        tocList.innerHTML = '';

        // Only process top-level conversation articles (using a data attribute as a filter)
        const articles = document.querySelectorAll('article[data-testid]');
        articles.forEach((article, articleIndex) => {
            // Include both native headings and <strong> elements within ordered lists.
            const selectors =
                'h1:not(.sr-only), h2:not(.sr-only), h3:not(.sr-only), h4:not(.sr-only), h5:not(.sr-only), h6:not(.sr-only), ol li p strong:not(.sr-only)';
            const headings = article.querySelectorAll(selectors);

            // Only add entries if this article contains headings.
            if (headings.length) {
                headings.forEach((heading, index) => {
                    // If the heading doesn't have an id, assign one that is unique per article.
                    if (!heading.id) {
                        heading.id =
                            'chatgpt-heading-' + articleIndex + '-' + index;
                    }

                    // Determine the "level" for indentation.
                    let level;
                    let isOrderedList = false;
                    if (/^H[1-6]$/.test(heading.tagName)) {
                        level = parseInt(heading.tagName.substring(1));
                    } else {
                        // For elements from ordered lists (e.g. <strong> in an <ol>), calculate depth.
                        let depth = 0;
                        let current = heading;
                        while (current && current !== article) {
                            if (current.tagName === 'OL') {
                                depth++;
                            }
                            current = current.parentElement;
                        }
                        level = 2 + depth;
                        isOrderedList = true;
                    }

                    // Create a list item and an anchor linking to the heading.
                    const li = document.createElement('li');
                    li.style.marginLeft = (level - 1) * 10 + 'px';

                    const a = document.createElement('a');
                    let text = heading.innerText.trim();

                    // If this is from an ordered list, try to preserve numbering.
                    if (isOrderedList) {
                        const liParent = heading.closest('li');
                        if (
                            liParent &&
                            liParent.parentElement &&
                            liParent.parentElement.tagName === 'OL'
                        ) {
                            const siblings = Array.from(
                                liParent.parentElement.children
                            ).filter(
                                (child) => child.tagName.toLowerCase() === 'li'
                            );
                            const num = siblings.indexOf(liParent) + 1;
                            text = num + '. ' + text;
                        }
                    }
                    a.textContent = text;
                    a.href = '#' + heading.id;
                    li.appendChild(a);
                    tocList.appendChild(li);
                });

                // Insert a horizontal rule between articles (except after the last article)
                if (articleIndex < articles.length - 1) {
                    const hr = document.createElement('hr');
                    tocList.appendChild(hr);
                }
            }
        });
    }

    // Initial TOC build.
    updateTOC();

    // Use a MutationObserver to update the TOC when new conversation articles or headings are added.
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (
                            node.matches('article[data-testid]') ||
                            node.querySelector('article[data-testid]') ||
                            node.querySelector('h1, h2, h3, h4, h5, h6') ||
                            node.querySelector('ol li p strong')
                        ) {
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
