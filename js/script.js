const books = [];
const RENDER_EVENT = 'render-shelf';
const ADD_BOOK_EVENT = 'add-book';
const DELETE_BOOK_EVENT = 'delete-book';
const SEARCH_BOOK_EVENT = 'search-book';
const STORAGE_KEY = 'book-apps';

/* function untuk mengecek apakah web storage dapat digunakan atau tidak */
function isStorageExist(){
    if (typeof (Storage) === undefined) {
      alert('Browser kamu tidak mendukung local storage');
      return false;
    }
    return true;
}

/* Event saat seluruh content html telah selesai di load */
document.addEventListener('DOMContentLoaded', function () {
    const bookForm = document.getElementById('inputBook');
    const searchForm = document.getElementById('searchBook');

    if (isStorageExist()) {
        loadDataFromStorage();
    }

    bookForm.addEventListener('submit', function (event) {
      event.preventDefault();
      addBook();
    });

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

});


/* function untuk mengambil data inputan form dan memasukkannya 
    kedalam objek books */
function addBook(){
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;
    const checkbox = document.getElementById('inputBookIsComplete');
    const isComplete = checkbox.checked ? true : false;

    const generatedID = generatedId();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    books.push(bookObject);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    document.dispatchEvent(new Event(ADD_BOOK_EVENT));

    saveData();
}


/* function untuk membuat id berdasarkan timestamp */
function generatedId(){
    return +new Date();
}


/* function untuk membuat objek berdasarkan parameter yang dikirim 
    dari inputan form */
function generateBookObject(id, title, author, year, isComplete){
    return {
        id,
        title,
        author,
        year,
        isComplete
    };
}


/* custom-event RENDER_EVENT untuk memasukkan data buku yang didapat 
    dari function makeShelf kedalam tampilan html website */
document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';
    
    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const book of books) {
        const bookElement = makeShelf(book);
        /* function makeShelf akan mereturn container html
            kemudian di append disesuaikan dengan status isComplete buku */
        if (book.isComplete) {
            completedBookList.append(bookElement);
        }else{
            uncompletedBookList.append(bookElement);
        }
    }
});


/* function untuk membuat elemen html dan menyesuaikannya dengan 
    status isComplete objek buku yang dikirim */
function makeShelf(bookObject){
    /* Membuat container data buku dalam elemen article */
    const bookContainer = document.createElement('article');
    bookContainer.classList.add('book_item')

    const bookTitle = document.createElement('h3');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = bookObject.author;

    const bookYear = document.createElement('p');
    bookYear.innerText = bookObject.year;

    /* Mengappend data data buku kedalam container */
    bookContainer.append(bookTitle,bookAuthor,bookYear);

    /* Membuat container untuk button */
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const greenButton = document.createElement('button');
    const redButton = document.createElement('button');

    /* Menyesuaikan button dengan status isComplete buku */
    if(bookObject.isComplete){
        greenButton.innerText = 'Belum Selesai Dibaca';
        greenButton.classList.add('green');
        
        redButton.innerText = 'Hapus Buku';
        redButton.classList.add('red');
     
        greenButton.addEventListener('click', function () {
            addToUncompletedShelf(bookObject.id);
        });

        redButton.addEventListener('click', function () {
            deleteBook(bookObject.id);
        });      
    }else{
        greenButton.innerText = 'Selesai Dibaca';
        greenButton.classList.add('green');
        
        redButton.innerText = 'Hapus Buku';
        redButton.classList.add('red');

        greenButton.addEventListener('click', function () {
            addToCompletedShelf(bookObject.id);
        });

        redButton.addEventListener('click', function () {
           deleteBook(bookObject.id);
        });
    }
    buttonContainer.append(greenButton,redButton);
    bookContainer.append(buttonContainer);
    return bookContainer;
}


/* mendapatkan objek buku berdasarkan id buku */
function findBookById(bookId){
    return books.find((book) => book.id == bookId);
}


/* mencari buku berdasarkan id, kemudian mengubah status
    isComplete buku menjadi true */
function addToCompletedShelf(bookId){
    const targetBook = findBookById(bookId)
    if(targetBook == undefined) return;

    targetBook.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}


/* mencari buku berdasarkan id, kemudian  mengubah status
    isComplete buku menjadi false */
function addToUncompletedShelf(bookId){
    const targetBook = findBookById(bookId)
    if(targetBook == undefined) return;

    targetBook.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

/* mencari index array objek buku berdasarkan id */
function findBookIndex(bookId){
    for (let i = 0; i < books.length; i++) {
        if(books[i].id == bookId){
            return i;
        }
    }
}

/* menghapus data buku dari array objek books menggunakan method splice */
function deleteBook(bookId){
    const targetBook = findBookIndex(bookId);
    if (targetBook === -1) return;
    
    books.splice(targetBook, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    document.dispatchEvent(new Event(DELETE_BOOK_EVENT));
    saveData();
}


/* Membuat custom-event ADD_BOOK_EVENT
    membuat message saat buku telah dimasukkan dalam array */
document.addEventListener(ADD_BOOK_EVENT, function () {
    const messageContainer = document.getElementById('flash-message');
    messageContainer.removeAttribute('class');
    messageContainer.innerHTML = '';
    messageContainer.classList.add('success');
    messageContainer.style.display = 'block';

    const message = document.createElement('p');
    message.innerText = 'you added a new book';

    const closeButton = document.createElement('span');
    closeButton.innerText = '\u00D7';
    closeButton.classList.add('close');

    messageContainer.append(message,closeButton);

    closeButton.addEventListener('click' ,function(){
        messageContainer.style.display = 'none';
    })
})


/* Membuat custom-event DELETE_BOOK_EVENT
    membuat message saat buku telah dihapus dari array */
document.addEventListener(DELETE_BOOK_EVENT, function () {
    const messageContainer = document.getElementById('flash-message');
    messageContainer.innerHTML = '';
    messageContainer.removeAttribute('class');
    messageContainer.classList.add('danger');
    messageContainer.style.display = 'block';

    const message = document.createElement('p');
    message.innerText = 'you has deleted book';

    const closeButton = document.createElement('span');
    closeButton.innerText = '\u00D7';
    closeButton.classList.add('close');

    messageContainer.append(message,closeButton);

    closeButton.addEventListener('click' ,function(){
        messageContainer.style.display = 'none';
    })
})


/* Membuat custom-event DELETE_BOOK_EVENT
    membuat message saat buku telah dihapus dari array */
document.addEventListener(SEARCH_BOOK_EVENT, function () {
    const messageContainer = document.getElementById('flash-message');
    messageContainer.innerHTML = '';
    messageContainer.removeAttribute('class');
    messageContainer.classList.add('warning');
    messageContainer.style.display = 'block';

    const message = document.createElement('p');
    message.innerHTML = 'the book you were looking for <strong>could not be found</strong>';

    const closeButton = document.createElement('span');
    closeButton.innerText = '\u00D7';
    closeButton.classList.add('close');

    messageContainer.append(message,closeButton);

    closeButton.addEventListener('click' ,function(){
        messageContainer.style.display = 'none';
    })
})


/* Melakukan pencarian buku melalui title */
function findBookByTitle(title){
    return books.filter((book) => book.title == title )
}


/* Melakukan pencarian terhadap buku dan menampilkannya */
function searchBook(){
    const keyword = document.getElementById('searchBookTitle').value;
    const targetBook = findBookByTitle(keyword);
    if (targetBook.length == 0){
        document.dispatchEvent(new Event(SEARCH_BOOK_EVENT));
        return;
    }

    const messageContainer = document.getElementById('flash-message');
    messageContainer.innerHTML = '';
    messageContainer.removeAttribute('class');

    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';
    
    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const book of targetBook) {
        const bookElement = makeShelf(book);
        /* function makeShelf akan mereturn container html
            kemudian di append disesuaikan dengan status isComplete buku */
        if (book.isComplete) {
            completedBookList.append(bookElement);
        }else{
            uncompletedBookList.append(bookElement);
        }
    }
}

/* Function menyimpan data kedalam web storage */
function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
    }
  }

/* Function mengambil data dari web storage */
function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
   
    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
   
    document.dispatchEvent(new Event(RENDER_EVENT));
}