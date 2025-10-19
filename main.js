const books = [];
const RENDER_EVENT = "render_book";
const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "BOOKSHELF_APP";

function isStorageExist() {
    if(typeof (Storage) === "undefined"){
        alert("Browser Tidak Mendukung");
        return false;
    }
    return true;
}

function saveBook() {
    if(isStorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const submitForm = document.getElementById("bookForm");
    submitForm.addEventListener("submit", function(event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById("searchBook");
    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        searchBook();
    });

    if(isStorageExist()){
        loadDataFromStorage();
    }

})

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
})

function addBook() {
    const bookTitle = document.getElementById("bookFormTitle").value;
    const bookAuthor = document.getElementById("bookFormAuthor").value;
    const bookYear = document.getElementById("bookFormYear").value;
    const isCompleted = document.getElementById("bookFormIsComplete").checked;

    const generateid = generateId();
    const bookObject = generateBook(generateid, bookTitle, bookAuthor, parseInt(bookYear), isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function generateId() {
    return +new Date();
}

function generateBook(id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete,
    };
}

document.addEventListener(RENDER_EVENT, function() {
    // console.log(books);
    const incompletedBook = document.getElementById("incompleteBookList");
    incompletedBook.innerHTML = "";

    const completedBook = document.getElementById("completeBookList");
    completedBook.innerHTML = "";

    for(bookItems of books){
        const bookElement = makeBooks(bookItems);
        if(!bookItems.isComplete){
            incompletedBook.append(bookElement);
        }
        else{
            completedBook.append(bookElement);
        }
    }
})

function makeBooks(bookObject) {
    const textTitle = document.createElement("h3");
    textTitle.innerText = bookObject.title;
    textTitle.setAttribute("data-testid", "bookItemTitle");
    textTitle.classList.add("fw-bold", "text-dark");

    const textAuthor = document.createElement("p");
    textAuthor.innerText = `Penulis: ${bookObject.author}`;
    textAuthor.setAttribute("data-testid", "bookItemAuthor");
    textAuthor.classList.add("text-muted", "mb-1");

    const textYear = document.createElement("p");
    textYear.innerText = `Tahun: ${bookObject.year}`;
    textYear.setAttribute("data-testid", "bookItemYear");
    textAuthor.classList.add("text-muted", "mb-1");

    const textContainer = document.createElement("div");
    textContainer.append(textTitle, textAuthor, textYear);
    textContainer.classList.add("p-3", "border", "rounded", "bg-light"); 

    const container = document.createElement("div");
    container.append(textContainer);
    container.setAttribute("data-bookid", bookObject.id);
    container.setAttribute("data-testid", "bookItem");
    container.classList.add("shadow-sm", "p-3", "mb-3", "bg-white", "rounded"); 

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("d-flex", "gap-2", "mt-3");

    const completeButton = document.createElement("button");
    completeButton.innerText = bookObject.isComplete ? "Undo" : "Selesai dibaca";
    completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    completeButton.classList.add("btn", bookObject.isComplete ? "btn-primary" : "btn-success", "btn-sm");

    completeButton.addEventListener("click", function () {
        if (bookObject.isComplete) {
            undotaskfromCompleted(bookObject.id);
            bookObject.isComplete = false;
        } else {
            bookCompleted(bookObject.id);
            bookObject.isComplete = true;
        }

        completeButton.innerText = bookObject.isComplete ? "Undo" : "Selesai dibaca";
        completeButton.classList.toggle("btn-primary");
        completeButton.classList.toggle("btn-success");
    });

    const trashButton = document.createElement("button");
    trashButton.innerText = "Hapus buku";
    trashButton.setAttribute("data-testid", "bookItemDeleteButton");
    trashButton.classList.add("btn", "btn-danger", "btn-sm");
    trashButton.addEventListener("click", function() {
        removeCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.innerText = "Edit buku";
    editButton.setAttribute("data-testid", "bookItemEditButton");
    editButton.classList.add("btn", "btn-warning", "btn-sm");
    editButton.addEventListener("click", function() {
        editCompleted(bookObject.id);
    });

    buttonContainer.append(completeButton, trashButton, editButton);

    container.append(buttonContainer);

    return container;
}

function findBook(bookID){
    for(const bookItem of books){
        if(bookItem.id === bookID){
            return bookItem
        }
    }
    return null;
}

function bookCompleted (bookID) {
    const bookTarget = findBook(bookID);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function removeCompleted(bookID) {
    const bookTarget = findbookIndex(bookID);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function undotaskfromCompleted(bookID) {
    const bookTarget = findBook(bookID);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook();
}

function findbookIndex(bookID) {
    for (const index in books) {
        if (books[index].id === bookID) {
            return index;
        }
    }
    return -1;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function editCompleted(bookId) {
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    const existingForm = document.getElementById("editForm");
    if (existingForm) {
        existingForm.remove();
    }

    const editForm = document.createElement("div");
    editForm.setAttribute("id", "editForm");
    editForm.classList.add("p-4", "border", "rounded", "bg-light", "shadow-sm", "mt-3");

    const editTitle = document.createElement("input");
    editTitle.type = "text";
    editTitle.value = bookTarget.title;
    editTitle.classList.add("form-control", "mb-2");

    const editAuthor = document.createElement("input");
    editAuthor.type = "text";
    editAuthor.value = bookTarget.author;
    editAuthor.classList.add("form-control", "mb-2");

    const editYear = document.createElement("input");
    editYear.type = "number";
    editYear.value = bookTarget.year;
    editYear.classList.add("form-control", "mb-3");

    const saveButton = document.createElement("button");
    saveButton.innerText = "Simpan";
    saveButton.classList.add("btn", "btn-success", "me-2");
    saveButton.onclick = function () {
        bookTarget.title = editTitle.value;
        bookTarget.author = editAuthor.value;
        bookTarget.year = editYear.value;

        document.dispatchEvent(new Event(RENDER_EVENT)); 
        saveBook(); 
        editForm.remove();
    };

    const cancelButton = document.createElement("button");
    cancelButton.innerText = "Batal";
    cancelButton.classList.add("btn", "btn-secondary");
    cancelButton.onclick = function () {
        editForm.remove();
    };

    editForm.append(editTitle, editAuthor, editYear, saveButton, cancelButton);

    const bookElement = document.querySelector(`[data-bookid="${bookId}"]`);
    bookElement.appendChild(editForm);
}

function searchBook() {
    const searchInput = document.getElementById("searchBookTitle").value.toLowerCase(); 
    const bookItems = document.querySelectorAll("[data-testid='bookItem']"); 

    bookItems.forEach(book => {
        const bookTitle = book.querySelector("[data-testid='bookItemTitle']").innerText.toLowerCase(); 
        
        if (bookTitle.includes(searchInput)) {
            book.style.display = "block"; 
        } else {
            book.style.display = "none"; 
        }
    });
}