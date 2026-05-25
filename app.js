const bikes = [];
const cart = new Set();

const bikeGrid = document.querySelector("#bikeGrid");
const cartList = document.querySelector("#cartList");
const cartEmpty = document.querySelector("#cartEmpty");
const searchInput = document.querySelector("#searchInput");
const brandFilter = document.querySelector("#brandFilter");
const certFilter = document.querySelector("#certFilter");
const summaryCount = document.querySelector("#summaryCount");
const summaryTotal = document.querySelector("#summaryTotal");
const clearCartButton = document.querySelector("#clearCartButton");
const offerForm = document.querySelector("#offerForm");
const dealerName = document.querySelector("#dealerName");
const companyName = document.querySelector("#companyName");
const phoneNumber = document.querySelector("#phoneNumber");
const offerPrice = document.querySelector("#offerPrice");
const offerNotes = document.querySelector("#offerNotes");
const sentPanel = document.querySelector("#sentPanel");
const sentTitle = document.querySelector("#sentTitle");
const sentMessage = document.querySelector("#sentMessage");
const submitOfferButton = document.querySelector("#submitOfferButton");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRinggit(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function getBikeKey(bike) {
  return String(bike.productId || bike.plate || `${bike.brand}-${bike.model}`);
}

function getBikeLink(bike) {
  const link = String(bike.link || "").trim();
  if (/^https?:\/\//i.test(link)) return link;
  return "";
}

async function loadInventory() {
  try {
    const response = await fetch("inventory.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Inventory file could not be loaded");

    const loadedBikes = await response.json();
    bikes.splice(0, bikes.length, ...loadedBikes);
  } catch (error) {
    bikeGrid.innerHTML = `
      <div class="empty-state">
        Inventory could not be loaded. Open this site on Vercel, or run the local preview server.
      </div>
    `;
    submitOfferButton.disabled = true;
    throw error;
  }
}

function populateFilters() {
  const brands = ["All brands", ...new Set(bikes.map((bike) => bike.brand).filter(Boolean).sort())];
  const certs = ["All certifications", ...new Set(bikes.map((bike) => bike.certification).filter(Boolean).sort())];

  brandFilter.innerHTML = brands.map((brand) => `<option value="${escapeHtml(brand)}">${escapeHtml(brand)}</option>`).join("");
  certFilter.innerHTML = certs.map((cert) => `<option value="${escapeHtml(cert)}">${escapeHtml(cert)}</option>`).join("");
}

function getVisibleBikes() {
  const query = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const cert = certFilter.value;

  return bikes.filter((bike) => {
    const searchText = `${bike.brand} ${bike.model} ${bike.plate} ${bike.shop}`.toLowerCase();
    const matchesSearch = !query || searchText.includes(query);
    const matchesBrand = brand === "All brands" || bike.brand === brand;
    const matchesCert = cert === "All certifications" || bike.certification === cert;
    return matchesSearch && matchesBrand && matchesCert;
  });
}

function renderBikes() {
  const visibleBikes = getVisibleBikes();

  if (visibleBikes.length === 0) {
    bikeGrid.innerHTML = `<div class="empty-state">No bikes match your filters.</div>`;
    return;
  }

  bikeGrid.innerHTML = visibleBikes.map((bike) => {
    const bikeKey = getBikeKey(bike);
    const selected = cart.has(bikeKey);
    const link = getBikeLink(bike);
    const detailValue = link
      ? `<a class="bike-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">View bike details</a>`
      : "Not available";

    return `
      <article class="bike-card ${selected ? "is-selected" : ""}">
        <div class="bike-title">
          <div>
            <strong>${escapeHtml(bike.brand)} ${escapeHtml(bike.model)}</strong>
            <span>${escapeHtml(bike.year)} / ${escapeHtml(bike.certification || "Uncertified")}</span>
          </div>
          <span class="plate">${escapeHtml(bike.plate)}</span>
        </div>
        <dl class="bike-meta">
          <div><dt>Mileage</dt><dd>${Number(bike.mileage || 0).toLocaleString()} km</dd></div>
          <div><dt>Shop</dt><dd>${escapeHtml(bike.shop)}</dd></div>
          <div><dt>Details</dt><dd>${detailValue}</dd></div>
          <div><dt>Stock</dt><dd>Available</dd></div>
        </dl>
        <div class="price-row">
          <span class="price">${formatRinggit(bike.price)}</span>
          <button class="add-button ${selected ? "is-selected" : ""}" type="button" data-bike-key="${escapeHtml(bikeKey)}">
            ${selected ? "Selected" : "Add"}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCart() {
  const selectedBikes = bikes.filter((bike) => cart.has(getBikeKey(bike)));
  const total = selectedBikes.reduce((sum, bike) => sum + Number(bike.price || 0), 0);

  cartEmpty.hidden = selectedBikes.length > 0;
  submitOfferButton.disabled = selectedBikes.length === 0;
  summaryCount.textContent = String(selectedBikes.length);
  summaryTotal.textContent = formatRinggit(total);

  if (selectedBikes.length <= 1) {
    offerPrice.disabled = true;
    offerNotes.disabled = true;
    offerPrice.value = "";
    offerNotes.value = "";
    offerPrice.placeholder = "Bulk pricing available for 2+ bikes only";
    submitOfferButton.textContent = "Submit single bike request";
  } else {
    offerPrice.disabled = false;
    offerNotes.disabled = false;
    offerPrice.placeholder = "Example: 18500";
    submitOfferButton.textContent = "Submit bulk offer";
  }

  cartList.innerHTML = selectedBikes.map((bike) => `
    <div class="cart-item">
      <div>
        <strong>${escapeHtml(bike.brand)} ${escapeHtml(bike.model)}</strong>
        <span>${escapeHtml(bike.plate)}</span>
      </div>
      <span class="cart-price">${formatRinggit(bike.price)}</span>
    </div>
  `).join("");
}

function render() {
  renderBikes();
  renderCart();
}

bikeGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-bike-key]");
  if (!button) return;

  const bikeKey = button.dataset.bikeKey;
  if (cart.has(bikeKey)) {
    cart.delete(bikeKey);
  } else {
    cart.add(bikeKey);
  }

  sentPanel.hidden = true;
  render();
});

searchInput.addEventListener("input", renderBikes);
brandFilter.addEventListener("input", renderBikes);
certFilter.addEventListener("input", renderBikes);

clearCartButton.addEventListener("click", () => {
  cart.clear();
  sentPanel.hidden = true;
  render();
});

offerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const selectedBikes = bikes.filter((bike) =>
    cart.has(getBikeKey(bike))
  );

  const listedTotal = selectedBikes.reduce(
    (sum, bike) => sum + Number(bike.price || 0),
    0
  );

  const numericOffer = Number(
    String(offerPrice.value).replace(/[^\d.]/g, "")
  );

  const payload = {
    dealerName: dealerName.value.trim(),
    companyName: companyName.value.trim(),
    phoneNumber: phoneNumber.value.trim(),
    offerPrice:
      selectedBikes.length > 1
        ? numericOffer || 0
        : "Single bike request",

    listedTotal,

    bikes: selectedBikes.map((bike) => ({
      plate: bike.plate,
      brand: bike.brand,
      model: bike.model,
      price: bike.price
    })),

    notes: offerNotes.value.trim() || "No notes"
  };

  try {

    submitOfferButton.disabled = true;
    submitOfferButton.textContent = "Submitting...";

    const response = await fetch("/api/submit-bike-request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Submission failed");
    }

    sentTitle.textContent = "Offer sent";
    sentMessage.textContent =
      "Your request has been sent to the pricing team.";

    sentPanel.hidden = false;

    cart.clear();
    offerForm.reset();
    render();

  } catch (error) {

    console.error(error);

    sentTitle.textContent = "Submission failed";
    sentMessage.textContent =
      "Unable to send request. Please try again.";

    sentPanel.hidden = false;

  } finally {

    submitOfferButton.disabled = false;

    submitOfferButton.textContent =
      cart.size > 1
        ? "Submit bulk offer"
        : "Submit single bike request";
  }
});

async function init() {
  await loadInventory();
  populateFilters();
  render();
}

init();
