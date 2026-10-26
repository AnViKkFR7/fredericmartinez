import { useMatches } from "@remix-run/react";
import { LEAD_PRIVACY_TEXT_VERSION } from "~/lib/leadCore";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useContactModal } from "~/context/ContactModalContext";
import ButtonSlider from "~/components/ui/ButtonSlider";
import { submitLead } from "~/lib/leads";
import "~/styles/ContactModal.css";

export default function ContactModal() {
    const { isOpen, closeModal } = useContactModal();
    const matches = useMatches();
    const detail = matches.map((match) => match.data as { project?: { title: string }; service?: { title: string }; post?: { title: string } } | undefined)
        .map((data) => data?.project ?? data?.service ?? data?.post).find(Boolean);
    const formRef = useRef<HTMLFormElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const submitting = useRef(false);
    const [hasError, setHasError] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting.current) return;
        const data = new FormData(event.currentTarget);
        if (!String(data.get("email") ?? "").trim() && !String(data.get("phone") ?? "").trim()) {
            const emailInput = event.currentTarget.elements.namedItem("email") as HTMLInputElement;
            emailInput.setCustomValidity("Indica un email o un teléfono para poder responderte.");
            emailInput.reportValidity();
            return;
        }
        submitting.current = true;
        setIsSubmitting(true);
        setHasError(false);
        const result = await submitLead({
            name: String(data.get("nombre") ?? ""),
            email: String(data.get("email") ?? ""),
            phone: String(data.get("phone") ?? ""),
            message: String(data.get("mensaje") ?? ""),
            company_website: String(data.get("company_website") ?? ""),
            source_item: detail ? `${detail.title} · ${window.location.pathname.split("/").pop()}` : undefined,
            consent_given: data.get("privacy") === "on",
            consent_text_version: LEAD_PRIVACY_TEXT_VERSION,
        });
        submitting.current = false;
        setIsSubmitting(false);
        if (result.ok) {
            formRef.current?.reset();
            setSuccess(true);
        } else setHasError(true);
    }

    useEffect(() => {
        if (isOpen) {
            setHasError(false);
            setSuccess(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeModal();
        };
        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, closeModal]);

    if (!isOpen) return null;

    return (
        <div
            className="contact-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Formulario de contacto"
            onClick={closeModal}
        >
            <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    className="contact-modal-close"
                    onClick={closeModal}
                    aria-label="Cerrar formulario"
                >
                    ✕
                </button>

                <p className="contact-modal-label">CONTACTO</p>
                <h2 className="contact-modal-title">¿En qué puedo ayudarte?</h2>

                {success ? (
                    <div className="contact-feedback contact-feedback--success" role="status">
                        <p className="contact-feedback-heading">¡Mensaje enviado!</p>
                        <p className="contact-feedback-body">
                            Pronto recibirás mi respuesta.
                        </p>
                        <button className="btn btn-dark" style={{ marginTop: 24 }} onClick={closeModal}>
                            CERRAR
                        </button>
                    </div>
                ) : (
                    <form
                        ref={formRef}
                        method="post"
                        onSubmit={handleSubmit}
                        onInput={() => {
                            const emailInput = formRef.current?.elements.namedItem("email") as HTMLInputElement | null;
                            emailInput?.setCustomValidity("");
                        }}
                        className="contact-form"
                    >
                        <div className="contact-form-group">
                            <label htmlFor="cf-nombre">Nombre</label>
                            <input
                                id="cf-nombre"
                                name="nombre"
                                type="text"
                                required
                                maxLength={120}
                                placeholder="Tu nombre"
                                autoComplete="name"
                            />
                        </div>

                        <div className="contact-form-group">
                            <label htmlFor="cf-email">Email</label>
                            <input
                                id="cf-email"
                                name="email"
                                type="email"
                                maxLength={160}
                                placeholder="tu@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="contact-form-group">
                            <label htmlFor="cf-phone">Teléfono (opcional si indicas email)</label>
                            <input id="cf-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="Tu teléfono" />
                        </div>

                        <div className="contact-form-group">
                            <label htmlFor="cf-mensaje">Mensaje</label>
                            <textarea
                                id="cf-mensaje"
                                name="mensaje"
                                rows={5}
                                required
                                maxLength={4000}
                                placeholder="Cuéntame tu proyecto..."
                            />
                        </div>

                        {hasError && (
                            <div className="contact-feedback contact-feedback--error" role="alert">
                                <p>
                                    Ha ocurrido un error. Por favor inténtalo de nuevo en unos
                                    minutos, o escríbeme directamente a{" "}
                                    <a href="mailto:hola@fredericmartinez.com">
                                        hola@fredericmartinez.com
                                    </a>
                                </p>
                            </div>
                        )}
                        <div className="contact-form-note">
                            <p>
                                O si lo prefieres escríbeme a <a href="mailto:hola@fredericmartinez.com">hola@fredericmartinez.com</a>
                            </p>
                        </div>  
                        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true"
                            style={{ position: "absolute", left: -9999, width: 1, height: 1 }} />
                        <label className="contact-privacy-check">
                            <input type="checkbox" name="privacy" />
                            <span>He leído la <a href="/aviso-legal#privacidad" target="_blank" rel="noopener noreferrer">información de privacidad</a> y acepto el tratamiento explicado allí (opcional).</span>
                        </label>
                        <div className="contact-form-submit">
                            <ButtonSlider
                                type="submit"
                                text="HABLEMOS"
                                disabled={isSubmitting}
                                loadingText="ENVIANDO…"
                            />
                        </div>
                        <div className="contact-form-note">
                            <p className="contact-form-note-privacy">
                                Tus datos se guardan en la bandeja de solicitudes para responderte.
                                Consulta los detalles en la{" "}<a href="/aviso-legal" target="_blank" rel="noopener noreferrer" className="contact-form-note-privacy-link">
                                    política de privacidad
                                </a>.
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
