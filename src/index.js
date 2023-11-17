import './main.scss';

document.addEventListener("DOMContentLoaded", () => {
    const sliderImages = document.querySelector('.slider-images');
    const sliderDots = document.querySelector('.slider-dots');
    const slides = document.querySelectorAll('.slider-images .image');
    let currentSlide = 0;

    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        currentSlide = index;
        updateDots();
    };

    const autoSlide = () => {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    };

    const updateDots = () => {
        const dotItems = document.querySelectorAll('.slider-dots-item');
        dotItems.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    };

    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dots-item');
        dot.addEventListener('click', () => showSlide(i));
        sliderDots.appendChild(dot);
    });

    setInterval(autoSlide, 5000);
    showSlide(currentSlide);

    const linkCategoryBooks = document.querySelectorAll(".catalog-menu_item");
    let startIndex = 0;
    const maxResults = 6;
    let currentCategory = "architecture";
    const apiKey = "AIzaSyD_RPYE_9WiV7s7s_GapEElexZCZMPmXuU";

    const toggleCategoryBooks = () => {
        linkCategoryBooks.forEach(item => {
            item.addEventListener("click", () => {
                removeActiveCategory();
                item.classList.add("active");
                currentCategory = item.innerText.toLowerCase();
                startIndex = 0;
                clearBookList();
                fetchBooks(currentCategory);
            });
        });
    };

    const removeActiveCategory = () => {
        const activeItem = document.querySelector('.catalog-menu_item.active');
        if (activeItem) {
            activeItem.classList.remove('active');
        }
    };

    const clearBookList = () => {
        const bookList = document.getElementById("bookList");
        bookList.innerHTML = '';
    };

    const createBuyButton = (bookID) => {
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy now';
        buyButton.classList.add('buy-now-btn');
        const isInCart = !isBookInCart(bookID);
        updateButtonState(buyButton, isInCart);

        buyButton.addEventListener('click', async () => {
            const isInCart = isBookInCart(bookID);
            if (isInCart) {
                await removeFromCart(bookID);
            } else {
                await addToCart(bookID);
            }

            updateButtonState(buyButton, isInCart);
            updateCartCount();
        });

        return buyButton;
    };

    const updateButtonState = (button, isInCart) => {
        const action = isInCart ? 'buy-now-btn' : 'in-the-cart-btn';
        button.classList.remove(isInCart ? 'in-the-cart-btn' : 'buy-now-btn');
        button.classList.add(action);
        button.textContent = isInCart ? 'Buy now' : 'In the cart';
    };

    const fetchBooks = (category) => {
        const bookList = document.getElementById("bookList");
        const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${category}&startIndex=${startIndex}&maxResults=${maxResults}&key=${apiKey}`;

        const handleResponse = (data) => {
            if (data && data.items && Array.isArray(data.items)) {
                const bookContainer = document.createElement('div');
                bookContainer.classList.add('row'); // Добавлен класс row для Bootstrap Grid System

                data.items.forEach((item) => {
                    const bookDiv = createBookElement(item);
                    bookContainer.appendChild(bookDiv);
                });

                bookList.appendChild(bookContainer);

                startIndex += maxResults;
            } else {
                console.error("Ошибка: отсутствует 'items' или не является массивом");
            }
        };

        fetch(url)
            .then(response => response.ok ? response.json() : Promise.reject(`Network response was not ok: ${response.statusText}`))
            .then(handleResponse)
            .catch(error => console.error("Ошибка при загрузке книг:", error));
    };

    const createBookElement = (item) => {
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('catalog-show-block', 'col-md-6', 'mb-4'); // Добавлены пользовательские классы для стилизации

        const imageDiv = document.createElement('div');
        imageDiv.classList.add('catalog-show-block-frame');

        const image = document.createElement('img');
        image.src = item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : '';
        image.alt = item.volumeInfo.title;
        image.classList.add('catalog-show-block-img');
        imageDiv.appendChild(image);

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('catalog-show-block-info');

        const authors = createParagraph('book-authors', item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : '-');
        const title = createHeading('h3', 'book-title', item.volumeInfo.title);
        const description = createParagraph('book-description', item.volumeInfo.description ? item.volumeInfo.description.substring(0, 120) + '...' : '-');
        const price = createParagraph('book-price', item.saleInfo.listPrice ? `Price: ${item.saleInfo.listPrice.amount} ${item.saleInfo.listPrice.currencyCode}` : ' ');

        const buyButton = createBuyButton(item.id);

        infoDiv.appendChild(authors);
        infoDiv.appendChild(title);
        infoDiv.appendChild(description);
        infoDiv.appendChild(price);
        infoDiv.appendChild(buyButton);

        bookDiv.appendChild(imageDiv);
        bookDiv.appendChild(infoDiv);

        return bookDiv;
    };

    const createParagraph = (className, text) => {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.classList.add(className);
        return paragraph;
    };

    const createHeading = (tag, className, text) => {
        const heading = document.createElement(tag);
        heading.textContent = text;
        heading.classList.add(className);
        return heading;
    };

    const loadMore = () => {
        fetchBooks(currentCategory);
    };

    const loadMoreBtn = document.getElementById("loadMoreBtn");
    loadMoreBtn.addEventListener("click", loadMore);

    let cartCount = 0;

    const addToCart = (bookID) => {
        let cartItems = getCartItems();
        if (!cartItems.includes(bookID)) {
            cartItems.push(bookID);
            setCartItems(cartItems);
            cartCount++;
            updateCartCount();
        }
    };

    const removeFromCart = (bookID) => {
        let cartItems = getCartItems();
        if (cartItems.includes(bookID)) {
            cartItems = cartItems.filter((item) => item !== bookID);
            setCartItems(cartItems);
            cartCount--;
            updateCartCount();
        }
    };

    const isBookInCart = (bookID) => {
        let cartItems = getCartItems();
        return cartItems.includes(bookID);
    };

    const getCartItems = () => {
        return JSON.parse(localStorage.getItem("cartItems")) || [];
    };

    const setCartItems = (cartItems) => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    };

    const updateCartCount = () => {
        const circle = document.getElementById("circle");
        let cartItems = getCartItems();
        circle.textContent = cartItems.length;
    };

    window.addEventListener("load", () => {
        updateCartCount();
        toggleCategoryBooks();
        fetchBooks(currentCategory);
    });
});

