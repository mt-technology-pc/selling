// Product data — edit titles, prices (numbers, in Rs.) and images here.
// Friend listings have a `name` (used in the prank popup) and their own `perks`.
const products = [
  { name: "Chenuk", title: "Chenuk Pro Max 2026 — Original, Slightly Used, No Box", price: 499, oldPrice: 49900, sold: 0, rating: 2.1, reviews: 3, loc: "Western", img: "images/chenuk.png",
    perks: ["🔋 Battery: needs a snack every 2 hours", "🤓 Built-in glasses, free of charge", "📶 Replies to WhatsApp: sometimes", "❌ No warranty, no returns"] },
  { name: "Dilon", title: "Dilon Ultra — Genuine Model, Comes With Free Excuses", price: 999, oldPrice: 25000, sold: 1, rating: 3.4, reviews: 7, loc: "Western", img: "images/dilon.png",
    perks: ["⏰ Always 10 minutes late (feature, not bug)", "🍛 Runs on rice & curry", "🔊 Loud speaker built in", "↩️ 7 Days Return — seller will NOT accept"] },
  { name: "Febian", title: "Febian Only — Single Unit, Limited Stock, Rare Edition", price: 250, oldPrice: 15000, sold: 2, rating: 3.8, reviews: 5, loc: "Western", img: "images/febian only.png",
    perks: ["💤 Sleep mode activates in class", "🎮 Pre-installed with games", "📦 Ships in school uniform", "🛡️ Warranty: 0 days"] },
  { name: "Nibodh", title: "Nibodh Lite — Budget Edition, Great Value for Money", price: 5999, oldPrice: 9999, sold: 4, rating: 4.0, reviews: 11, loc: "Western", img: "images/nibodh.png",
    perks: ["🧠 Knows all the answers (after the exam)", "🍪 Accepts payment in biscuits", "😂 Laugh track included", "🚚 Free delivery — walks to you"] },
  { name: "Ragith", title: "Ragith Plus — Brand New Condition, Never Did Homework", price: 350, oldPrice: 20000, sold: 0, rating: 2.9, reviews: 4, loc: "Western", img: "images/ragith.png",
    perks: ["📚 Homework module not installed", "⚡ Fast charging: 1 samosa = full power", "🗣️ Voice assistant: talks non-stop", "❌ Non-refundable"] },
  { name: "Diyon", title: "Diyon Mini — Clearance Sale, Comes With Free Birds 🐦", price: 20, oldPrice: 5000, sold: 0, rating: 1.9, reviews: 2, loc: "Western", img: "images/diyon.jpg",
    perks: ["🐦 Free flying birds included (dizzy mode)", "😴 Always in low-power mode", "📦 Cheapest item in the store", "❌ No returns, seriously"] },
  { name: "Nibodh & Dilon", title: "COMBO DEAL 🔥 Nibodh + Dilon — Buy 1 Get 1 FREE", price: 599, oldPrice: 34999, sold: 12, rating: 4.2, reviews: 18, loc: "Western", img: "images/combo nibodh and dilon.png",
    perks: ["👯 Cannot be separated, sold as a pair", "🔊 Double the noise", "🎁 Free tempered glass (not really)", "⚠️ Seller not responsible for chaos"] },
  { name: "the Squad", title: "MEGA COMBO PACK 🎉 Full Squad Bundle — 9.9 Mega Deals", price: 999, oldPrice: 99999, sold: 33, rating: 4.6, reviews: 27, loc: "Western", img: "images/combo pack.jpg",
    perks: ["📦 Whole gang in one box", "📸 Poses for every photo", "🍕 Warning: will eat all your food", "🚚 Free island-wide delivery"] },
  { name: "hanash", title: "COMBO DEAL 🔥 hanash — Buy 1 Get 1 FREE", price: 899, oldPrice: 34999, sold: 12, rating: 4.2, reviews: 18, loc: "Western", img: "images/Screenshot 2026-09-21 at 11.49.40.png",
    perks: ["👯 Cannot be separated, sold as a pair", "🔊 Double the noise", "🎁 Free tempered glass (not really)", "⚠️ Seller not responsible for chaos"] },
  { name: "Didula", title: "Didula Max — Latest Model, Fresh Stock, Hurry Up!", price: 150, oldPrice: 12000, sold: 3, rating: 3.6, reviews: 6, loc: "Western", img: "images/didula.png",
    perks: ["📱 Screen time: 12 hours a day", "🍗 Powered by fried chicken", "😎 Comes with free attitude", "❌ No refunds after opening the box"] },
   { name: "Didula", title: "Didula Max — Latest Model, Fresh Stock, Hurry Up!", price: 150, oldPrice: 12000, sold: 3, rating: 3.6, reviews: 6, loc: "Western", img: "images/didula.png",
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

function render() {
  // Friend listings also show up for "iphone" searches so they appear on the first page
  let list = products.filter(p =>
    (p.title + (p.name ? " iphone friends" : "")).toLowerCase().includes(query.toLowerCase()));
  if (sortBy === "low") list = [...list].sort((a, b) => a.price - b.price);
  if (sortBy === "high") list = [...list].sort((a, b) => b.price - a.price);
  if (sortBy === "sold") list = [...list].sort((a, b) => b.sold - a.sold);

  $("resultsTitle").textContent = query || "All products";
  $("resultsCount").textContent = query.toLowerCase() === "iphone"
    ? '48480 items found for "iphone"'
    : `${list.length} items found for "${query}"`;

  $("grid").innerHTML = list.length ? list.map(p => {
    const i = products.indexOf(p);
    const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
    return `
      <article class="card" data-id="${i}">
        <div class="thumb">
          <img src="${encodeURI(p.img)}" alt="${p.title}" loading="lazy">
          ${off ? `<span class="off-tag">-${off}%</span>` : ""}
        </div>
        <div class="info">
          <h4>${p.title}</h4>
          <div class="price">${fmt(p.price)}</div>
          ${off ? `<div class="discount"><s>${fmt(p.oldPrice)}</s> ${off}% Off</div>` : ""}
          <div class="meta">
            <span>${p.sold ? p.sold + ' sold <span class="sep">|</span> ' : ""}<span class="stars">${stars(p.rating)}</span><span class="rc">(${p.reviews})</span></span>
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
  $("pdRating").innerHTML = `<span class="stars">${stars(current.rating)}</span> ${current.rating} · ${current.reviews} Ratings · ${current.sold} sold`;
  $("pdPrice").textContent = fmt(current.price);
  $("pdOld").innerHTML = current.oldPrice
    ? `<s>${fmt(current.oldPrice)}</s> -${Math.round((1 - current.price / current.oldPrice) * 100)}%` : "";
  $("productModal").classList.add("show");
}

// Shows the friend they tried to buy (or a random friend if they clicked an iPhone / the cart)
function prank() {
  const f = current && current.name ? current : friends[Math.floor(Math.random() * friends.length)];
  $("prankPhoto").src = encodeURI(f.img);
  $("prankTitle").textContent = current && current.name
    ? `YOU TRIED TO BUY ${f.name.toUpperCase()}? 😂`
    : `HAHA, YOU GOT PRANKED BY ${f.name.toUpperCase()}!`;
  $("productModal").classList.remove("show");
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

$("buyNow").onclick = prank;
$("cartBtn").addEventListener("click", e => { e.preventDefault(); current = null; prank(); });

document.querySelector("[data-close]").onclick = () => $("productModal").classList.remove("show");
$("productModal").addEventListener("click", e => {
  if (e.target.id === "productModal") $("productModal").classList.remove("show");
});
$("closeModal").onclick = () => $("modal").classList.remove("show");

render();
