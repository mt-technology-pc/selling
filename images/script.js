// 👇 Put your friend's name here (their photo goes in images/friend.jpg)
const FRIEND_NAME = "Friend";

// Product data — edit titles, prices (numbers, in Rs.) and images here
const products = [
  { title: "Genuine iphone 8, iphone 7 & iphone 6s With Warranty", price: 29900, oldPrice: 39900, sold: 37, rating: 4.8, reviews: 9,  loc: "North Central", img: "images/iphone-8-gold.svg" },
  { title: "iPhone 7 32GB Phone only Best Cond A Grade Original",     price: 24000, sold: 7,  rating: 5.0, reviews: 1,  loc: "Western",       img: "images/iphone-7-rose.svg" },
  { title: "iPhone 7 ✅128GB Phone only Best Condition A Grade Original free tempered", price: 29000, sold: 0, rating: 5.0, reviews: 1, loc: "Western", img: "images/iphone-7-silver.svg" },
  { title: "Apple iPhone X ✅64GB Smartphone phone with box Free tempered", price: 54499, sold: 33, rating: 4.5, reviews: 8, loc: "Western", img: "images/iphone-x-silver.svg" },
  { title: "iPhone 11 64GB Used Phone Excellent Condition Black",     price: 74900, oldPrice: 82000, sold: 51, rating: 4.7, reviews: 14, loc: "Western", img: "images/iphone-11-black.svg" },
  { title: "iPhone 12 Pro 128GB Pacific Blue Used Phone with Box",    price: 129000, sold: 12, rating: 4.6, reviews: 4, loc: "Western",       img: "images/iphone-12pro-blue.svg" },
  { title: "iPhone 11 Pro 256GB Midnight Green Mega Deals 9.9",       price: 109500, oldPrice: 124500, sold: 20, rating: 4.4, reviews: 6, loc: "Central", img: "images/iphone-11pro-green.svg" },
  { title: "iPhone XR 64GB (PRODUCT)RED Special Edition Original",    price: 49999, sold: 18, rating: 4.3, reviews: 5,  loc: "Southern",      img: "images/iphone-xr-red.svg" },
  { title: "iPhone 13 128GB Pink Brand New Sealed Pack",              price: 184900, oldPrice: 199000, sold: 64, rating: 4.9, reviews: 22, loc: "Western", img: "images/iphone-13-pink.svg" },
  { title: "iPhone 14 Pro 256GB Deep Purple Dynamic Island",          price: 289000, sold: 9,  rating: 4.8, reviews: 3,  loc: "Western",       img: "images/iphone-14pro-purple.svg" }
];

const $ = id => document.getElementById(id);
const fmt = n => "Rs. " + n.toLocaleString("en-US");
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

let query = "iphone";
let sortBy = "best";
let cartCount = 0;
let current = null;
let qty = 1;

function render() {
  let list = products.filter(p => p.title.toLowerCase().includes(query.toLowerCase()));
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
          <img src="${p.img}" alt="${p.title}" loading="lazy">
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
  $("pdImage").src = current.img;
  $("pdImage").alt = current.title;
  $("pdTitle").textContent = current.title;
  $("pdRating").innerHTML = `<span class="stars">${stars(current.rating)}</span> ${current.rating} · ${current.reviews} Ratings · ${current.sold} sold`;
  $("pdPrice").textContent = fmt(current.price);
  $("pdOld").innerHTML = current.oldPrice
    ? `<s>${fmt(current.oldPrice)}</s> -${Math.round((1 - current.price / current.oldPrice) * 100)}%` : "";
  $("productModal").classList.add("show");
}

function prank() {
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
$("cartBtn").addEventListener("click", e => { e.preventDefault(); prank(); });

document.querySelector("[data-close]").onclick = () => $("productModal").classList.remove("show");
$("productModal").addEventListener("click", e => {
  if (e.target.id === "productModal") $("productModal").classList.remove("show");
});
$("closeModal").onclick = () => $("modal").classList.remove("show");

$("prankTitle").textContent = `HAHA ${FRIEND_NAME.toUpperCase()}, YOU GOT PRANKED!`;

render();
