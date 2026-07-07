import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useContactModal } from "~/context/ContactModalContext";
import ButtonSlider from "~/components/ui/ButtonSlider";
import "~/styles/ContactModal.css";

interface ContactActionData {
    ok: boolean;
    error?: string;
}

export default function ContactModal() {
    const { isOpen, closeModal } = useContactModal();
    const fetcher = useFetcher<ContactActionData>();
    const formRef = useRef<HTMLFormElement>(null);

    const isSubmitting = fetcher.state !== "idle";
    const hasData = fetcher.state === "idle" && fetcher.data != null;
    const [hasError, setHasError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (success) {
            formRef.current?.reset();
        }
    }, [success]);

    useEffect(() => {
        if (hasData) {
            if (fetcher.data?.ok) {
                setSuccess(true);
            } else {
                setHasError(true);
            }
        }
    }, [hasData, fetcher.data]);

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
                    <div className="contact-feedback contact-feedback--success">
                        <p className="contact-feedback-heading">¡Mensaje enviado!</p>
                        <p className="contact-feedback-body">
                            Pronto recibirás mi respuesta.
                        </p>
                        <button className="btn btn-dark" style={{ marginTop: 24 }} onClick={closeModal}>
                            CERRAR
                        </button>
                    </div>
                ) : (
                    <fetcher.Form
                        ref={formRef}
                        method="post"
                        action="/contact"
                        className="contact-form"
                    >
                        <div className="contact-form-group">
                            <label htmlFor="cf-nombre">Nombre</label>
                            <input
                                id="cf-nombre"
                                name="nombre"
                                type="text"
                                required
                                maxLength={100}
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
                                required
                                maxLength={254}
                                placeholder="tu@email.com"
                                autoComplete="email"
                            />
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
                            <div className="contact-feedback contact-feedback--error">
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
                                Al enviar este formulario aceptas que tus datos sean tratados de
                                acuerdo con nuestra{" "}<a href="/aviso-legal" target="_blank" rel="noopener noreferrer" className="contact-form-note-privacy-link">
                                    política de privacidad
                                </a>.
                            </p>
                        </div>
                    </fetcher.Form>
                )}
            </div>
        </div>
    );
}
