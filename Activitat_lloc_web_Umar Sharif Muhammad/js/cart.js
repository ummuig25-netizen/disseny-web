// MangaVerse Store - Sistema de Carret Resilient
console.log("MangaVerse Cart System Loaded");

// 1. Verificació de compatibilitat
function checkLocalStorage() {
    try {
        localStorage.setItem('mv_test', '1');
        localStorage.removeItem('mv_test');
        return true;
    } catch (e) {
        console.error("LocalStorage no disponible:", e);
        return false;
    }
}

const isStorageAvailable = checkLocalStorage();

// 2. Inicialització quan el DOM estigui llist
document.addEventListener('DOMContentLoaded', () => {
    if (!isStorageAvailable) {
        showToast("Error: El teu navegador no permet guardar dades (LocalStorage).");
    }
    
    updateCartCounter();
    setupEventListeners();
    
    // Si som a la pàgina de carret, renderitzem
    const cartContainer = document.getElementById('cart-items-container');
    if (cartContainer) {
        renderCartPage();
    }
});

// 3. Gestió de dades (Get/Save)
function getCart() {
    if (!isStorageAvailable) return [];
    const data = localStorage.getItem('mangaverse_cart');
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Error al llegir el carret:", e);
        return [];
    }
}

function saveCart(cart) {
    if (!isStorageAvailable) return;
    try {
        localStorage.setItem('mangaverse_cart', JSON.stringify(cart));
        updateCartCounter();
    } catch (e) {
        console.error("Error al guardar:", e);
    }
}

// 4. Interfície d'usuari (UI)
function updateCartCounter() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    const counters = document.querySelectorAll('.cart-count');
    
    counters.forEach(c => {
        c.textContent = count;
        c.style.display = count > 0 ? 'flex' : 'none';
    });
}

function setupEventListeners() {
    document.addEventListener('click', (e) => {
        // Filtres (mant Seguim amb delegació perquè funciona bé)
        const filterBtn = e.target.closest('[data-filter]');
        if (filterBtn) {
            const category = filterBtn.getAttribute('data-filter');
            filterProducts(category);
            
            document.querySelectorAll('[data-filter]').forEach(b => {
                b.style.background = 'var(--card-bg)';
                b.style.borderColor = 'rgba(255,255,255,0.1)';
            });
            filterBtn.style.background = 'var(--accent-primary)';
            filterBtn.style.borderColor = 'var(--accent-primary)';
        }
    });
}

// FUNCIO GLOBAL "A PROVA DE BALES"
window.compraProducte = function(btn) {
    try {
        const producte = {
            name: btn.getAttribute('data-name'),
            price: parseFloat(btn.getAttribute('data-price')) || 0,
            img: btn.getAttribute('data-img') || '',
            quantity: 1
        };
        
        console.log("Comprant:", producte);
        
        // Afegim al carret
        addToCart(producte);
        
        // Feedback visual i sonor (alert per debug)
        const textOriginal = btn.innerHTML;
        btn.innerHTML = "✓ AFEGIT!";
        btn.classList.add('btn-success');
        
        // Alerta per confirmar que la funció s'està executant
        alert("Producte afegit: " + producte.name + "\nJa pots consultar el teu carret!");
        
        setTimeout(() => {
            btn.innerHTML = textOriginal;
            btn.classList.remove('btn-success');
        }, 1500);

    } catch (err) {
        console.error("Error en la compra:", err);
        alert("Ho sentim, hi ha hagut un error en la compra.");
    }
};

function addToCart(newProduct) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.name === newProduct.name);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push(newProduct);
    }
    
    saveCart(cart);
}

function filterProducts(category) {
    const products = document.querySelectorAll('.product-card');
    products.forEach(p => {
        const cat = p.getAttribute('data-category');
        if (category === 'all' || cat === category) {
            p.style.display = 'flex';
            p.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
            p.style.display = 'none';
        }
    });
}

function renderCartPage() {
    const container = document.getElementById('cart-items-container');
    const totalDisplay = document.getElementById('cart-total-price');
    if (!container || !totalDisplay) return;

    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px;">
                <p style="color: var(--text-secondary); margin-bottom: 25px;">El teu carret encara està buit.</p>
                <a href="cataleg.html" style="padding: 12px 30px; background: var(--accent-primary); color: white; border-radius: 12px; text-decoration: none; font-weight: 600; display: inline-block;">VEURE CATÀLEG</a>
            </div>
        `;
        totalDisplay.textContent = "0,00 €";
        return;
    }

    let total = 0;
    container.innerHTML = '';
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.style.animation = 'fadeIn 0.4s ease forwards';
        row.innerHTML = `
            <img src="${item.img}" alt="${item.name}" style="width: 70px; height: 100px; object-fit: cover; border-radius: 8px;">
            <div style="flex-grow: 1;">
                <h3 style="font-size: 1.1rem; margin-bottom: 5px;">${item.name}</h3>
                <p style="color: var(--text-secondary); font-size: 0.85rem;">Preu: ${item.price.toFixed(2)} €</p>
            </div>
            <div style="text-align: center; min-width: 100px;">
                <span style="display: block; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 5px;">Quantitat</span>
                <span style="font-weight: 700;">${item.quantity}</span>
            </div>
            <div style="text-align: right; min-width: 120px;">
                <p style="font-weight: 700; color: var(--accent-secondary); font-size: 1.2rem; margin-bottom: 5px;">${itemTotal.toFixed(2)} €</p>
                <button onclick="removeFromCart(${index})" style="background: transparent; color: var(--accent-primary); border: none; cursor: pointer; font-size: 0.75rem; font-weight: 600; padding: 0;">ELIMINAR</button>
            </div>
        `;
        container.appendChild(row);
    });
    
    totalDisplay.textContent = `${total.toFixed(2)} €`;
}

// Global functions per onclick
window.removeFromCart = function(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCartPage();
};

function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>⚡</span> <span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        setTimeout(() => t.remove(), 500);
    }, 2500);
}
