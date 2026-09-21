// SUPABASE_URL and SUPABASE_KEY come from config.js

// Products (friends) are loaded from the Supabase `products` table — manage them in admin.html.
let products = [];

const $ = id => document.getElementById(id);
const fmt = n => "Rs. " + n.toLocaleString("en-US");
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const defaultPerks = ["✅ 100% Original Device", "🚚 Free Delivery Island-wide", "🛡️ 6 Months Warranty", "↩️ 7 Days Easy Return"];

let query = "iphone";
let sortBy = "best";
let cart = loadCart();  // [{ name, qty }] — remembered in this browser
let checkoutItems = []; // [{ p, qty }] being checked out right now
let checkoutFromCart = false;
let current = null;
let qty = 1;
let realOrders = {}; // product name → number of real orders saved in Supabase
let reviews = [];    // all reviews from Supabase, newest first
let rvRating = 0;    // stars picked in the review form

// --- Supabase ---
const supabaseReady = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_KEY.includes("YOUR-ANON-KEY");
const sbHeaders = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

async function saveOrder(order) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: "POST", headers: { ...sbHeaders, Prefer: "return=minimal" }, body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(await res.text());
}

async function loadProducts() {
  if (!supabaseReady) { $("grid").innerHTML = `<p class="empty">Add your Supabase URL and key in script.js.</p>`; return; }
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&active=eq.true&order=sort_order.asc,id.asc`, { headers: sbHeaders });
    if (!res.ok) throw new Error(await res.text());
    products = (await res.json()).map(r => ({
      name: r.name, title: r.title, price: r.price, oldPrice: r.old_price,
      loc: r.loc, img: r.img, perks: r.perks, hot: r.hot,
    }));
    cart = cart.filter(c => products.some(p => p.name === c.name)); // drop products that no longer exist
    updateCartBadge();
    render();
  } catch (err) {
    console.error("Could not load products:", err);
    $("grid").innerHTML = `<p class="empty">Couldn't load products. Please refresh the page.</p>`;
  }
}

async function loadOrderCounts() {
  if (!supabaseReady) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/order_counts`, { method: "POST", headers: sbHeaders, body: "{}" });
    if (!res.ok) throw new Error(await res.text());
    realOrders = Object.fromEntries((await res.json()).map(r => [r.product_name, r.orders]));
    render();
  } catch (err) {
    console.error("Could not load order counts:", err);
  }
}

async function loadReviews() {
  if (!supabaseReady) return;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews?select=product_name,reviewer_name,rating,comment,created_at&order=created_at.desc&limit=1000`, { headers: sbHeaders });
    if (!res.ok) throw new Error(await res.text());
    reviews = await res.json();
    render();
    if (current && $("productModal").classList.contains("show")) renderProductRating();
  } catch (err) {
    console.error("Could not load reviews:", err);
  }
}

async function saveReview(review) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
    method: "POST", headers: { ...sbHeaders, Prefer: "return=representation" }, body: JSON.stringify(review),
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json())[0];
}

const soldCount = p => realOrders[p.name] || 0;
const reviewsFor = p => reviews.filter(r => r.product_name === p.name);
const avgRating = rs => rs.length ? rs.reduce((a, r) => a + r.rating, 0) / rs.length : 0;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// Only show a discount when the old price is actually higher
const discountOf = p => p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
const totalRealOrders = () => Object.values(realOrders).reduce((a, b) => a + b, 0);

function render() {
  // Friend listings also show up for "iphone" searches so they appear on the first page
  let list = products.filter(p =>
    (p.title + (p.name ? " iphone friends" : "")).toLowerCase().includes(query.toLowerCase()));
  if (sortBy === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sortBy === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (sortBy === "sold") list = [...list].sort((a, b) => soldCount(b) - soldCount(a));

  const total = totalRealOrders();
  $("resultsTitle").textContent = query || "All products";
  $("resultsCount").textContent = (query.toLowerCase() === "iphone"
    ? '48480 items found for "iphone"'
    : `${list.length} items found for "${query}"`) + (total ? ` · ${total} real orders` : "");

  $("grid").innerHTML = list.length ? list.map(p => {
    const i = products.indexOf(p);
    const off = discountOf(p);
    const sold = soldCount(p);
    const rs = reviewsFor(p);
    return `
      <article class="card" data-id="${i}">
        <div class="thumb">
          <img src="${encodeURI(p.img)}" alt="${esc(p.title)}" loading="lazy">
          ${off ? `<span class="off-tag">-${off}%</span>` : ""}
          ${p.hot ? `<span class="hot-tag">🔥 HOT SELLING</span>` : ""}
        </div>
        <div class="info">
          <h4>${esc(p.title)}</h4>
          <div class="price">${fmt(p.price)}</div>
          ${off ? `<div class="discount"><s>${fmt(p.oldPrice)}</s> ${off}% Off</div>` : ""}
          <div class="meta">
            <span>${sold ? sold + ' sold <span class="sep">|</span> ' : ""}${rs.length
              ? `<span class="stars">${stars(avgRating(rs))}</span><span class="rc">(${rs.length})</span>`
              : `<span class="rc">No ratings</span>`}</span>
            <span class="loc">${esc(p.loc)}</span>
          </div>
        </div>
      </article>`;
  }).join("") : `<p class="empty">No results for "${query}" 😢</p>`;
}

function openProduct(i) {
  current = products[i];
  qty = 1;
  $("qty").textContent = qty;
  $("pdImage").src = encodeURI(current.img);
  $("pdPerks").innerHTML = (current.perks || defaultPerks).map(t => `<li>${esc(t)}</li>`).join("");
  $("pdImage").alt = current.title;
  $("pdTitle").textContent = current.title;
  $("reviewForm").reset();
  setRvRating(0);
  $("rvError").textContent = "";
  renderProductRating();
  $("pdPrice").textContent = fmt(current.price);
  $("pdOld").innerHTML = discountOf(current)
    ? `<s>${fmt(current.oldPrice)}</s> -${discountOf(current)}%` : "";
  $("productModal").classList.add("show");
}

// Rating line, summary and review list inside the product popup
function renderProductRating() {
  const rs = reviewsFor(current);
  const avg = avgRating(rs);
  const sold = `${soldCount(current)} sold`;
  $("pdRating").innerHTML = rs.length
    ? `<span class="stars">${stars(avg)}</span> ${avg.toFixed(1)} · ${rs.length} Rating${rs.length === 1 ? "" : "s"} · ${sold}`
    : `No ratings yet · ${sold}`;

  $("rvSummary").innerHTML = rs.length
    ? `<span class="rv-avg">${avg.toFixed(1)}</span><span class="rv-out">/5</span>
       <div><div class="stars rv-big-stars">${stars(avg)}</div><div class="rv-total">${rs.length} rating${rs.length === 1 ? "" : "s"}</div></div>`
    : `<p class="rv-empty">No reviews yet — be the first to review!</p>`;

  $("rvList").innerHTML = rs.map(r => `
    <li class="rv-item">
      <div class="rv-head">
        <span class="stars">${stars(r.rating)}</span>
        <span class="rv-name">${esc(r.reviewer_name)}</span>
        <span class="rv-date">${new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
      </div>
      ${r.comment ? `<p class="rv-text">${esc(r.comment)}</p>` : ""}
    </li>`).join("");
}

function setRvRating(v) {
  rvRating = v;
  document.querySelectorAll("#rvStars button").forEach(b => {
    const on = +b.dataset.v <= v;
    b.classList.toggle("on", on);
    b.setAttribute("aria-checked", +b.dataset.v === v);
  });
}

async function postReview(e) {
  e.preventDefault();
  const name = $("rvName").value.trim();
  const comment = $("rvComment").value.trim();
  if (!rvRating) { $("rvError").textContent = "Please pick a star rating."; return; }
  if (!name) { $("rvError").textContent = "Please enter your name."; return; }
  if (!supabaseReady) { $("rvError").textContent = "Reviews aren't connected yet — add your Supabase URL and key in script.js."; return; }

  $("rvSubmit").disabled = true;
  $("rvSubmit").textContent = "Posting…";
  $("rvError").textContent = "";
  try {
    const saved = await saveReview({ product_name: current.name, reviewer_name: name, rating: rvRating, comment: comment || null });
    reviews.unshift(saved);
    $("reviewForm").reset();
    setRvRating(0);
    renderProductRating();
    render();
    toast("Thanks for your review ✓");
  } catch (err) {
    console.error("Review failed:", err);
    $("rvError").textContent = "Couldn't post your review. Please try again.";
  } finally {
    $("rvSubmit").disabled = false;
    $("rvSubmit").textContent = "Post Review";
  }
}

function openCheckout(items, fromCart) {
  checkoutItems = items;
  checkoutFromCart = fromCart;
  $("coItems").innerHTML = items.map(({ p, qty }) => `
    <li class="co-item">
      <img src="${encodeURI(p.img)}" alt="">
      <div>
        <p class="co-title">${esc(p.title)}</p>
        <p class="co-qty">${fmt(p.price)} × ${qty}</p>
      </div>
    </li>`).join("");
  $("coTotal").textContent = fmt(itemsTotal(items));
  $("coError").textContent = "";
  $("productModal").classList.remove("show");
  $("cartModal").classList.remove("show");
  $("checkoutModal").classList.add("show");
  $("coName").focus();
}

// --- Cart ---
function loadCart() {
  try { return JSON.parse(localStorage.getItem("cart")) || []; } catch { return []; }
}
function saveCart() {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {}
}
const itemsTotal = items => items.reduce((sum, { p, qty }) => sum + p.price * qty, 0);
const cartItems = () => cart.map(c => ({ p: products.find(p => p.name === c.name), qty: c.qty })).filter(c => c.p);

function updateCartBadge(bump) {
  $("cartCount").textContent = cart.reduce((n, c) => n + c.qty, 0);
  if (!bump) return;
  $("cartCount").classList.add("bump");
  setTimeout(() => $("cartCount").classList.remove("bump"), 300);
}

function addToCart(p, n) {
  const line = cart.find(c => c.name === p.name);
  if (line) line.qty = Math.min(5, line.qty + n);
  else cart.push({ name: p.name, qty: n });
  saveCart();
  updateCartBadge(true);
}

function renderCart() {
  const items = cartItems();
  $("cartList").innerHTML = items.length ? items.map(({ p, qty }, i) => `
    <li class="cart-item">
      <img src="${encodeURI(p.img)}" alt="">
      <div class="cart-info">
        <p class="co-title">${esc(p.title)}</p>
        <p class="cart-price">${fmt(p.price * qty)}</p>
        <div class="cart-qty">
          <button type="button" data-action="minus" data-i="${i}" aria-label="Less">−</button>
          <span>${qty}</span>
          <button type="button" data-action="plus" data-i="${i}" aria-label="More">+</button>
          <button type="button" class="cart-remove" data-action="remove" data-i="${i}">Remove</button>
        </div>
      </div>
    </li>`).join("")
    : `<li class="cart-empty">🛒 Your cart is empty</li>`;
  $("cartTotal").textContent = fmt(itemsTotal(items));
  $("cartTotalRow").hidden = !items.length;
  $("cartCheckout").hidden = !items.length;
}

function openCart() {
  renderCart();
  $("cartModal").classList.add("show");
}

async function placeOrder(e) {
  e.preventDefault();
  const name = $("coName").value.trim();
  if (!name) { $("coError").textContent = "Please enter your name."; return; }
  if (!supabaseReady) { $("coError").textContent = "Orders aren't connected yet — add your Supabase URL and key in script.js."; return; }

  $("coPlace").disabled = true;
  $("coPlace").textContent = "Placing order…";
  try {
    await saveOrder(checkoutItems.map(({ p, qty }) =>
      ({ buyer_name: name, product_name: p.name, product_title: p.title, qty, total: p.price * qty })));
    checkoutItems.forEach(({ p }) => { realOrders[p.name] = (realOrders[p.name] || 0) + 1; });
    if (checkoutFromCart) { cart = []; saveCart(); updateCartBadge(); }
    render();
    $("checkoutForm").reset();
    prank(checkoutItems);
  } catch (err) {
    console.error("Order failed:", err);
    $("coError").textContent = "Couldn't place the order. Please try again.";
  } finally {
    $("coPlace").disabled = false;
    $("coPlace").textContent = "Place Order";
  }
}

// Shows the friend they just "bought" after placing an order
function prank(items) {
  const f = items[0].p;
  const more = items.length > 1 ? ` + ${items.length - 1} MORE` : "";
  $("prankPhoto").src = encodeURI(f.img);
  $("prankTitle").textContent = `YOU TRIED TO BUY ${f.name.toUpperCase()}${more}? 😂`;
  $("productModal").classList.remove("show");
  $("checkoutModal").classList.remove("show");
  $("modal").classList.add("show");
}

function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 1800);
}

// Events
$("grid").addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (card) openProduct(+card.dataset.id);
});

$("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  query = $("searchInput").value.trim();
  render();
});

document.querySelectorAll(".suggestions a").forEach(a =>
  a.addEventListener("click", e => {
    e.preventDefault();
    $("searchInput").value = query = a.textContent;
    render();
  })
);

$("sortSelect").addEventListener("change", e => { sortBy = e.target.value; render(); });

$("qtyMinus").onclick = () => { qty = Math.max(1, qty - 1); $("qty").textContent = qty; };
$("qtyPlus").onclick  = () => { qty = Math.min(5, qty + 1); $("qty").textContent = qty; };

$("addCart").onclick = () => {
  addToCart(current, qty);
  $("productModal").classList.remove("show");
  toast(`Added ${qty} to cart ✓`);
};

$("buyNow").onclick = () => openCheckout([{ p: current, qty }], false);

$("cartList").addEventListener("click", e => {
  const b = e.target.closest("button[data-action]");
  if (!b) return;
  const line = cart[+b.dataset.i];
  if (b.dataset.action === "plus") line.qty = Math.min(5, line.qty + 1);
  if (b.dataset.action === "minus") line.qty = Math.max(1, line.qty - 1);
  if (b.dataset.action === "remove") cart.splice(+b.dataset.i, 1);
  saveCart();
  updateCartBadge();
  renderCart();
});
$("cartCheckout").onclick = () => openCheckout(cartItems(), true);
$("closeCart").onclick = () => $("cartModal").classList.remove("show");
$("cartModal").addEventListener("click", e => {
  if (e.target.id === "cartModal") $("cartModal").classList.remove("show");
});
$("checkoutForm").addEventListener("submit", placeOrder);
$("closeCheckout").onclick = () => $("checkoutModal").classList.remove("show");
$("checkoutModal").addEventListener("click", e => {
  if (e.target.id === "checkoutModal") $("checkoutModal").classList.remove("show");
});
$("cartBtn").addEventListener("click", e => { e.preventDefault(); openCart(); });

document.querySelector("[data-close]").onclick = () => $("productModal").classList.remove("show");
$("productModal").addEventListener("click", e => {
  if (e.target.id === "productModal") $("productModal").classList.remove("show");
});
$("closeModal").onclick = () => $("modal").classList.remove("show");

$("reviewForm").addEventListener("submit", postReview);
document.querySelectorAll("#rvStars button").forEach(b =>
  b.addEventListener("click", () => setRvRating(+b.dataset.v)));

updateCartBadge();
$("grid").innerHTML = `<p class="empty">Loading…</p>`;
loadProducts();
loadOrderCounts();
loadReviews();
