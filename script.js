// Supabase — paste your project URL and anon (public) key here.
// Find them in Supabase: Project Settings → API. Run supabase.sql once first.
const SUPABASE_URL = "https://mxbtxogjmvqwvrpwbijn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14YnR4b2dqbXZxd3ZycHdiaWpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzYwMjIsImV4cCI6MjEwNTU1MjAyMn0.903jBBz0qJ0deVj4RWtM6H7a0jf_LzJfXGxyNy0H0Xs";

// Product data — edit titles, prices (numbers, in Rs.) and images here.
// Friend listings have a `name` (used in the prank popup and to count orders) and their own `perks`.
const products = [
  { name: "hanash", hot: true, title: "🔥 HOT SELLING 🔥 hanash — Buy 1 Get 1 FREE", price: 899, oldPrice: 34999, loc: "Western", img: "images/hanash.png",
    perks: ["🔥 #1 Best Seller this week", "⚡ Selling fast — only 2 left in stock!", "🎁 Buy 1 Get 1 FREE (limited time)", "⚠️ Seller not responsible for chaos"] },
  { name: "Chenuk", title: "Chenuk Pro Max 2026 — Original, Slightly Used, No Box", price: 499, oldPrice: 49900, loc: "Western", img: "images/chenuk.png",
    perks: ["🔋 Battery: needs a snack every 2 hours", "🤓 Built-in glasses, free of charge", "📶 Replies to WhatsApp: sometimes", "❌ No warranty, no returns"] },
  { name: "Dilon", title: "Dilon Ultra — Genuine Model, Comes With Free Excuses", price: 999, oldPrice: 25000, loc: "Western", img: "images/dilon.png",
    perks: ["⏰ Always 10 minutes late (feature, not bug)", "🍛 Runs on rice & curry", "🔊 Loud speaker built in", "↩️ 7 Days Return — seller will NOT accept"] },
  { name: "Febian", title: "Febian Only — Single Unit, Limited Stock, Rare Edition", price: 250, oldPrice: 15000, loc: "Western", img: "images/febian only.png",
    perks: ["💤 Sleep mode activates in class", "🎮 Pre-installed with games", "📦 Ships in school uniform", "🛡️ Warranty: 0 days"] },
  { name: "Nibodh", title: "Nibodh Lite — Budget Edition, Great Value for Money", price: 5999, oldPrice: 9999, loc: "Western", img: "images/nibodh.png",
    perks: ["🧠 Knows all the answers (after the exam)", "🍪 Accepts payment in biscuits", "😂 Laugh track included", "🚚 Free delivery — walks to you"] },
  { name: "Ragith", title: "Ragith Plus — Brand New Condition, Never Did Homework", price: 350, oldPrice: 20000, loc: "Western", img: "images/ragith.png",
    perks: ["📚 Homework module not installed", "⚡ Fast charging: 1 samosa = full power", "🗣️ Voice assistant: talks non-stop", "❌ Non-refundable"] },
  { name: "Diyon", title: "Diyon Mini — Clearance Sale, Comes With Free Birds 🐦", price: 20, oldPrice: 5000, loc: "Western", img: "images/diyon.jpg",
    perks: ["🐦 Free flying birds included (dizzy mode)", "😴 Always in low-power mode", "📦 Cheapest item in the store", "❌ No returns, seriously"] },
  { name: "Nibodh & Dilon", title: "COMBO DEAL 🔥 Nibodh + Dilon — Buy 1 Get 1 FREE", price: 599, oldPrice: 34999, loc: "Western", img: "images/combo nibodh and dilon.png",
    perks: ["👯 Cannot be separated, sold as a pair", "🔊 Double the noise", "🎁 Free tempered glass (not really)", "⚠️ Seller not responsible for chaos"] },
  { name: "the Squad", title: "MEGA COMBO PACK 🎉 Full Squad Bundle — 9.9 Mega Deals", price: 999, oldPrice: 99999, loc: "Western", img: "images/combo pack.jpg",
    perks: ["📦 Whole gang in one box", "📸 Poses for every photo", "🍕 Warning: will eat all your food", "🚚 Free island-wide delivery"] },
  { name: "Didula", title: "Didula Max — Latest Model, Fresh Stock, Hurry Up!", price: 150, oldPrice: 12000, loc: "Western", img: "images/didula.png",
    perks: ["📱 Screen time: 12 hours a day", "🍗 Powered by fried chicken", "😎 Comes with free attitude", "❌ No refunds after opening the box"] },
  { name: "Siddharth", title: "Siddharth Max — Latest Model, Fresh Stock, Hurry Up!", price: 4500, oldPrice: 12000, loc: "Western", img: "images/sid.png",
    perks: ["📱 Screen time: 12 hours a day", "🍗 Powered by fried chicken", "😎 Comes with free attitude", "❌ No refunds after opening the box"] },
  { name: "Imadh", title: "Imadh Lareef — Limited Stock Edition", price: 4500, oldPrice: 12000, loc: "Western", img: "images/imadh.png",
    perks: ["📱 Screen time: 12 hours a day", "🍗 Powered by fried chicken", "😎 Comes with free attitude", "❌ No refunds after opening the box"] },
  { name: "Shakeel", title: "Shakeel Bing Chun Edition — Jenna Ortega's BF", price: 4500, oldPrice: 12000, loc: "Western", img: "images/shakeel.png",
    perks: ["📱 Screen time: 12 hours a day", "🍗 Powered by fried chicken", "😎 Comes with free attitude", "❌ No refunds after opening the box"] },
];

const $ = id => document.getElementById(id);
const fmt = n => "Rs. " + n.toLocaleString("en-US");
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));
const defaultPerks = ["✅ 100% Original Device", "🚚 Free Delivery Island-wide", "🛡️ 6 Months Warranty", "↩️ 7 Days Easy Return"];
const friends = products.filter(p => p.name);

let query = "iphone";
let sortBy = "best";
let cartCount = 0;
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
    const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    const sold = soldCount(p);
    const rs = reviewsFor(p);
    return `
      <article class="card" data-id="${i}">
        <div class="thumb">
          <img src="${encodeURI(p.img)}" alt="${p.title}" loading="lazy">
          ${off ? `<span class="off-tag">-${off}%</span>` : ""}
          ${p.hot ? `<span class="hot-tag">🔥 HOT SELLING</span>` : ""}
        </div>
        <div class="info">
          <h4>${p.title}</h4>
          <div class="price">${fmt(p.price)}</div>
          ${off ? `<div class="discount"><s>${fmt(p.oldPrice)}</s> ${off}% Off</div>` : ""}
          <div class="meta">
            <span>${sold ? sold + ' sold <span class="sep">|</span> ' : ""}${rs.length
              ? `<span class="stars">${stars(avgRating(rs))}</span><span class="rc">(${rs.length})</span>`
              : `<span class="rc">No ratings</span>`}</span>
            <span class="loc">${p.loc}</span>
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
  $("pdPerks").innerHTML = (current.perks || defaultPerks).map(t => `<li>${t}</li>`).join("");
  $("pdImage").alt = current.title;
  $("pdTitle").textContent = current.title;
  $("reviewForm").reset();
  setRvRating(0);
  $("rvError").textContent = "";
  renderProductRating();
  $("pdPrice").textContent = fmt(current.price);
  $("pdOld").innerHTML = current.oldPrice
    ? `<s>${fmt(current.oldPrice)}</s> -${Math.round((1 - current.price / current.oldPrice) * 100)}%` : "";
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

function openCheckout() {
  $("coImage").src = encodeURI(current.img);
  $("coTitle").textContent = current.title;
  $("coQty").textContent = `${fmt(current.price)} × ${qty}`;
  $("coTotal").textContent = fmt(current.price * qty);
  $("coError").textContent = "";
  $("productModal").classList.remove("show");
  $("checkoutModal").classList.add("show");
  $("coName").focus();
}

async function placeOrder(e) {
  e.preventDefault();
  const name = $("coName").value.trim();
  if (!name) { $("coError").textContent = "Please enter your name."; return; }
  if (!supabaseReady) { $("coError").textContent = "Orders aren't connected yet — add your Supabase URL and key in script.js."; return; }

  $("coPlace").disabled = true;
  $("coPlace").textContent = "Placing order…";
  try {
    await saveOrder({ buyer_name: name, product_name: current.name, product_title: current.title, qty, total: current.price * qty });
    realOrders[current.name] = (realOrders[current.name] || 0) + 1;
    render();
    $("checkoutForm").reset();
    prank();
  } catch (err) {
    console.error("Order failed:", err);
    $("coError").textContent = "Couldn't place the order. Please try again.";
  } finally {
    $("coPlace").disabled = false;
    $("coPlace").textContent = "Place Order";
  }
}

// Shows the friend they tried to buy (or a random friend if they clicked the cart)
function prank() {
  const f = current && current.name ? current : friends[Math.floor(Math.random() * friends.length)];
  $("prankPhoto").src = encodeURI(f.img);
  $("prankTitle").textContent = current && current.name
    ? `YOU TRIED TO BUY ${f.name.toUpperCase()}? 😂`
    : `HAHA, YOU GOT PRANKED BY ${f.name.toUpperCase()}!`;
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
  cartCount += qty;
  $("cartCount").textContent = cartCount;
  $("cartCount").classList.add("bump");
  setTimeout(() => $("cartCount").classList.remove("bump"), 300);
  $("productModal").classList.remove("show");
  toast(`Added ${qty} to cart ✓`);
};

$("buyNow").onclick = openCheckout;
$("checkoutForm").addEventListener("submit", placeOrder);
$("closeCheckout").onclick = () => $("checkoutModal").classList.remove("show");
$("checkoutModal").addEventListener("click", e => {
  if (e.target.id === "checkoutModal") $("checkoutModal").classList.remove("show");
});
$("cartBtn").addEventListener("click", e => { e.preventDefault(); current = null; prank(); });

document.querySelector("[data-close]").onclick = () => $("productModal").classList.remove("show");
$("productModal").addEventListener("click", e => {
  if (e.target.id === "productModal") $("productModal").classList.remove("show");
});
$("closeModal").onclick = () => $("modal").classList.remove("show");

$("reviewForm").addEventListener("submit", postReview);
document.querySelectorAll("#rvStars button").forEach(b =>
  b.addEventListener("click", () => setRvRating(+b.dataset.v)));

render();
loadOrderCounts();
loadReviews();
