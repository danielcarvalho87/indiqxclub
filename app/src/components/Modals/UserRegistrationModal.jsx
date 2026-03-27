import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { maskCPF, maskPhone } from "../../utils/masks";

const UserRegistrationModal = ({
  isOpen,
  onClose,
  onSubmit,
  isParceiro = false,
  initialData = null,
  currentUserLevel = "Administrador",
  currentUserId = null,
}) => {
  const defaultFormState = {
    name: "",
    sobrenome: "",
    nascimento: "",
    cpf: "",
    sexo: "",
    ecivil: "",
    telefone: "",
    especialidade: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    email: "",
    password: "",
    level: isParceiro ? "Parceiro" : "Administrador",
    status: "Ativo",
    master_id: currentUserId,
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({ ...defaultFormState, ...initialData, password: "" });
        setIsEditing(true);
      } else {
        setFormData(defaultFormState);
        setIsEditing(false);
      }
    }
  }, [isOpen, initialData, isParceiro]);

  if (!isOpen) return null;
  const handleChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;
    if (name === "cpf") {
      formattedValue = maskCPF(value);
    } else if (name === "telefone") {
      formattedValue = maskPhone(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };
  const handleCEPChange = async (event) => {
    const novoCep = event.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, cep: novoCep }));

    if (novoCep.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${novoCep}/json/`,
        );
        const data = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            logradouro: data.logradouro || "",
            bairro: data.bairro || "",
            localidade: data.localidade || "",
            uf: data.uf || "",
          }));
        } else {
          limparCamposCEP();
          console.error("CEP não encontrado");
        }
      } catch (error) {
        limparCamposCEP();
        console.error("Erro na consulta do CEP:", error);
      }
    } else if (novoCep.length < 8) {
      limparCamposCEP();
    }
  };

  const limparCamposCEP = () => {
    setFormData((prev) => ({
      ...prev,
      logradouro: "",
      bairro: "",
      localidade: "",
      uf: "",
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      // Filtrar apenas os campos que pertencem ao formulário para evitar erro 400 no backend (ex: created_at)
      const dataToSubmit = {};
      Object.keys(defaultFormState).forEach((key) => {
        if (formData[key] !== undefined) {
          dataToSubmit[key] = formData[key];
        }
      });

      // Se for edição e a senha estiver vazia, remove o campo para não atualizar a senha
      if (
        isEditing &&
        (!dataToSubmit.password || dataToSubmit.password.trim() === "")
      ) {
        delete dataToSubmit.password;
      }

      // Garante que o master_id seja enviado se estiver disponível e for um Parceiro sendo criado
      if (!isEditing && isParceiro && currentUserId) {
        dataToSubmit.master_id = currentUserId;
      }

      onSubmit(dataToSubmit);
    }
  };

  // Helper styles to reuse
  const labelStyle = "mb-2 block text-sm font-medium text-brand-muted";
  const selectStyle =
    "w-full rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-brand-text shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors duration-200 focus:border-brand-primary/45 focus:bg-brand-dark/60 focus:outline-none focus:ring-4 focus:ring-brand-primary/12";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(76,130,255,0.18),transparent_35%),rgba(2,6,16,0.86)] p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[32px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] bg-brand-surface shadow-[0_32px_120px_rgba(3,8,20,0.58)] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-brand-border/40 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-brand-text">
              {isEditing ? "Editar Usuário" : "Cadastrar Usuário"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Preencha os dados em uma experiência mais limpa e consistente com
              a marca.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/5 bg-white/[0.02] p-2 text-brand-muted transition-colors hover:bg-brand-surfaceAlt hover:text-brand-text"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form
            id="user-registration-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5 md:p-6">
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary/90">
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelStyle}>Nome *</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className={labelStyle}>Sobrenome</label>
                  <Input
                    name="sobrenome"
                    value={formData.sobrenome}
                    onChange={handleChange}
                    placeholder="Sobrenome"
                  />
                </div>

                {isParceiro && (
                  <>
                    <div>
                      <label className={labelStyle}>Data de Nascimento</label>
                      <Input
                        type="date"
                        name="nascimento"
                        value={formData.nascimento}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>CPF</label>
                      <Input
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className={labelStyle}>Sexo</label>
                      <select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="">Selecione...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Estado Civil</label>
                      <select
                        name="ecivil"
                        value={formData.ecivil}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="">Selecione...</option>
                        <option value="Solteiro">Solteiro(a)</option>
                        <option value="Casado">Casado(a)</option>
                        <option value="Divorciado">Divorciado(a)</option>
                        <option value="Viuvo">Viúvo(a)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Telefone</label>
                      <Input
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {isParceiro && (
              <div className="rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5 md:p-6">
                <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary/90">
                  Endereço
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelStyle}>CEP</label>
                    <Input
                      name="cep"
                      value={formData.cep}
                      onChange={handleCEPChange}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Logradouro</label>
                    <Input
                      name="logradouro"
                      value={formData.logradouro}
                      onChange={handleChange}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Número</label>
                    <Input
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Complemento</label>
                    <Input
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                      placeholder="Apto, Bloco..."
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Bairro</label>
                    <Input
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      placeholder="Bairro"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Cidade</label>
                    <Input
                      name="localidade"
                      value={formData.localidade}
                      onChange={handleChange}
                      placeholder="Cidade"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>UF</label>
                    <select
                      name="uf"
                      value={formData.uf}
                      onChange={handleChange}
                      className={selectStyle}
                    >
                      <option value="">Selecione...</option>
                      {/* Lista simplificada de UFs */}
                      <option value="AC">AC</option>
                      <option value="AL">AL</option>
                      <option value="AP">AP</option>
                      <option value="AM">AM</option>
                      <option value="BA">BA</option>
                      <option value="CE">CE</option>
                      <option value="DF">DF</option>
                      <option value="ES">ES</option>
                      <option value="GO">GO</option>
                      <option value="MA">MA</option>
                      <option value="MT">MT</option>
                      <option value="MS">MS</option>
                      <option value="MG">MG</option>
                      <option value="PA">PA</option>
                      <option value="PB">PB</option>
                      <option value="PR">PR</option>
                      <option value="PE">PE</option>
                      <option value="PI">PI</option>
                      <option value="RJ">RJ</option>
                      <option value="RN">RN</option>
                      <option value="RS">RS</option>
                      <option value="RO">RO</option>
                      <option value="RR">RR</option>
                      <option value="SC">SC</option>
                      <option value="SP">SP</option>
                      <option value="SE">SE</option>
                      <option value="TO">TO</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5 md:p-6">
              <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary/90">
                Acesso ao Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>E-mail de Acesso *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className={labelStyle}>
                    {isEditing
                      ? "Nova Senha (deixe em branco para manter)"
                      : "Senha *"}
                  </label>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditing}
                    placeholder="******"
                  />
                </div>
                {currentUserLevel !== "Parceiro" &&
                currentUserLevel !== "parceiro" ? (
                  <>
                    <div>
                      <label className={labelStyle}>Nível de Acesso *</label>
                      <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className={selectStyle}
                        required
                      >
                        {(currentUserLevel === "FullAdmin" ||
                          currentUserLevel === "Full Admin") && (
                          <option value="FullAdmin">Full Admin</option>
                        )}
                        <option value="Administrador">Administrador</option>
                        <option value="Parceiro">Parceiro</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelStyle}>Status *</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={selectStyle}
                        required
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Campos ocultos para manter os valores quando é parceiro salvando o form */}
                    <input type="hidden" name="level" value={formData.level} />
                    <input
                      type="hidden"
                      name="status"
                      value={formData.status}
                    />
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 border-t border-brand-border/40 bg-brand-surface/90 px-6 py-5 backdrop-blur">
          <Button type="button" onClick={onClose} variant="outline" size="sm">
            Cancelar
          </Button>
          <Button type="submit" form="user-registration-form" size="sm">
            <Save size={18} />
            {isEditing ? "Salvar Alterações" : "Salvar Usuário"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserRegistrationModal;
