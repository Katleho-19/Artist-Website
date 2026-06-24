//Programmer : Katleho Makhoali.
//Shine&Style simple shopping cart (localStorage based) 

const CART_KEY = 'shineStyleCart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function addToCart(id, name, price, image) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id, name, price: parseFloat(price), image, qty: 1 });
    }
    saveCart(cart);
    showCartToast(name);
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    renderCartPage();
}

function changeQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        return removeFromCart(id);
    }
    saveCart(cart);
    renderCartPage();
}

function cartTotalItems() {
    return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function cartTotalPrice() {
    return getCart().reduce((sum, item) => sum + item.qty * item.price, 0);
}

function updateCartCount() {
    const count = cartTotalItems();
    document.querySelectorAll('.cart-link span').forEach(span => {
        span.textContent = count;
    });
}

// Small toast notification when an item is added
function showCartToast(name) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = `${name} added to cart`;
    toast.classList.add('show');
    clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(() => toast.classList.remove('show'), 1800);
}

// Wire up every "Add to cart" button on the page
function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const { id, name, price, image } = btn.dataset;
            addToCart(id, name, price, image);
        });
    });
}

// Cart page rendering
function renderCartPage() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    if (!container) return;

    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = '<p class="cart-empty">Your cart is empty. <a href="service.html">Continue shopping</a>.</p>';
        if (summary) summary.innerHTML = '';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-row" data-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-row-info">
                <h4>${item.name}</h4>
                <p class="price">R${item.price.toFixed(2)}</p>
            </div>
            <div class="qty-control">
                <button class="qty-btn" data-action="dec">-</button>
                <span>${item.qty}</span>
                <button class="qty-btn" data-action="inc">+</button>
            </div>
            <p class="line-total">R${(item.price * item.qty).toFixed(2)}</p>
            <button class="remove-btn" aria-label="Remove item"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    container.querySelectorAll('.cart-row').forEach(row => {
        const id = row.dataset.id;
        row.querySelector('[data-action="inc"]').addEventListener('click', () => changeQty(id, 1));
        row.querySelector('[data-action="dec"]').addEventListener('click', () => changeQty(id, -1));
        row.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(id));
    });

    if (summary) {
        const total = cartTotalPrice();
        summary.innerHTML = `
            <div class="summary-row">
                <span>Subtotal</span>
                <span>R${total.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>R${total.toFixed(2)}</span>
            </div>
            <button id="checkout-btn" class="btn btn-primary">Proceed to checkout</button>
        `;
        document.getElementById('checkout-btn').addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initAddToCartButtons();
    renderCartPage();
});
