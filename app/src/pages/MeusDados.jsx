import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Save, User, MapPin, Phone, Mail, Lock } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { PUT_USER, GET_USER } from "../api";
import { maskCPF, maskPhone } from "../utils/masks";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const MeusDados = () => {
  const { userId, data: userData, userLogin } = useAuth(); // userLogin might be needed to refresh token if password changes? No.
  const [loading, setLoading] = useState(false);

  const defaultFormState = {
    name: "",
    sobrenome: "",
    nascimento: "",
    cpf: "",
    sexo: "",
    ecivil: "",
    telefone: "",
    especialidade: "",
    nconselho: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    email: "",
    password: "", // Optional for update
  };

  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch fresh data
          const { url, options } = GET_USER(token);
          const response = await fetch(url, options);
          const json = await response.json();

          if (response.ok) {
            // Populate form
            const user = json.user || json; // Adjust based on API response structure
            setFormData({
              ...defaultFormState,
              ...user,
              password: "", // Don't show password
              nascimento: user.nascimento ? user.nascimento.split("T")[0] : "",
            });
          }
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
          toast.error("Erro ao carregar seus dados.");
        }
      }
    };
    loadData();
  }, [userId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const payload = { ...formData };

      // Remove password if empty to avoid overwriting with empty string
      if (!payload.password) {
        delete payload.password;
      }

      // Remove fields that shouldn't be updated by user if necessary (e.g. level, status)
      // Assuming backend handles protection or we just don't send them if they are in defaultFormState but not in form
      // Actually we initialized formData with user data which includes level/status.
      // We should probably exclude them from the payload if we want to be safe,
      // but if the backend ignores them for non-admins it's fine.
      // Let's remove sensitive fields just in case.
      delete payload.level;
      delete payload.status;
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      const { url, options } = PUT_USER(userId, payload, token);
      const response = await fetch(url, options);

      if (response.ok) {
        toast.success("Dados atualizados com sucesso!");
        // Optionally refresh context
      } else {
        const err = await response.json();
        toast.error(err.message || "Erro ao atualizar dados.");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  // Helper styles to reuse
  const labelStyle = "block text-sm font-medium text-brand-muted mb-1";
  const selectStyle =
    "w-full bg-brand-surface border border-brand-border rounded px-3 py-2 text-brand-text focus:outline-none focus:border-brand-primary transition-colors duration-200";

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando seus dados..." />;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-text mb-8 flex items-center gap-2">
        <User className="text-brand-primary" /> Meus Dados
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <Card className="p-6 bg-brand-surface border-brand-border">
          <h3 className="text-lg font-semibold text-brand-primary mb-4 border-b border-brand-border pb-2">
            Dados Pessoais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            <div>
              <label className={labelStyle}>Data de Nascimento</label>
              <Input
                name="nascimento"
                type="date"
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
                maxLength={14}
                placeholder="000.000.000-00"
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
                maxLength={15}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card className="p-6 bg-brand-surface border-brand-border">
          <h3 className="text-lg font-semibold text-brand-primary mb-4 border-b border-brand-border pb-2">
            Endereço
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>CEP</label>
              <Input
                name="cep"
                value={formData.cep}
                onChange={handleCEPChange}
                maxLength={9}
                placeholder="00000-000"
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
        </Card>

        {/* Acesso ao Sistema */}
        <Card className="p-6 bg-brand-surface border-brand-border">
          <h3 className="text-lg font-semibold text-brand-primary mb-4 border-b border-brand-border pb-2">
            Acesso ao Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>E-mail de Acesso *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled
                className="opacity-50 cursor-not-allowed"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className={labelStyle}>
                Nova Senha (deixe em branco para manter)
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-8 py-3"
          >
            {loading ? "Salvando..." : "Salvar Alterações"}{" "}
            <Save className="ml-2" size={20} />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MeusDados;
