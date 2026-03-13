import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  phone: "+52",
  amount: "",
};

const PHONE_PREFIX = "+52";
const MAX_PHONE_DIGITS = 10;

function normalizePhoneInput(value) {
  const digits = String(value || "")
    .replace(/\s+/g, "")
    .replace(/\D/g, "");
  const nationalNumber = (digits.startsWith("52") ? digits.slice(2) : digits).slice(0, MAX_PHONE_DIGITS);

  return `${PHONE_PREFIX}${nationalNumber}`;
}

export default function AppPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [demo, setDemo] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadDemoConfig() {
      try {
        const data = await api.getDemoConfig();
        if (active) {
          setDemo(data.demo);
        }
      } catch (err) {
        if (active) {
          setMessage({ type: "error", text: err.message || "No se pudo cargar la configuracion." });
        }
      } finally {
        if (active) {
          setIsLoadingConfig(false);
        }
      }
    }

    loadDemoConfig();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "phone" ? normalizePhoneInput(value) : value,
    }));
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function validateForm() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.phone.trim() || !form.amount.trim()) {
      return "Completa Nombre, Apellido, Teléfono y Monto.";
    }

    if (Number(form.amount) <= 0) {
      return "El monto debe ser un número mayor a 0.";
    }

    if (!/^\+52\d{10}$/.test(form.phone)) {
      return "El teléfono debe tener formato +52xxxxxxxxxx.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    const error = validateForm();
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.callDemo({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        amount: form.amount.trim(),
      });

      setMessage({
        type: "success",
        text: response.callId
          ? `Llamada iniciada correctamente. call_id: ${response.callId}`
          : "Llamada iniciada correctamente.",
      });
      setForm(INITIAL_FORM);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "No se pudo iniciar la llamada." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Demo privada</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">{demo?.label || "Soft Collection"}</h1>
            <p className="mt-1 text-sm text-slate-600">Usuario: {user?.username || "N/A"}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {isLoadingConfig ? (
            <p className="text-sm text-slate-600">Cargando formulario...</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    type="text"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    type="tel"
                    inputMode="numeric"
                    maxLength={PHONE_PREFIX.length + MAX_PHONE_DIGITS}
                    placeholder="+525512345678"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>

                <div>
                  <label htmlFor="amount" className="mb-1 block text-sm font-medium text-slate-700">
                    Monto
                  </label>
                  <input
                    id="amount"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    type="number"
                    min="0.01"
                    step="0.01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>

              {message ? (
                <p className={`text-sm ${message.type === "error" ? "text-rose-600" : "text-emerald-600"}`}>
                  {message.text}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Enviando..." : "Llamar"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
