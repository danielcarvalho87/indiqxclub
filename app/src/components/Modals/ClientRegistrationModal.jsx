import React, { useState, useEffect, useRef } from "react";
import { X, Save, Search, ChevronDown } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { maskPhone, maskCurrency, unmaskCurrency } from "../../utils/masks";
import { useAuth } from "../../hooks/useAuth";

const ClientRegistrationModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  parceiros = [],
}) => {
  const { userLevel, userId, data: userData } = useAuth();
  const defaultFormState = {
    nome: "",
    sobrenome: "",
    telefone: "",
    email: "",
    corretor_id: "",
    tipo_servico: "",
    valor_contrato: "",
    status: "Novo cliente",
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [isEditing, setIsEditing] = useState(false);
  const [parceiroSearch, setParceiroSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setParceiroSearch("");
      if (initialData) {
        setFormData({
          ...defaultFormState,
          ...initialData,
          corretor_id:
            initialData.corretor?.id || initialData.corretor_id || "",
          valor_contrato: initialData.valor_contrato
            ? maskCurrency((initialData.valor_contrato * 100).toString())
            : "",
        });
        setIsEditing(true);
      } else {
        setFormData({
          ...defaultFormState,
          corretor_id: userLevel === "Parceiro" ? userId : "",
        });
        setIsEditing(false);
      }
    }
  }, [isOpen, initialData, userLevel, userId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "telefone") {
      formattedValue = maskPhone(value);
    } else if (name === "valor_contrato") {
      formattedValue = maskCurrency(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {};

    // Pick only fields that belong to the DTO to avoid 400 error
    Object.keys(defaultFormState).forEach((key) => {
      if (
        formData[key] !== "" &&
        formData[key] !== null &&
        formData[key] !== undefined
      ) {
        submissionData[key] = formData[key];
      }
    });

    // Ensure numeric values are numbers
    if (submissionData.valor_contrato) {
      submissionData.valor_contrato = unmaskCurrency(
        submissionData.valor_contrato,
      );
    }

    if (submissionData.corretor_id) {
      submissionData.corretor_id = parseInt(submissionData.corretor_id);
    }

    onSubmit(submissionData);
  };

  const selectStyle =
    "w-full rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-brand-text shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-200 focus:border-brand-primary/45 focus:bg-brand-dark/60 focus:outline-none focus:ring-4 focus:ring-brand-primary/12";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(76,130,255,0.18),transparent_35%),rgba(2,6,16,0.86)] p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] bg-brand-surface shadow-[0_32px_120px_rgba(3,8,20,0.58)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-border/40 bg-brand-surface px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-brand-text">
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Organize os dados do lead com uma apresentação mais leve e atual.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/5 bg-white/[0.02] p-2 text-brand-muted transition-colors hover:bg-brand-surfaceAlt hover:text-brand-text"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto p-6 custom-scrollbar"
        >
          <div className="rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5 md:p-6">
            <div className="mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary/90">
                Dados do lead
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Nome do cliente"
              />
              <Input
                label="Sobrenome"
                name="sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                placeholder="Sobrenome"
              />
              <Input
                label="Telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                maxLength={15}
                required
                placeholder="(00) 00000-0000"
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
              />

              <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
                <label className="text-sm font-medium text-brand-muted">
                  Parceiro
                </label>

                <div
                  className={`flex w-full items-center justify-between rounded-xl border border-brand-border bg-brand-dark/60 px-4 py-3 text-brand-text transition-all duration-200 ${
                    userLevel === "Parceiro"
                      ? "cursor-not-allowed opacity-70"
                      : "cursor-pointer focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-primary/30"
                  }`}
                  onClick={() =>
                    userLevel !== "Parceiro" &&
                    setIsDropdownOpen(!isDropdownOpen)
                  }
                  tabIndex={userLevel === "Parceiro" ? -1 : 0}
                >
                  <span
                    className={
                      !formData.corretor_id
                        ? "text-brand-muted"
                        : "text-brand-text"
                    }
                  >
                    {formData.corretor_id
                      ? (() => {
                          if (
                            userLevel === "Parceiro" &&
                            String(formData.corretor_id) === String(userId)
                          ) {
                            return `${userData?.name || ""} ${userData?.sobrenome || ""}`;
                          }
                          const c = parceiros.find(
                            (c) => c.id === parseInt(formData.corretor_id),
                          );
                          return c
                            ? `${c.name} ${c.sobrenome || ""}`
                            : "Selecione um parceiro";
                        })()
                      : "Selecione um parceiro"}
                  </span>
                  {userLevel !== "Parceiro" && (
                    <ChevronDown
                      size={16}
                      className={`text-brand-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </div>

                {isDropdownOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 flex max-h-60 w-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-brand-surface shadow-2xl">
                    <div className="sticky top-0 z-10 border-b border-brand-border bg-brand-surface p-2">
                      <div className="relative">
                        <Search
                          size={14}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted"
                        />
                        <input
                          type="text"
                          placeholder="Buscar parceiro..."
                          value={parceiroSearch}
                          onChange={(e) => setParceiroSearch(e.target.value)}
                          className="w-full rounded-xl border border-brand-border bg-brand-dark/60 py-2 pl-9 pr-3 text-sm text-brand-text transition-colors focus:border-brand-primary focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar">
                      <div
                        className="cursor-pointer px-3 py-2 text-sm text-brand-muted transition-colors hover:bg-brand-surfaceAlt"
                        onClick={() => {
                          handleChange({
                            target: { name: "corretor_id", value: "" },
                          });
                          setIsDropdownOpen(false);
                        }}
                      >
                        Nenhum / Limpar seleção
                      </div>
                      {parceiros
                        .filter((parceiro) => {
                          const fullName =
                            `${parceiro.name} ${parceiro.sobrenome || ""}`.toLowerCase();
                          return fullName.includes(
                            parceiroSearch.toLowerCase(),
                          );
                        })
                        .map((parceiro) => (
                          <div
                            key={parceiro.id}
                            className={`cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-brand-surfaceAlt ${
                              formData.corretor_id === parceiro.id ||
                              formData.corretor_id === parceiro.id.toString()
                                ? "bg-brand-primary/10 text-brand-primary font-medium"
                                : "text-brand-text"
                            }`}
                            onClick={() => {
                              handleChange({
                                target: {
                                  name: "corretor_id",
                                  value: parceiro.id,
                                },
                              });
                              setIsDropdownOpen(false);
                              setParceiroSearch("");
                            }}
                          >
                            {parceiro.name} {parceiro.sobrenome || ""}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Tipo de Serviço"
                name="tipo_servico"
                value={formData.tipo_servico}
                onChange={handleChange}
                required
                placeholder="Ex: Venda, Aluguel"
              />

              <Input
                label="Valor do Contrato"
                name="valor_contrato"
                type="text"
                value={formData.valor_contrato}
                onChange={handleChange}
                placeholder="R$ 0,00"
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={userLevel === "Parceiro"}
                  className={`${selectStyle} ${userLevel === "Parceiro" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  <option value="Novo cliente">Novo cliente</option>
                  <option value="Em atendimento">Em atendimento</option>
                  <option value="Reunião agendada">Reunião agendada</option>
                  <option value="Contrato fechado">Contrato fechado</option>
                  <option value="Contrato perdido">Contrato perdido</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-brand-border/40 pt-6">
            <Button type="button" onClick={onClose} variant="outline" size="sm">
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              <Save size={18} />
              {isEditing ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegistrationModal;
