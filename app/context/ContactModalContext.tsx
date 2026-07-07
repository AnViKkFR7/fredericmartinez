import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

interface ContactModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const ContactModalContext = createContext<ContactModalContextValue>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
});

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  return (
    <ContactModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ContactModalContext.Provider>
  );
}

export function useContactModal() {
  return useContext(ContactModalContext);
}
