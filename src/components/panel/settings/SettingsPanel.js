"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { auth, db } from "@/lib/firebase";

const DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const INPUT =
  "h-11 w-full rounded-lg border border-[var(--light-gray)] bg-[var(--background)] px-3.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-color)] placeholder:text-[var(--gray-color)]";

function emptySchedule() {
  return DAYS.map((dia) => ({
    dia,
    abierto: true,
    apertura: "09:00",
    cierre: "23:00",
  }));
}

function normalizeSchedule(value) {
  if (!Array.isArray(value)) return emptySchedule();

  return DAYS.map((dia) => {
    const saved = value.find((item) => item?.dia === dia);

    return {
      dia,
      abierto: saved?.abierto ?? true,
      apertura: saved?.apertura || "09:00",
      cierre: saved?.cierre || "23:00",
    };
  });
}

function isValidHex(value) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function toHex(value) {
  return Math.round(value).toString(16).padStart(2, "0");
}

function generateLightAccent(hex) {
  const { r, g, b } = hexToRgb(hex);
  const amount = 0.72;

  return `#${toHex(r + (255 - r) * amount)}${toHex(
    g + (255 - g) * amount,
  )}${toHex(b + (255 - b) * amount)}`;
}

function normalizeLocation(value) {
  if (!value) return null;

  const latitude = value.latitude ?? value.lat ?? value._lat;
  const longitude = value.longitude ?? value.lng ?? value._long;

  if (
    !Number.isFinite(Number(latitude)) ||
    !Number.isFinite(Number(longitude))
  ) {
    return null;
  }

  return {
    latitude: Number(latitude),
    longitude: Number(longitude),
  };
}

function getFirebaseUser() {
  return new Promise((resolve, reject) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    let unsubscribe = () => {};

    const timeout = window.setTimeout(() => {
      unsubscribe();
      reject(new Error("Tu sesión expiró. Inicia sesión nuevamente."));
    }, 5000);

    unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        window.clearTimeout(timeout);
        unsubscribe();

        if (!user) {
          reject(new Error("Tu sesión expiró. Inicia sesión nuevamente."));
          return;
        }

        resolve(user);
      },
      (error) => {
        window.clearTimeout(timeout);
        unsubscribe();
        reject(error);
      },
    );
  });
}

async function uploadToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Faltan NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
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

  if (!response.ok || !data?.secure_url) {
    throw new Error(data?.error?.message || "No se pudo subir la imagen.");
  }

  return data.secure_url;
}

/* -------------------------------------------------------------------------- */
/* UI                                                                         */
/* -------------------------------------------------------------------------- */

function Section({ id, eyebrow, title, description, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-xl bg-[var(--background)] shadow-[0_1px_2px_rgba(0,0,0,0.2)] "
    >
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">
         
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

      <div className="px-5 pb-6 sm:px-6">{children}</div>
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
    <div className="flex items-center justify-between gap-5 rounded-lg bg-[var(--light-gray)] px-4 py-4">
      <div className="min-w-0">
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

function ImageCard({
  kind,
  title,
  description,
  image,
  loading,
  inputRef,
  onSelect,
}) {
  const banner = kind === "banner";

  return (
    <div className="min-w-0">
      <div className="mb-2.5">
        <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>

        <p className="mt-0.5 text-xs text-[var(--gray-color)]">{description}</p>
      </div>

      <div className="h-auto overflow-hidden rounded-lg bg-[var(--light-gray)]">
        <div className="h-34 w-full">
          {image ? (
            <img
              src={image}
              alt={title}
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
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onSelect}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="h-10 w-full rounded-lg bg-[var(--accent-color)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading
              ? "Subiendo..."
              : image
                ? banner
                  ? "Cambiar banner"
                  : "Cambiar foto"
                : banner
                  ? "Añadir banner"
                  : "Añadir foto"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationModal({ open, location, address, onClose, onSave }) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setLatitude(location ? String(location.latitude) : "");
    setLongitude(location ? String(location.longitude) : "");
    setError("");
  }, [open, location]);

  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  const lat = Number(latitude);
  const lng = Number(longitude);

  const valid =
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Este navegador no permite obtener la ubicación.");
      return;
    }

    setLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(7));
        setLongitude(position.coords.longitude.toFixed(7));
        setLocating(false);
      },
      () => {
        setError("No se pudo obtener la ubicación. Revisa los permisos.");
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
      },
    );
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/40 sm:items-center sm:p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar ubicación"
      />

      <div className="relative w-full bg-[var(--background)] shadow-2xl sm:max-w-xl sm:rounded-xl">
        <div className="flex items-start justify-between gap-5 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">
              Ubicación
            </p>

            <h2 className="mt-1 text-xl font-semibold tracking-tight">
              Seleccionar coordenadas
            </h2>

            <p className="mt-1 text-sm text-[var(--gray-color)]">
              {address || "Dirección todavía no especificada"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--light-gray)] text-lg text-[var(--foreground)]"
          >
            ×
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={useCurrentLocation}
            disabled={locating}
            className="h-11 w-full rounded-lg bg-[var(--accent-color)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {locating ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
          </button>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Latitud">
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="25.6866"
                className={INPUT}
              />
            </Field>

            <Field label="Longitud">
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="-100.3161"
                className={INPUT}
              />
            </Field>
          </div>

          {valid && (
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-lg bg-[var(--light-gray)] px-4 py-3 text-center text-sm font-medium text-[var(--foreground)]"
            >
              Ver ubicación en Google Maps
            </a>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-[var(--red-color)] px-4 py-3 text-sm font-medium text-[var(--red-text-color)]">
              {error}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-lg bg-[var(--light-gray)] px-4 text-sm font-medium text-[var(--foreground)]"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={!valid}
              onClick={() =>
                onSave({
                  latitude: lat,
                  longitude: lng,
                })
              }
              className="h-11 rounded-lg bg-[var(--foreground)] px-4 text-sm font-medium text-white disabled:opacity-50"
            >
              Guardar ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPanel({
  restaurantId,
  restaurantName: initialName,
}) {
  const bannerInputRef = useRef(null);
  const pfpInputRef = useRef(null);

  const [restaurant, setRestaurant] = useState(null);

  const [restaurantName, setRestaurantName] = useState(
    initialName || "Mi restaurante",
  );

  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [phone, setPhone] = useState("");

  const [isOpen, setIsOpen] = useState(true);
  const [alwaysOpen, setAlwaysOpen] = useState(false);
  const [schedule, setSchedule] = useState(emptySchedule());

  const [cash, setCash] = useState(true);
  const [card, setCard] = useState(true);
  const [transferEnabled, setTransferEnabled] = useState(false);
  const [transferBank, setTransferBank] = useState("");
  const [transferClabe, setTransferClabe] = useState("");
  const [transferHolder, setTransferHolder] = useState("");

  const [banner, setBanner] = useState("");
  const [pfp, setPfp] = useState("");

  const [address, setAddress] = useState("");
  const [location, setLocation] = useState(null);

  const [accentColor, setAccentColor] = useState("#e83906");
  const [hexInput, setHexInput] = useState("#e83906");

  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryPrice, setDeliveryPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPfp, setUploadingPfp] = useState(false);

  const [connectingWhatsapp, setConnectingWhatsapp] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const whatsapp = restaurant?.whatsapp || {};

  const whatsappConnected =
    whatsapp.enabled === true && Boolean(whatsapp.phoneNumberId);

  const whatsappMode =
    whatsapp.mode === "auto_reply"
      ? "Autorrespuesta con menú"
      : whatsapp.mode === "ai"
        ? "Chatbot con IA"
        : "Sin configurar";

  function showToast(message, tone = "success") {
    setToast({ message, tone });

    window.setTimeout(() => {
      setToast(null);
    }, 4200);
  }

  useEffect(() => {
    if (!restaurantId) {
      setLoadError("No se encontró el restaurante.");
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "restaurants", restaurantId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setLoadError("El restaurante no existe.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        setRestaurant({
          id: snapshot.id,
          ...data,
        });

        setRestaurantName(
          data.name || data.nombre || initialName || "Mi restaurante",
        );

        setInstagram(data.instagram || "");
        setFacebook(data.facebook || "");
        setPhone(data.phone || "");

        setIsOpen(data.isOpen ?? true);
        setAlwaysOpen(data.alwaysOpen ?? false);

        setSchedule(normalizeSchedule(data.horarios));

        setCash(data.paymentMethods?.cash ?? true);
        setCard(data.paymentMethods?.card ?? true);

        setTransferEnabled(data.paymentMethods?.transfer?.enabled ?? false);

        setTransferBank(data.paymentMethods?.transfer?.bank || "");

        setTransferClabe(data.paymentMethods?.transfer?.clabe || "");

        setTransferHolder(data.paymentMethods?.transfer?.holder || "");

        setBanner(data.banner || "");
        setPfp(data.pfp || "");

        setAddress(data.address || "");
        setLocation(normalizeLocation(data.location));

        const color = isValidHex(data.accent_color)
          ? data.accent_color
          : "#e83906";

        setAccentColor(color);
        setHexInput(color);

        setDeliveryEnabled(data.delivery_enabled ?? false);

        setDeliveryPrice(String(data.delivery_price ?? ""));

        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoadError("No se pudo cargar la configuración.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [restaurantId, initialName]);

  function updateSchedule(index, field, value) {
    setSchedule((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function handleHex(value) {
    setHexInput(value);

    const formatted = value.startsWith("#") ? value : `#${value}`;

    if (isValidHex(formatted)) {
      setAccentColor(formatted);
      setHexInput(formatted);
    }
  }

  async function handleImage(kind, event) {
    const file = event.target.files?.[0];

    if (!file) return;

    event.target.value = "";

    if (!file.type.startsWith("image/")) {
      showToast("Selecciona una imagen válida.", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen no puede pesar más de 10 MB.", "error");
      return;
    }

    const setUploading =
      kind === "banner" ? setUploadingBanner : setUploadingPfp;

    setUploading(true);

    try {
      const url = await uploadToCloudinary(file);

      await updateDoc(doc(db, "restaurants", restaurantId), {
        [kind]: url,
      });

      if (kind === "banner") {
        setBanner(url);
      } else {
        setPfp(url);
      }

      showToast("Imagen actualizada correctamente.");
    } catch (error) {
      console.error(error);

      showToast(error.message || "No se pudo subir la imagen.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function connectWhatsapp() {
    const popup = window.open("", "_blank");

    try {
      setConnectingWhatsapp(true);

      const user = await getFirebaseUser();
      const idToken = await user.getIdToken();

      const response = await fetch("/api/whatsapp/connect-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.connectUrl) {
        throw new Error(data?.error || "No se pudo generar el enlace.");
      }

      try {
        await navigator.clipboard.writeText(data.connectUrl);
      } catch {}

      if (popup) {
        popup.location.href = data.connectUrl;
      } else {
        window.location.href = data.connectUrl;
      }

      showToast("Enlace de WhatsApp generado y copiado.");
    } catch (error) {
      popup?.close();

      console.error(error);

      showToast(error.message || "No se pudo conectar WhatsApp.", "error");
    } finally {
      setConnectingWhatsapp(false);
    }
  }

  async function save() {
    if (saving) return;

    if (!isValidHex(accentColor)) {
      showToast("El color debe usar el formato #RRGGBB.", "error");
      return;
    }

    const parsedDeliveryPrice = Number(deliveryPrice);

    if (
      deliveryEnabled &&
      (!Number.isFinite(parsedDeliveryPrice) || parsedDeliveryPrice < 0)
    ) {
      showToast("Escribe un precio de envío válido.", "error");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(doc(db, "restaurants", restaurantId), {
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        phone: phone.trim(),
        address: address.trim(),
        location,

        isOpen,
        alwaysOpen,
        horarios: schedule,

        paymentMethods: {
          cash,
          card,
          transfer: {
            enabled: transferEnabled,
            bank: transferBank.trim(),
            clabe: transferClabe.trim(),
            holder: transferHolder.trim(),
          },
        },

        accent_color: accentColor,
        light_accent: generateLightAccent(accentColor),

        delivery_enabled: deliveryEnabled,
        delivery_price: deliveryEnabled ? parsedDeliveryPrice || 0 : 0,
      });

      showToast("Los cambios se guardaron correctamente.");
    } catch (error) {
      console.error(error);

      showToast("No se pudo guardar la configuración.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-56 animate-pulse rounded-xl bg-[var(--light-gray)]"
          />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg bg-[var(--red-color)] p-4 text-sm font-medium text-[var(--red-text-color)]">
        {loadError}
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto w-full max-w-7xl space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-5 border-b border-[var(--light-gray)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-color)]">
            Administración
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Configuración
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gray-color)]">
            Personaliza el menú, los horarios, los pagos y la operación de{" "}
            {restaurantName}.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="h-11 rounded-lg bg-[var(--accent-color)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </header>

      <div className="space-y-5 ">
        {/* APARIENCIA */}
        <Section
          id="apariencia"
          eyebrow="Identidad"
          title="Apariencia del negocio"
          description="Personaliza la imagen y el color que verán tus clientes."
        >
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr_1.4fr]">
            <ImageCard
              kind="banner"
              title="Banner del negocio" 
              image={banner}
              loading={uploadingBanner}
              inputRef={bannerInputRef}
              onSelect={(event) => handleImage("banner", event)}
            />

            <ImageCard
              kind="pfp"
              title="Foto de perfil" 
              image={pfp}
              loading={uploadingPfp}
              inputRef={pfpInputRef}
              onSelect={(event) => handleImage("pfp", event)}
            />

            <div className="min-w-0">
              <div className="mb-2.5">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  Color principal
                </p>
 
              </div>

              <div className="overflow-hidden rounded-lg  ">
                <div className=" ">
                  <div className="  flex items-center gap-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(event) => {
                          setAccentColor(event.target.value);
                          setHexInput(event.target.value);
                        }}
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />

                      <div
                        className="h-full w-full rounded-lg"
                        style={{ backgroundColor: accentColor }}
                      />
                    </div>

                    <input
                      value={hexInput}
                      onChange={(event) => handleHex(event.target.value)}
                      maxLength={7}
                      placeholder="#e83906"
                      className={`${INPUT} min-w-0`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* CONTACTO */}
        <Section
          id="contacto"
          eyebrow="Información"
          title="Redes y contacto"
          description="Información que puede mostrarse a tus clientes."
        >
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Teléfono">
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="10 dígitos"
                className={INPUT}
              />
            </Field>

            <Field label="Instagram">
              <input
                type="url"
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder="https://instagram.com/..."
                className={INPUT}
              />
            </Field>

            <Field label="Facebook">
              <input
                type="url"
                value={facebook}
                onChange={(event) => setFacebook(event.target.value)}
                placeholder="https://facebook.com/..."
                className={INPUT}
              />
            </Field>
          </div>
        </Section>

        {/* WHATSAPP */}
        <Section
          id="whatsapp"
          eyebrow="Mensajería"
          title="WhatsApp Business"
          description="Conecta el número del negocio para automatizar mensajes."
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {whatsappConnected
                    ? "WhatsApp conectado"
                    : "Conecta tu WhatsApp"}
                </p>

                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    whatsappConnected
                      ? "bg-[var(--green-color)] text-[var(--green-text-color)]"
                      : "bg-[var(--light-accent)] text-[var(--accent-color)]"
                  }`}
                >
                  {whatsappConnected ? "Activo" : "Pendiente"}
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--gray-color)]">
                {whatsappConnected
                  ? "Platillo puede enviar el menú y las actualizaciones de pedidos."
                  : "Conecta WhatsApp Business para enviar tu menú automáticamente."}
              </p>
            </div>

            <button
              type="button"
              onClick={connectWhatsapp}
              disabled={connectingWhatsapp}
              className="h-11 shrink-0 rounded-lg bg-[#25D366] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {connectingWhatsapp
                ? "Generando enlace..."
                : whatsappConnected
                  ? "Administrar WhatsApp"
                  : "Conectar WhatsApp"}
            </button>
          </div>

          <div className="mt-5 rounded-lg bg-[var(--light-gray)] px-4">
            <div className="flex justify-between gap-5 py-4 text-sm">
              <span className="text-[var(--gray-color)]">Número</span>

              <span className="text-right font-medium">
                {whatsapp.displayPhoneNumber || "Sin número conectado"}
              </span>
            </div>

            <div className="border-t border-[var(--background)]" />

            <div className="flex justify-between gap-5 py-4 text-sm">
              <span className="text-[var(--gray-color)]">Modo</span>

              <span className="text-right font-medium">{whatsappMode}</span>
            </div>

            {whatsapp.phoneNumberId && (
              <>
                <div className="border-t border-[var(--background)]" />

                <div className="flex justify-between gap-5 py-4 text-sm">
                  <span className="text-[var(--gray-color)]">
                    ID del número
                  </span>

                  <span className="max-w-[65%] break-all text-right text-xs font-medium">
                    {whatsapp.phoneNumberId}
                  </span>
                </div>
              </>
            )}
          </div>
        </Section>

        {/* UBICACIÓN */}
        <Section
          id="ubicacion"
          eyebrow="Dirección"
          title="Ubicación"
          description="Permite que los clientes encuentren el negocio correctamente."
        >
          <Field label="Dirección">
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Dirección completa del negocio"
              className="min-h-24 w-full resize-y rounded-lg border border-[var(--light-gray)] bg-[var(--background)] px-3.5 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent-color)]"
            />
          </Field>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setLocationOpen(true)}
              className="h-11 rounded-lg bg-[var(--foreground)] px-5 text-sm font-medium text-white"
            >
              Seleccionar ubicación
            </button>

            <p className="text-xs text-[var(--gray-color)]">
              {location
                ? `${location.latitude.toFixed(
                    6,
                  )}, ${location.longitude.toFixed(6)}`
                : "Todavía no hay coordenadas guardadas."}
            </p>
          </div>
        </Section>

        {/* ESTADO */}
        <Section
          id="estado"
          eyebrow="Operación"
          title="Estado y horarios"
          description="Controla cuándo puede recibir pedidos el restaurante."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Switch
              checked={isOpen}
              onChange={setIsOpen}
              label="Negocio abierto"
              description={
                isOpen
                  ? "Visible y recibiendo pedidos."
                  : "Cerrado temporalmente."
              }
            />

            <Switch
              checked={alwaysOpen}
              onChange={setAlwaysOpen}
              label="Abierto 24 horas"
              description="Ignora los horarios configurados."
            />
          </div>

          {!alwaysOpen && (
            <div className="mt-5 overflow-hidden rounded-lg bg-[var(--light-gray)]">
              {schedule.map((item, index) => (
                <div
                  key={item.dia}
                  className="border-b border-[var(--background)] p-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium">{item.dia}</p>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={item.abierto}
                      onClick={() =>
                        updateSchedule(index, "abierto", !item.abierto)
                      }
                      className={`relative h-6 w-11 rounded-full ${
                        item.abierto
                          ? "bg-[var(--accent-color)]"
                          : "bg-[var(--half-gray)]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          item.abierto ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {item.abierto && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <Field label="Apertura">
                        <input
                          type="time"
                          value={item.apertura}
                          onChange={(event) =>
                            updateSchedule(
                              index,
                              "apertura",
                              event.target.value,
                            )
                          }
                          className={INPUT}
                        />
                      </Field>

                      <Field label="Cierre">
                        <input
                          type="time"
                          value={item.cierre}
                          onChange={(event) =>
                            updateSchedule(index, "cierre", event.target.value)
                          }
                          className={INPUT}
                        />
                      </Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* PAGOS */}
        <Section
          id="pagos"
          eyebrow="Cobros"
          title="Métodos de pago"
          description="Elige las opciones disponibles durante el checkout."
        >
          <div className="grid gap-3 md:grid-cols-2">
            <Switch
              checked={cash}
              onChange={setCash}
              label="Efectivo"
              description="Pago al recoger o recibir."
            />

            <Switch
              checked={transferEnabled}
              onChange={setTransferEnabled}
              label="Transferencia"
              description="Muestra los datos bancarios."
            />
          </div>

          {transferEnabled && (
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <Field label="Banco">
                <input
                  value={transferBank}
                  onChange={(event) => setTransferBank(event.target.value)}
                  placeholder="Ej. BBVA"
                  className={INPUT}
                />
              </Field>

              <Field label="CLABE">
                <input
                  inputMode="numeric"
                  value={transferClabe}
                  onChange={(event) =>
                    setTransferClabe(
                      event.target.value.replace(/\D/g, "").slice(0, 18),
                    )
                  }
                  placeholder="18 dígitos"
                  className={INPUT}
                />
              </Field>

              <Field label="Titular">
                <input
                  value={transferHolder}
                  onChange={(event) => setTransferHolder(event.target.value)}
                  placeholder="Nombre del titular"
                  className={INPUT}
                />
              </Field>
            </div>
          )}
        </Section>

        {/* ENTREGA */}
        <Section
          id="entrega"
          eyebrow="Logística"
          title="Tipos de entrega"
          description="Configura el envío a domicilio además de la recolección."
        >
          <Switch
            checked={deliveryEnabled}
            onChange={setDeliveryEnabled}
            label="Envío a domicilio"
            description={
              deliveryEnabled
                ? "Los clientes pueden solicitar entrega."
                : "Solo recolección en local."
            }
          />

          {deliveryEnabled && (
            <div className="mt-5 max-w-sm">
              <Field
                label="Precio de envío"
                hint="Escribe 0 si el envío es gratis."
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryPrice}
                  onChange={(event) => setDeliveryPrice(event.target.value)}
                  placeholder="0.00"
                  className={INPUT}
                />
              </Field>
            </div>
          )}
        </Section>

        {/* GUARDAR */}
        <div className="flex flex-col gap-4 rounded-xl bg-[var(--light-gray)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">
              Guardar configuración
            </p>

            <p className="mt-1 text-xs text-[var(--gray-color)]">
              Los cambios se reflejarán en el menú del restaurante.
            </p>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="h-11 rounded-lg bg-[var(--accent-color)] px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <LocationModal
        open={locationOpen}
        location={location}
        address={address}
        onClose={() => setLocationOpen(false)}
        onSave={(newLocation) => {
          setLocation(newLocation);
          setLocationOpen(false);

          showToast(
            "Ubicación seleccionada. Guarda los cambios para aplicarla.",
          );
        }}
      />

      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[160] max-w-sm rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${
            toast.tone === "error"
              ? "bg-[var(--red-color)] text-[var(--red-text-color)]"
              : "bg-[var(--green-color)] text-[var(--green-text-color)]"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
