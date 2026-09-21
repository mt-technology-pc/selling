// Admin panel — sign in with a Supabase user that is listed in the `admins` table (see admin.sql).
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "product-images";
const MAX_IMAGE_MB = 5;

const $ = id => document.getElementById(id);
const fmt = n => "Rs. " + Number(n || 0).toLocaleString("en-US");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const date = d => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const stars = r => "★".repeat(r) + "☆".repeat(5 - r);

let products = [];
let orders = [];
let reviews = [];
let editing = null; // product being edited, or null when adding

// --- Auth ---
function showLogin(message = "") {
  $("appView").hidden = true;
  $("loginView").hidden = false;
  $("loginError").textContent = message;
}

async function enter(session) {
  const { data: isAdmin, error } = await sb.rpc("is_admin");
  if (error || !isAdmin) {
    await sb.auth.signOut();
    showLogin(error ? "Couldn't check admin access. Did you run admin.sql?" : "This account isn't an admin.");
    return;
  }
  $("loginView").hidden = true;
  $("appView").hidden = false;
  $("whoami").textContent = session.user.email;
  loadAll();
}

$("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  if (!email || !password) { $("loginError").textContent = "Enter your email and password."; return; }

  $("loginBtn").disabled = true;
  $("loginBtn").textContent = "Signing in…";
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  $("loginBtn").disabled = false;
  $("loginBtn").textContent = "Sign in";
  if (error) { $("loginError").textContent = error.message; return; }
  $("loginPassword").value = "";
  enter(data.session);
});

$("logoutBtn").onclick = async () => {
  await sb.auth.signOut();
  showLogin();
};

// --- Data ---
async function loadAll() {
  const [p, o, r] = await Promise.all([
    sb.from("products").select("*").order("sort_order").order("id"),
    sb.from("orders").select("*").order("created_at", { ascending: false }).limit(1000),
    sb.from("reviews").select("*").order("created_at", { ascending: false }).limit(1000),
  ]);
  for (const res of [p, o, r]) if (res.error) { console.error(res.error); toast("Couldn't load: " + res.error.message); }
  products = p.data || [];
  orders = o.data || [];
  reviews = r.data || [];
  renderAll();
}

function renderAll() {
  renderStats();
  renderProducts();
  renderOrders();
  renderReviews();
}

function renderStats() {
  $("statProducts").textContent = products.length;
  $("statOrders").textContent = orders.length;
  $("statRevenue").textContent = fmt(orders.reduce((sum, o) => sum + o.total, 0));
  $("statReviews").textContent = reviews.length;
}

const ordersFor = name => orders.filter(o => o.product_name === name).length;
const ratingFor = name => {
  const rs = reviews.filter(r => r.product_name === name);
  return rs.length ? (rs.reduce((a, r) => a + r.rating, 0) / rs.length).toFixed(1) + " ★ (" + rs.length + ")" : "No ratings";
};

// Photos still served from the site's images/ folder instead of Supabase Storage
const isLocalImage = img => !bucketPath(img) && !/^https?:\/\//i.test(img || "");

function renderProducts() {
  const localCount = products.filter(p => isLocalImage(p.img)).length;
  $("migrateBtn").hidden = !localCount;
  $("migrateBtn").textContent = `⬆ Upload ${localCount} photo${localCount === 1 ? "" : "s"} to Storage`;

  $("productList").innerHTML = products.length ? products.map(p => `
    <li class="product-row${p.active ? "" : " inactive"}">
      <img src="${esc(encodeURI(p.img))}" alt="" loading="lazy">
      <div class="pr-info">
        <div class="pr-title">${esc(p.title)}</div>
        <div class="pr-meta">
          <span class="pr-name">${esc(p.name)}</span>
          <span>${fmt(p.price)}</span>
          <span>${ordersFor(p.name)} sold</span>
          <span>${ratingFor(p.name)}</span>
          <span>#${p.sort_order}</span>
        </div>
        <div class="pr-tags">
          ${p.hot ? `<span class="tag hot">🔥 Hot</span>` : ""}
          ${p.active ? "" : `<span class="tag">Hidden</span>`}
          ${isLocalImage(p.img) ? `<span class="tag local">Photo not in Storage</span>` : ""}
        </div>
      </div>
      <div class="pr-actions">
        <button class="btn ghost small" data-edit="${p.id}">Edit</button>
        <button class="btn danger small" data-delete="${p.id}">Delete</button>
      </div>
    </li>`).join("") : `<li class="empty">No products yet. Click “+ Add product”.</li>`;
}

function renderOrders() {
  $("orderRows").innerHTML = orders.length ? orders.map(o => `
    <tr>
      <td data-label="Date">${date(o.created_at)}</td>
      <td data-label="Buyer"><strong>${esc(o.buyer_name)}</strong></td>
      <td data-label="Product">${esc(o.product_title || o.product_name)}</td>
      <td data-label="Qty">${o.qty}</td>
      <td data-label="Total">${fmt(o.total)}</td>
      <td class="row-action"><button class="btn danger small" data-delete-order="${o.id}">Delete</button></td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty">No orders yet.</td></tr>`;
}

function renderReviews() {
  $("reviewList").innerHTML = reviews.length ? reviews.map(r => `
    <li class="review-row">
      <div class="rr-head">
        <span class="stars">${stars(r.rating)}</span>
        <strong>${esc(r.reviewer_name)}</strong>
        <span class="rr-product">on ${esc(r.product_name)}</span>
        <span class="rr-date">${date(r.created_at)}</span>
      </div>
      ${r.comment ? `<p>${esc(r.comment)}</p>` : ""}
      <button class="btn danger small" data-delete-review="${r.id}">Delete</button>
    </li>`).join("") : `<li class="empty">No reviews yet.</li>`;
}

// --- Tabs ---
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.toggle("active", x === t));
  document.querySelectorAll(".panel").forEach(p => { p.hidden = p.id !== "panel-" + t.dataset.tab; });
}));

// --- Product form ---
function openForm(p) {
  editing = p || null;
  $("productForm").reset();
  $("formTitle").textContent = p ? "Edit product" : "Add product";
  $("pfName").value = p?.name ?? "";
  $("pfName").readOnly = !!p;
  $("pfNameHint").textContent = p
    ? "Name can't be changed — orders and reviews are linked to it."
    : "Shown in the prank popup. Can't be changed later.";
  $("pfTitle").value = p?.title ?? "";
  $("pfPrice").value = p?.price ?? "";
  $("pfOld").value = p?.old_price ?? "";
  $("pfLoc").value = p?.loc ?? "Western";
  $("pfPerks").value = (p?.perks ?? []).join("\n");
  $("pfSort").value = p?.sort_order ?? (Math.max(0, ...products.map(x => x.sort_order)) + 10);
  $("pfHot").checked = !!p?.hot;
  $("pfActive").checked = p ? p.active : true;
  setPreview(p?.img ? encodeURI(p.img) : "");
  $("pfError").textContent = "";
  $("productModal").classList.add("show");
  (p ? $("pfTitle") : $("pfName")).focus();
}

function closeForm() {
  $("productModal").classList.remove("show");
  editing = null;
}

function setPreview(src) {
  $("pfPreview").hidden = !src;
  $("pfEmpty").hidden = !!src;
  if (src) $("pfPreview").src = src;
}

$("pfImage").addEventListener("change", () => {
  const file = $("pfImage").files[0];
  if (file) setPreview(URL.createObjectURL(file));
});

// Path inside our bucket for an image URL, or null if the image isn't stored there
function bucketPath(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const i = (url || "").indexOf(marker);
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
}

async function uploadImage(file, name) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "product";
  const path = `${Date.now()}-${slug}.${ext}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

$("productForm").addEventListener("submit", async e => {
  e.preventDefault();
  const err = msg => { $("pfError").textContent = msg; };
  const name = $("pfName").value.trim();
  const title = $("pfTitle").value.trim();
  const price = $("pfPrice").value === "" ? NaN : Number($("pfPrice").value);
  const oldPrice = $("pfOld").value === "" ? null : Number($("pfOld").value);
  const file = $("pfImage").files[0];

  if (!name) return err("Please enter a name.");
  if (!title) return err("Please enter a title.");
  if (!Number.isInteger(price) || price < 0) return err("Price must be a whole number.");
  if (oldPrice !== null && (!Number.isInteger(oldPrice) || oldPrice < 0)) return err("Old price must be a whole number.");
  if (!editing && !file) return err("Please choose a photo.");
  if (file && file.size > MAX_IMAGE_MB * 1024 * 1024) return err(`Photo must be under ${MAX_IMAGE_MB} MB.`);

  $("saveProduct").disabled = true;
  $("saveProduct").textContent = "Saving…";
  err("");
  try {
    const oldImg = editing?.img;
    const img = file ? await uploadImage(file, name) : oldImg;
    const row = {
      title, price, old_price: oldPrice, img,
      loc: $("pfLoc").value.trim() || "Western",
      perks: $("pfPerks").value.split("\n").map(s => s.trim()).filter(Boolean),
      sort_order: Number($("pfSort").value) || 0,
      hot: $("pfHot").checked,
      active: $("pfActive").checked,
    };
    const { error } = editing
      ? await sb.from("products").update(row).eq("id", editing.id)
      : await sb.from("products").insert({ ...row, name });
    if (error) throw error;

    // Replaced photo: remove the old file from Storage (local images/ files are left alone)
    if (file && oldImg && bucketPath(oldImg)) await sb.storage.from(BUCKET).remove([bucketPath(oldImg)]);

    toast(editing ? "Product updated ✓" : "Product added ✓");
    closeForm();
    loadAll();
  } catch (e2) {
    console.error(e2);
    err(e2.code === "23505" ? "A product with that name already exists." : "Couldn't save: " + e2.message);
  } finally {
    $("saveProduct").disabled = false;
    $("saveProduct").textContent = "Save";
  }
});

// Copies every photo from the images/ folder into Supabase Storage and points the product at it
async function uploadLocalPhotos() {
  const local = products.filter(p => isLocalImage(p.img));
  if (!local.length || !confirm(`Upload ${local.length} photo(s) to Supabase Storage?`)) return;

  const btn = $("migrateBtn");
  btn.disabled = true;
  const failed = [];
  for (const [i, p] of local.entries()) {
    btn.textContent = `Uploading ${i + 1}/${local.length}…`;
    try {
      const res = await fetch(encodeURI(p.img));
      if (!res.ok) throw new Error(`${p.img} not found (${res.status})`);
      const blob = await res.blob();
      const ext = p.img.split(".").pop();
      const url = await uploadImage(new File([blob], `photo.${ext}`, { type: blob.type || "image/png" }), p.name);
      const { error } = await sb.from("products").update({ img: url }).eq("id", p.id);
      if (error) throw error;
    } catch (err) {
      console.error(`Upload failed for ${p.name}:`, err);
      failed.push(p.name);
    }
  }
  btn.disabled = false;
  toast(failed.length
    ? `Uploaded ${local.length - failed.length}. Failed: ${failed.join(", ")} (see console)`
    : `All ${local.length} photos are now in Storage ✓`);
  loadAll();
}

$("migrateBtn").onclick = uploadLocalPhotos;
$("addProductBtn").onclick = () => openForm(null);
$("closeProduct").onclick = closeForm;
$("cancelProduct").onclick = closeForm;
$("productModal").addEventListener("click", e => { if (e.target.id === "productModal") closeForm(); });

// --- Row actions ---
document.addEventListener("click", async e => {
  const b = e.target.closest("button");
  if (!b) return;

  if (b.dataset.edit) openForm(products.find(p => p.id === +b.dataset.edit));

  if (b.dataset.delete) {
    const p = products.find(x => x.id === +b.dataset.delete);
    if (!confirm(`Delete “${p.title}”? Its orders and reviews are kept.`)) return;
    const { error } = await sb.from("products").delete().eq("id", p.id);
    if (error) return toast("Couldn't delete: " + error.message);
    if (bucketPath(p.img)) await sb.storage.from(BUCKET).remove([bucketPath(p.img)]);
    toast("Product deleted");
    loadAll();
  }

  if (b.dataset.deleteOrder) {
    if (!confirm("Delete this order?")) return;
    const { error } = await sb.from("orders").delete().eq("id", +b.dataset.deleteOrder);
    if (error) return toast("Couldn't delete: " + error.message);
    toast("Order deleted");
    loadAll();
  }

  if (b.dataset.deleteReview) {
    if (!confirm("Delete this review?")) return;
    const { error } = await sb.from("reviews").delete().eq("id", +b.dataset.deleteReview);
    if (error) return toast("Couldn't delete: " + error.message);
    toast("Review deleted");
    loadAll();
  }
});

function toast(msg) {
  $("toast").textContent = msg;
  $("toast").classList.add("show");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => $("toast").classList.remove("show"), 2500);
}

// --- Start ---
sb.auth.getSession().then(({ data: { session } }) => session ? enter(session) : showLogin());
