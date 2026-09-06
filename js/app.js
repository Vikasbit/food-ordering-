/* ============================================================
   BigBites Main Application Logic & View Controller
   ============================================================ */

let cart = [];
let selectedPaymentMethod = "UPI - GPay / PhonePe";
let currentOrderTrackingId = null;

document.addEventListener("DOMContentLoaded", () => {
    loadFoodCatalog();
    initScrollObserver();
    initGoalSlider();
});

/* Scroll Observer for Right Vertical Navbar */
function initScrollObserver() {
    const sections = document.querySelectorAll("section[id]");
    const navItems = document.querySelectorAll(".vnav-item");

    window.addEventListener("scroll", () => {
        let currentSection = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                currentSection = section.getAttribute("id");
            }
        });

        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("data-section") === currentSection) {
                item.classList.add("active");
            }
        });
    });
}

/* Interactive Goal Tracker Kcal Slider */
function initGoalSlider() {
    const slider = document.getElementById("kcalRangeSlider");
    if (slider) {
        updateKcalSlider(slider.value);
    }
}

function updateKcalSlider(val) {
    const idealValEl = d
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
    }
    updateCartUI();
}

function selectPayment(method) {
    selectedPaymentMethod = method;
    alert(`Payment Gateway selected: ${method}`);
}

async function triggerSmartCombo(foodId) {
    try {
        const res = await fetch(`/api/ai/smart-combo?food_id=${foodId}`);
        const data = await res.json();
        if (data && data.drink) {
            console.log("Smart combo recommendation:", data);
        }
    } catch(e) {}
}

async function processPayment() {
    if (cart.length === 0) {
        alert("Your cart is empty! Please add dishes before checking out.");
        return;
    }

    const total = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    
    try {
        const res = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                items: cart,
                total_amount: total,
                payment_method: selectedPaymentMethod,
                delivery_address: "Connaught Place, New Delhi"
            })
        });

        const data = await res.json();
        currentOrderTrackingId = data.order_id;
        
        cart = [];
        updateCartUI();
        closeModal("cartModal");

        alert(` Order Confirmed! Order ID: ${data.order_id}. Opening Live Kitchen & Delivery Tracking...`);
        openModal("trackingModal");

    } catch (err) {
        alert("Payment processing error. Please try again.");
    }
}

