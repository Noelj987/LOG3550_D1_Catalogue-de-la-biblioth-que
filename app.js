(() => {
    "use strict";

    const STORAGE_KEY = "log3550-catalogue-livres";
    const CATEGORIES = ["roman", "science", "histoire", "informatique", "autre"];
    const CATEGORY_LABELS = {
        roman: "Roman",
        science: "Science",
        histoire: "Histoire",
        informatique: "Informatique",
        autre: "Autre"
    };
    const form = document.querySelector("#add-book-form");
    const booksContainer = document.querySelector("#books-container");
    const searchInput = document.querySelector("#search-input");
    const categoryFilter = document.querySelector("#category-filter");
    const availableFilter = document.querySelector("#available-filter");
    const sortSelect = document.querySelector("#sort-select");
    const resultsCount = document.querySelector("#results-count");
    const emptyMessage = document.querySelector("#no-results-message");
    const formStatus = document.querySelector("#form-status");
    const resetButton = document.querySelector("#reset-storage-btn");
    const fields = {
        title: document.querySelector("#title"),
        author: document.querySelector("#author"),
        year: document.querySelector("#year"),
        category: document.querySelector("#category")
    };
    fields.year.max = String(new Date().getFullYear());

    let books = loadBooks();

    function isBook(value) {
        return value !== null
            && typeof value === "object"
            && (typeof value.id === "number" || typeof value.id === "string")
            && typeof value.titre === "string"
            && typeof value.auteur === "string"
            && Number.isInteger(value.annee)
            && CATEGORIES.includes(value.categorie)
            && typeof value.disponible === "boolean";
    }

    function loadBooks() {
        try {
            const storedBooks = localStorage.getItem(STORAGE_KEY);
            if (storedBooks === null) {
                return [...window.BOOKS_DEFAULT];
            }

            const parsedBooks = JSON.parse(storedBooks);
            if (!Array.isArray(parsedBooks) || !parsedBooks.every(isBook)) {
                throw new Error("Les données sauvegardées ne sont pas un catalogue valide.");
            }
            return parsedBooks;
        } catch (error) {
            console.error("Impossible de lire le catalogue sauvegardé.", error);
            window.alert("Le catalogue sauvegardé est inaccessible ou invalide. Les données de départ seront affichées.");
            return [...window.BOOKS_DEFAULT];
        }
    }

    function saveBooks() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
            return true;
        } catch (error) {
            console.error("Impossible de sauvegarder le catalogue.", error);
            formStatus.textContent = "La modification est affichée, mais n’a pas pu être sauvegardée dans ce navigateur.";
            return false;
        }
    }

    function normalizeText(value) {
        return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
    }

    function makeElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) {
            element.className = className;
        }
        if (text !== undefined) {
            element.textContent = text;
        }
        return element;
    }

    function createBookCard(book) {
        const card = makeElement("article", "book-card");
        const title = makeElement("h3", "", book.titre);
        const author = makeElement("p", "book-author", `Par ${book.auteur}`);
        const metadata = makeElement(
            "p",
            "book-meta",
            `${book.annee} · ${CATEGORY_LABELS[book.categorie]}`
        );
        const status = makeElement(
            "span",
            `book-status ${book.disponible ? "status-available" : "status-loaned"}`,
            book.disponible ? "Disponible" : "Emprunté"
        );
        const deleteButton = makeElement("button", "button button-delete", "Supprimer");
        deleteButton.type = "button";
        deleteButton.dataset.bookId = String(book.id);
        deleteButton.setAttribute("aria-label", `Supprimer « ${book.titre} »`);

        card.append(title, author, metadata, status, deleteButton);
        return card;
    }

    function getVisibleBooks() {
        const query = normalizeText(searchInput.value.trim());
        let visibleBooks = books.filter((book) => {
            const matchesSearch = !query
                || normalizeText(book.titre).includes(query)
                || normalizeText(book.auteur).includes(query);
            const matchesCategory = !categoryFilter.value
                || book.categorie === categoryFilter.value;
            const matchesAvailability = !availableFilter.checked || book.disponible;
            return matchesSearch && matchesCategory && matchesAvailability;
        });

        const [sortField, sortDirection] = sortSelect.value.split("-");
        if (sortField === "title") {
            const direction = sortDirection === "desc" ? -1 : 1;
            visibleBooks = [...visibleBooks].sort((a, b) =>
                direction * a.titre.localeCompare(b.titre, "fr", { sensitivity: "base" })
            );
        } else if (sortField === "year") {
            const direction = sortDirection === "desc" ? -1 : 1;
            visibleBooks = [...visibleBooks].sort((a, b) => direction * (a.annee - b.annee));
        }
        return visibleBooks;
    }

    function renderBooks() {
        const visibleBooks = getVisibleBooks();
        const fragment = document.createDocumentFragment();
        visibleBooks.forEach((book) => fragment.append(createBookCard(book)));
        booksContainer.replaceChildren(fragment);

        const count = visibleBooks.length;
        resultsCount.textContent = `${count} ${count === 1 ? "livre trouvé" : "livres trouvés"}`;
        emptyMessage.hidden = count !== 0;
    }

    function setFieldError(fieldName, message) {
        const field = fields[fieldName];
        document.querySelector(`#${fieldName}-error`).textContent = message;
        if (message) {
            field.setAttribute("aria-invalid", "true");
        } else {
            field.removeAttribute("aria-invalid");
        }
    }

    function validateForm() {
        const title = fields.title.value.trim();
        const author = fields.author.value.trim();
        const year = Number(fields.year.value);
        const category = fields.category.value;
        const currentYear = new Date().getFullYear();

        setFieldError("title", title.length < 2 ? "Le titre doit contenir au moins 2 caractères." : "");
        setFieldError("author", author.length < 2 ? "L’auteur doit contenir au moins 2 caractères." : "");
        setFieldError(
            "year",
            !Number.isInteger(year) || year < 1450 || year > currentYear
                ? `L’année doit être un nombre entre 1450 et ${currentYear}.`
                : ""
        );
        setFieldError("category", !CATEGORIES.includes(category) ? "Choisissez une catégorie." : "");

        return Object.keys(fields).every((name) =>
            !fields[name].hasAttribute("aria-invalid")
        );
    }

    function addBook(event) {
        event.preventDefault();
        formStatus.textContent = "";
        if (!validateForm()) {
            const firstInvalidField = form.querySelector('[aria-invalid="true"]');
            firstInvalidField.focus();
            return;
        }

        const book = {
            id: Date.now(),
            titre: fields.title.value.trim(),
            auteur: fields.author.value.trim(),
            annee: Number(fields.year.value),
            categorie: fields.category.value,
            disponible: document.querySelector("#available").checked
        };
        books.push(book);
        saveBooks();
        renderBooks();
        form.reset();
        Object.keys(fields).forEach((name) => setFieldError(name, ""));
        if (!formStatus.textContent) {
            formStatus.textContent = "Le livre a été ajouté au catalogue.";
        }
    }

    function deleteBook(event) {
        const button = event.target.closest("button[data-book-id]");
        if (!button) {
            return;
        }

        const book = books.find((item) => String(item.id) === button.dataset.bookId);
        if (!book || !window.confirm(`Voulez-vous vraiment supprimer « ${book.titre} » ?`)) {
            return;
        }

        books = books.filter((item) => String(item.id) !== button.dataset.bookId);
        saveBooks();
        renderBooks();
        if (!formStatus.textContent) {
            formStatus.textContent = "Le livre a été supprimé du catalogue.";
        }
    }

    function resetCatalogue() {
        if (!window.confirm("Réinitialiser le catalogue et supprimer les modifications sauvegardées ?")) {
            return;
        }

        books = [...window.BOOKS_DEFAULT];
        if (saveBooks()) {
            formStatus.textContent = "Le catalogue a été réinitialisé aux données de départ.";
        }
        renderBooks();
    }

    [searchInput, categoryFilter, availableFilter, sortSelect].forEach((control) => {
        control.addEventListener("input", renderBooks);
        control.addEventListener("change", renderBooks);
    });
    form.addEventListener("submit", addBook);
    booksContainer.addEventListener("click", deleteBook);
    resetButton.addEventListener("click", resetCatalogue);

    renderBooks();
})();
