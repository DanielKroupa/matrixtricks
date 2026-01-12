"use client";

import React, { createContext, useContext, useState } from "react";

type FormType = "login" | "register" | "forgot";

interface AuthContextValue {
  isModalOpen: boolean;
  currentForm: FormType;
  openModal: (form?: FormType) => void;
  closeModal: () => void;
  switchForm: (form: FormType) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentForm, setCurrentForm] = useState<FormType>("login");

  const openModal = (form: FormType = "login") => {
    setCurrentForm(form);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const switchForm = (form: FormType) => setCurrentForm(form);

  return (
    <AuthContext.Provider
      value={{ isModalOpen, currentForm, openModal, closeModal, switchForm }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
