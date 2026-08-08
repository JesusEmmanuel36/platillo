"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { useEffect, useRef, useState } from "react";

import { db } from "@/lib/firebase";

const INPUT =
  "h-11 w-full rounded-lg border border-[var(--light-gray)] bg-[var(--background)] px-3.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-color)] placeholder:text-[var(--gray-color)]";

function opcionVacia() {
  return {
    title: "",
    type: "radio",
    required: false,
    maxSelectable: 1,
    choices: [{ name: "", price: "" }],
  };
}

function productoVacio(restaurantId) {
  return {
    name: "",
    category: "",
    description: "",
    image: "",
    price: "",
    priceType: "fixed",
    stock: true,
    options: [],
    restaurantId,
  };
}

async function uploadToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Falta configuración de Cloudinary.");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data?.error?.message || "No se pudo subir la imagen.");
  }

  return data.secure_url;
}

function Section({ eyebrow, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-[var(--light-gray)] bg-[var(--background)]">
      <div className="px-5 pt-5 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-[md] font-semibold tracking-tight text-[var(--foreground)]">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--gray-color)]">
            {description}
          </p>
        )}
      </div>

      <div className="px-5 pb-6 pt-5 sm:px-6">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[var(--foreground)]">
        {label}
      </span>

      {children}

      {hint && (
        <span className="mt-2 block text-xs leading-5 text-[var(--gray-color)]">
          {hint}
        </span>
      )}
    </label>
  );
}

function Switch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-lg bg-[var(--light-gray)] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[var(--gray-color)]">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[var(--accent-color)]" : "bg-[var(--half-gray)]"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function StockBadge({ stock }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
        stock
          ? "bg-[var(--green-color)] text-[var(--green-text-color)]"
          : "bg-[var(--red-color)] text-[var(--red-text-color)]"
      }`}
    >
      {stock ? "En stock" : "Sin stock"}
    </span>
  );
}

function ProductCard({ product, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full overflow-hidden rounded-xl border border-[var(--light-gray)] bg-[var(--background)] text-left transition hover:border-[var(--accent-color)]"
    >
      <div className="h-24 w-24 shrink-0 bg-[var(--light-gray)]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--gray-color)]">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">
            {product.name}
          </p>

          <p className="mt-1 text-xs text-[var(--gray-color)]">
            {product.category || "Sin categoría"}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-[var(--accent-color)]">
            {product.priceType === "dynamic"
              ? `Desde $${product.price}`
              : `$${product.price}`}
          </span>

          <StockBadge stock={product.stock} />
        </div>
      </div>
    </button>
  );
}

function ProductForm({ initial, categories, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const [uploading, setUploading] = useState(false);

  function setField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, opcionVacia()],
    }));
  }

  function removeOption(index) {
    setForm((current) => ({
      ...current,
      options: current.options.filter((_, i) => i !== index),
    }));
  }

  function setOptionField(index, field, value) {
    setForm((current) => {
      const options = [...current.options];

      options[index] = {
        ...options[index],
        [field]: value,
      };

      return {
        ...current,
        options,
      };
    });
  }

  function addChoice(optionIndex) {
    setForm((current) => {
      const options = [...current.options];

      options[optionIndex] = {
        ...options[optionIndex],
        choices: [
          ...(options[optionIndex].choices || []),
          {
            name: "",
            price: "",
          },
        ],
      };

      return {
        ...current,
        options,
      };
    });
  }

  function removeChoice(optionIndex, choiceIndex) {
    setForm((current) => {
      const options = [...current.options];

      options[optionIndex] = {
        ...options[optionIndex],
        choices: options[optionIndex].choices.filter(
          (_, i) => i !== choiceIndex,
        ),
      };

      return {
        ...current,
        options,
      };
    });
  }

  function setChoiceField(optionIndex, choiceIndex, field, value) {
    setForm((current) => {
      const options = [...current.options];

      const choices = [...options[optionIndex].choices];

      choices[choiceIndex] = {
        ...choices[choiceIndex],
        [field]: value,
      };

      options[optionIndex] = {
        ...options[optionIndex],
        choices,
      };

      return {
        ...current,
        options,
      };
    });
  }

  async function handleImage(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    try {
      setUploading(true);

      const url = await uploadToCloudinary(file);

      setField("image", url);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  const TYPES = [
    {
      label: "Elige uno",
      value: "radio",
    },
    {
      label: "Elige varios",
      value: "checkbox",
    },
    {
      label: "Agrega extras",
      value: "addable",
    },
    {
      label: "Texto",
      value: "text",
    },
  ];

  return (
    <div className="space-y-5">
      <Section
        eyebrow="Producto"
        title="Información básica"
        description="Datos principales que verá el cliente."
      >
        <Field label="Imagen">
          <div className="overflow-hidden rounded-lg bg-[var(--light-gray)]">
            <div className="h-48">
              {form.image ? (
                <img
                  src={form.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[var(--gray-color)]">
                  Sin imagen
                </div>
              )}
            </div>

            <div className="p-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
                id="product-image"
              />

              <label
                htmlFor="product-image"
                className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-[var(--accent-color)] text-sm font-medium text-white"
              >
                {uploading
                  ? "Subiendo..."
                  : form.image
                    ? "Cambiar imagen"
                    : "Añadir imagen"}
              </label>
            </div>
          </div>
        </Field>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Nombre">
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Ej. Tacos de arrachera"
              className={INPUT}
            />
          </Field>

          <Field label="Categoría">
            <input
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              list="categories"
              placeholder="Ej. Hamburguesas"
              className={INPUT}
            />

            <datalist id="categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Descripción">
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="min-h-28 w-full resize-y rounded-lg border border-[var(--light-gray)] bg-[var(--background)] px-3.5 py-3 text-sm outline-none focus:border-[var(--accent-color)]"
              placeholder="Describe el producto"
            />
          </Field>
        </div>
      </Section>

      <Section eyebrow="Precio" title="Configuración del precio">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              label: "Precio fijo",
              value: "fixed",
            },
            {
              label: "Precio dinámico",
              value: "dynamic",
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setField("priceType", item.value)}
              className={`h-11 rounded-lg text-sm font-medium transition ${
                form.priceType === item.value
                  ? "bg-[var(--accent-color)] text-white"
                  : "bg-[var(--light-gray)] text-[var(--foreground)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 max-w-sm">
          <Field label="Precio base">
            <input
              type="number"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="0"
              className={INPUT}
            />
          </Field>
        </div>
      </Section>

      <Section eyebrow="Inventario" title="Disponibilidad">
        <Switch
          checked={form.stock}
          onChange={(value) => setField("stock", value)}
          label="En stock"
          description={
            form.stock ? "Visible para clientes." : "Oculto del menú."
          }
        />
      </Section>

      <Section
        eyebrow="Personalización"
        title="Opciones del producto"
        description="Agrega tamaños, ingredientes, extras o campos personalizados."
      >
        {form.options.map((option, oi) => (
          <div
            key={oi}
            className="mb-4 rounded-xl border border-[var(--light-gray)] bg-[var(--light-gray)] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">Opción {oi + 1}</p>

              <button
                type="button"
                onClick={() => removeOption(oi)}
                className="text-sm font-medium text-[var(--accent-color)]"
              >
                Eliminar
              </button>
            </div>

            <Field label="Título">
              <input
                value={option.title}
                onChange={(e) => setOptionField(oi, "title", e.target.value)}
                placeholder="Ej. Tamaño"
                className={INPUT}
              />
            </Field>

            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Tipo</p>

              <div className="flex flex-wrap gap-2">
                {[
                  {
                    label: "Elige uno",
                    value: "radio",
                  },
                  {
                    label: "Elige varios",
                    value: "checkbox",
                  },
                  {
                    label: "Agrega extras",
                    value: "addable",
                  },
                  {
                    label: "Texto",
                    value: "text",
                  },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setOptionField(oi, "type", type.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium ${
                      option.type === type.value
                        ? "bg-[var(--accent-color)] text-white"
                        : "bg-[var(--background)]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {option.type !== "text" && (
              <>
                <div className="mt-4">
                  <Switch
                    checked={option.required}
                    onChange={(value) => setOptionField(oi, "required", value)}
                    label="Obligatorio"
                    description="El cliente debe elegir una opción."
                  />
                </div>

                {option.type !== "radio" && (
                  <div className="mt-4 max-w-xs">
                    <Field label="Máximo seleccionable">
                      <input
                        type="number"
                        value={option.maxSelectable}
                        onChange={(e) =>
                          setOptionField(
                            oi,
                            "maxSelectable",
                            Number(e.target.value) || 1,
                          )
                        }
                        className={INPUT}
                      />
                    </Field>
                  </div>
                )}

                <div className="mt-5">
                  <p className="mb-3 text-sm font-medium">Opciones</p>

                  <div className="space-y-3">
                    {(option.choices || []).map((choice, ci) => (
                      <div key={ci} className="flex gap-2">
                        <input
                          value={choice.name}
                          onChange={(e) =>
                            setChoiceField(oi, ci, "name", e.target.value)
                          }
                          placeholder="Nombre"
                          className={INPUT}
                        />

                        <input
                          value={choice.price}
                          onChange={(e) =>
                            setChoiceField(oi, ci, "price", e.target.value)
                          }
                          placeholder="$"
                          className="h-11 w-24 rounded-lg border border-[var(--light-gray)] bg-[var(--background)] px-3 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => removeChoice(oi, ci)}
                          className="h-11 w-11 rounded-lg bg-[var(--background)]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addChoice(oi)}
                    className="mt-4 h-10 w-full rounded-lg border border-dashed border-[var(--light-gray)] text-sm font-medium"
                  >
                    + Agregar opción
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="h-11 w-full rounded-lg border border-dashed border-[var(--light-gray)] text-sm font-medium text-[var(--foreground)]"
        >
          + Añadir grupo de opciones
        </button>
      </Section>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-11 flex-1 rounded-lg bg-[var(--light-gray)] text-sm font-medium"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => onSave(form)}
          className="h-11 flex-1 rounded-lg bg-[var(--accent-color)] text-sm font-medium text-white disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}

function ProductModal({ open, product, restaurantId, categories, onClose }) {
  const [editing, setEditing] = useState(!product);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setEditing(!product);
    }
  }, [open, product]);

  if (!open) return null;

  async function save(form) {
    if (!form.name.trim()) return;

    try {
      setLoading(true);

      const clean = {
        name: form.name.trim(),

        category: form.category.trim(),

        description: form.description.trim(),

        image: form.image,

        price: Number(form.price) || 0,

        priceType: form.priceType,

        stock: form.stock,

        options: form.options
          .filter((o) => o.title.trim())
          .map((o) => ({
            title: o.title,

            type: o.type,

            required: o.required,

            maxSelectable: o.maxSelectable,

            choices:
              o.type !== "text"
                ? o.choices.map((c) => ({
                    name: c.name,
                    price: Number(c.price) || 0,
                  }))
                : [],
          })),

        restaurantId,
      };

      if (product) {
        await updateDoc(doc(db, "products", product.id), clean);
      } else {
        await addDoc(collection(db, "products"), clean);
      }

      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!product) return;

    await deleteDoc(doc(db, "products", product.id));

    onClose();
  }

  const initial = product
    ? {
        ...productoVacio(restaurantId),
        ...product,
        price: String(product.price || ""),
      }
    : productoVacio(restaurantId);

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-[var(--background)] p-5 sm:mx-auto sm:max-w-3xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-lg bg-[var(--light-gray)]"
          >
            ×
          </button>
        </div>

        <ProductForm
          initial={initial}
          categories={categories}
          onSave={save}
          onCancel={onClose}
          loading={loading}
        />

        {product && !editing && (
          <button
            onClick={remove}
            className="mt-4 h-11 w-full rounded-lg bg-black text-sm font-medium text-white"
          >
            Eliminar producto
          </button>
        )}
      </div>
    </div>
  );
}


export default function ProductsPanel({ restaurantId }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("restaurantId", "==", restaurantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return unsubscribe;
  }, [restaurantId]);

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Productos
          </h1>
          <p className="text-sm text-[var(--gray-color)]">
            Administra tu catálogo.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setOpen(true);
          }}
          className="h-11 rounded-lg bg-[var(--accent-color)] px-5 text-sm font-medium text-white"
        >
          + Nuevo producto
        </button>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => {
              setSelectedProduct(product);
              setOpen(true);
            }}
          />
        ))}
      </div>


      <ProductModal
        open={open}
        product={selectedProduct}
        restaurantId={restaurantId}
        categories={categories}
        onClose={() => {
          setOpen(false);
          setSelectedProduct(null);
        }}
      />
    </div>
  );
}