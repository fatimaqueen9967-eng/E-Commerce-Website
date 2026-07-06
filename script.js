// ================= PAGE NAVIGATION (SPA) =================
const pages = document.querySelectorAll('.page-section');
const navLinks = document.querySelectorAll('.nav-link');
const mobileMenu = document.getElementById('mobileMenu');
const menuBtn = document.getElementById('menuBtn');

function showPage(pageName) {
    pages.forEach(page => {
        if (page.id === `page-${pageName}`) {
            page.classList.remove('hidden');
            // Retrigger fade-in animation every time page is shown
            page.style.animation = 'none';
            void page.offsetWidth; // force reflow so animation replays
            page.style.animation = '';
        } else {
            page.classList.add('hidden');
        }
    });

    // Highlight active nav link
    navLinks.forEach(link => {
        if (link.dataset.page === pageName) {
            link.classList.add('text-red-500');
        } else {
            link.classList.remove('text-red-500');
        }
    });

    // Close mobile menu after navigating
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('flex');
    menuBtn.classList.remove('rotate');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If navigating to products, re-trigger scroll reveal check
    if (pageName === 'products') {
        setTimeout(revealOnScroll, 100);
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page;
        showPage(page);
    });
});

// Mobile hamburger toggle
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    menuBtn.classList.toggle('rotate');
});

// ================= SCROLL REVEAL (Intersection Observer) =================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15 });

function revealOnScroll() {
    document.querySelectorAll('.reveal').forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.08}s`;
        revealObserver.observe(el);
    });
}
revealOnScroll();

// Show Home page by default
showPage('home');

// ================= CART STATE =================
let cart = JSON.parse(localStorage.getItem('sneakhub_cart')) || [];

const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');
const emptyCartMsg = document.getElementById('emptyCartMsg');
const toast = document.getElementById('toast');
const checkoutBtn = document.getElementById('checkoutBtn');

function saveCart() {
    localStorage.setItem('sneakhub_cart', JSON.stringify(cart));
}

function renderCart() {
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
        cartItemsEl.appendChild(emptyCartMsg);
        emptyCartMsg.classList.remove('hidden');
    } else {
        emptyCartMsg.classList.add('hidden');

        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'flex items-center justify-between border-b pb-4';
            itemEl.innerHTML = `
                <div class="flex items-center gap-3">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain bg-gray-100 rounded-lg">
                    <div>
                        <p class="font-semibold">${item.name}</p>
                        <p class="text-red-600 font-semibold">$${item.price.toFixed(2)}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <button class="decrease-qty bg-gray-200 w-6 h-6 rounded hover:bg-gray-300" data-index="${index}">-</button>
                            <span class="px-2">${item.qty}</span>
                            <button class="increase-qty bg-gray-200 w-6 h-6 rounded hover:bg-gray-300" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>
                <button class="remove-item text-red-600 hover:text-red-800 font-bold text-lg" data-index="${index}">&times;</button>
            `;
            cartItemsEl.appendChild(itemEl);
        });
    }

    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountEl.textContent = totalCount;

    const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
    cartTotalEl.textContent = `$${totalPrice.toFixed(2)}`;

    saveCart();
}

// Add to Cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.dataset.name;
        const price = parseFloat(button.dataset.price);
        const image = button.dataset.image;

        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ name, price, image, qty: 1 });
        }

        renderCart();
        showToast(`${name} added to cart!`);

        // Bounce the cart icon
        const cartIcon = document.getElementById('cartIcon');
        cartIcon.classList.remove('cart-bounce');
        void cartIcon.offsetWidth;
        cartIcon.classList.add('cart-bounce');
    });
});

// Increase / Decrease / Remove
cartItemsEl.addEventListener('click', (e) => {
    const index = e.target.dataset.index;
    if (index === undefined) return;

    if (e.target.classList.contains('increase-qty')) {
        cart[index].qty += 1;
    }

    if (e.target.classList.contains('decrease-qty')) {
        cart[index].qty -= 1;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
    }

    if (e.target.classList.contains('remove-item')) {
        cart.splice(index, 1);
    }

    renderCart();
});

// Open / Close Cart Sidebar
function openCart() {
    cartSidebar.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
}

function closeCart() {
    cartSidebar.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
}

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// Toast Notification
let toastTimeout;
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100', 'show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('opacity-100', 'show');
        toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2000);
}

// Checkout
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    showToast('Order placed successfully! 🎉');
    cart = [];
    renderCart();
    closeCart();
});

// ================= WISHLIST HEART TOGGLE =================
document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const isLiked = btn.textContent.includes('❤️');
        btn.textContent = isLiked ? '🤍' : '❤️';
        btn.classList.add('cart-bounce');
        setTimeout(() => btn.classList.remove('cart-bounce'), 500);
        showToast(isLiked ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    });
});

// ================= CONTACT FORM =================
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent successfully! We will get back to you soon.');
    contactForm.reset();
});

// ================= NEWSLETTER FORM =================
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Subscribed successfully! 🎉');
    newsletterForm.reset();
});

// Initial Cart Render
renderCart();