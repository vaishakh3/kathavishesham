const state = {
  current: "works",
  content: { works: [], services: [], pricing: [] },
  editing: null,
  configured: false,
};

const labels = {
  works: "Portfolio reels",
  services: "Services",
  pricing: "Pricing",
};

const collectionDescriptions = {
  works: (item) => `${item.category || "reel"}${item.views ? ` · ${item.views}` : ""}`,
  services: (item) => item.description || "Service card",
  pricing: (item) => `${item.duration || "Duration"} · ${item.price || "Price"}`,
};

const $ = (selector) => document.querySelector(selector);
const loginPanel = $("[data-login-panel]");
const dashboard = $("[data-dashboard]");
const loginForm = $("[data-login-form]");
const loginMessage = $("[data-login-message]");
const statusCard = $("[data-status]");
const itemList = $("[data-item-list]");
const editForm = $("[data-edit-form]");

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const setStatus = (title, message = "", tone = "") => {
  statusCard.classList.toggle("is-warning", tone === "warning");
  statusCard.classList.toggle("is-error", tone === "error");
  statusCard.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.message || "Something went wrong.");
  return data;
};

const showDashboard = async () => {
  loginPanel.classList.add("is-hidden");
  dashboard.classList.remove("is-hidden");
  await loadContent();
};

const loadContent = async () => {
  try {
    setStatus("Loading content...", "Reading the Google Sheet.");
    const data = await requestJson("/api/admin/sheet");
    state.content = data.content;
    state.configured = data.configured;

    if (data.configured) {
      setStatus("Connected to Google Sheets", "Changes here will update the spreadsheet and website.");
    } else {
      setStatus(
        "Google Sheet is not connected yet",
        "The dashboard is showing default site data. Add the Google and Cloudinary env vars to enable saving.",
        "warning"
      );
    }

    renderList();
    startNewItem();
  } catch (error) {
    setStatus("Could not load admin content", error.message, "error");
  }
};

const activeTabs = () => {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === state.current);
  });
};

const itemPreviewImage = (item) => {
  if (state.current === "works" && item.image) {
    return `<img class="item-thumb" src="${escapeHtml(item.image)}" alt="" />`;
  }
  const label = state.current === "pricing" ? item.price || "₹" : item.icon || "KV";
  return `<div class="item-thumb" aria-hidden="true"></div>`;
};

const renderList = () => {
  activeTabs();
  $("[data-panel-title]").textContent = labels[state.current];
  const items = [...(state.content[state.current] || [])].sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0));

  if (!items.length) {
    itemList.innerHTML = `<div class="item-card"><div class="item-copy"><strong>No items yet</strong><span>Add the first one from the panel on the right.</span></div></div>`;
    return;
  }

  itemList.innerHTML = items
    .map(
      (item) => `
        <article class="item-card">
          ${itemPreviewImage(item)}
          <div class="item-copy">
            <strong>${escapeHtml(item.title || "Untitled")}</strong>
            <span>${escapeHtml(collectionDescriptions[state.current](item))}</span>
            <em>${item.active === false ? "Hidden" : "Visible"}</em>
          </div>
          <div class="item-actions">
            <button type="button" data-edit="${escapeHtml(item.id)}">Edit</button>
            <button class="danger-action" type="button" data-delete="${escapeHtml(item.id)}">Delete</button>
          </div>
        </article>
      `
    )
    .join("");
};

const setFormValue = (field, value) => {
  if (!field) return;
  if (field.type === "checkbox") {
    field.checked = value !== false;
  } else if (field.type !== "file") {
    field.value = value ?? "";
  }
};

const startNewItem = () => {
  state.editing = null;
  $("[data-form-kicker]").textContent = "New item";
  $("[data-form-title]").textContent = `Add ${labels[state.current].toLowerCase()}`;
  renderForm({});
};

const editItem = (id) => {
  const item = state.content[state.current].find((entry) => entry.id === id);
  if (!item) return;
  state.editing = id;
  $("[data-form-kicker]").textContent = "Editing";
  $("[data-form-title]").textContent = item.title || "Edit item";
  renderForm(item);
};

const renderForm = (item) => {
  const template = $(`#${state.current}-fields`);
  editForm.innerHTML = template.innerHTML;

  [...editForm.elements].forEach((field) => setFormValue(field, item[field.name]));
  if (editForm.elements.active) setFormValue(editForm.elements.active, item.active ?? true);
  if (editForm.elements.sort && !editForm.elements.sort.value) {
    editForm.elements.sort.value = String((state.content[state.current]?.length || 0) * 10 + 10);
  }

  const actions = document.createElement("div");
  actions.className = "form-actions";
  actions.innerHTML = `
    <button class="primary-action" type="submit">${state.editing ? "Save changes" : "Add item"}</button>
    <button type="button" data-cancel-edit>Clear form</button>
    <p class="form-message" data-form-message></p>
  `;
  editForm.append(actions);
};

const formToItem = () => {
  const item = {};
  [...editForm.elements].forEach((field) => {
    if (!field.name || field.type === "file") return;
    item[field.name] = field.type === "checkbox" ? field.checked : field.value.trim();
  });
  return item;
};

const uploadImage = async (file) => {
  const signature = await requestJson("/api/admin/cloudinary-signature", { method: "POST", body: "{}" });
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", signature.timestamp);
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const uploaded = await response.json();
  if (!response.ok) throw new Error(uploaded.error?.message || "Cloudinary upload failed.");
  return uploaded.secure_url;
};

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "Signing in...";
  const body = Object.fromEntries(new FormData(loginForm));

  try {
    await requestJson("/api/admin/session", { method: "POST", body: JSON.stringify(body) });
    loginMessage.textContent = "";
    await showDashboard();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

$("[data-logout]").addEventListener("click", async () => {
  await fetch("/api/admin/session", { method: "DELETE" });
  window.location.reload();
});

document.querySelectorAll("[data-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    state.current = button.dataset.tab;
    renderList();
    startNewItem();
  });
});

itemList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");

  if (editButton) editItem(editButton.dataset.edit);

  if (deleteButton) {
    const id = deleteButton.dataset.delete;
    const item = state.content[state.current].find((entry) => entry.id === id);
    if (!window.confirm(`Delete "${item?.title || "this item"}"?`)) return;

    try {
      await requestJson("/api/admin/sheet", {
        method: "DELETE",
        body: JSON.stringify({ collection: state.current, id }),
      });
      await loadContent();
    } catch (error) {
      setStatus("Delete failed", error.message, "error");
    }
  }
});

editForm.addEventListener("change", async (event) => {
  if (event.target.name !== "imageUpload" || !event.target.files?.[0]) return;
  const message = $("[data-form-message]");
  message.textContent = "Uploading image to Cloudinary...";

  try {
    const url = await uploadImage(event.target.files[0]);
    editForm.elements.image.value = url;
    message.textContent = "Image uploaded and ready to save.";
  } catch (error) {
    message.textContent = error.message;
  }
});

editForm.addEventListener("click", (event) => {
  if (event.target.closest("[data-cancel-edit]")) startNewItem();
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = $("[data-form-message]");
  message.textContent = "Saving...";
  const item = formToItem();

  if (state.current === "works" && !item.image) {
    message.textContent = "Upload a preview image before saving this reel.";
    return;
  }

  const method = state.editing ? "PUT" : "POST";
  const body = { collection: state.current, item };
  if (state.editing) body.id = state.editing;

  try {
    await requestJson("/api/admin/sheet", { method, body: JSON.stringify(body) });
    message.textContent = "Saved.";
    await loadContent();
  } catch (error) {
    message.textContent = error.message;
  }
});

(async () => {
  try {
    const session = await requestJson("/api/admin/session");
    if (session.signedIn) {
      await showDashboard();
    } else {
      loginPanel.classList.remove("is-hidden");
    }
  } catch {
    loginPanel.classList.remove("is-hidden");
  }
})();
