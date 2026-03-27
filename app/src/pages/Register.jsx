import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { maskCPF, maskPhone, maskCEP } from "../utils/masks";
import { API_URL } from "../api";
import logoIndiqx from "../assets/LOGO-INDIQX.svg";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const refId = queryParams.get("ref");

  const [loading, setLoading] = useState(false);
  const [registerToken, setRegisterToken] = useState(null);
  const [step, setStep] = useState(1); // 1: Pessoais, 2: Endereço, 3: Acesso
  const [empresaNome, setEmpresaNome] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    sobrenome: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    telefone: "",
    nascimento: "",
    sexo: "",
    ecivil: "",
    especialidade: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    localidade: "",
    uf: "",
    plano_id: 1, // Default plan
    level: "Parceiro",
    status: "Inativo",
    master_id: refId ? Number(refId) : 0,
  });

  useEffect(() => {
    fetchRegisterToken();
    if (refId) {
      fetchEmpresaConfig(refId);
    }
  }, [refId]);

  const fetchEmpresaConfig = async (masterId) => {
    try {
      // Using API_URL to make a public call
      const response = await fetch(
        `${API_URL}/configuracoes/master/${masterId}`,
      );
      if (response.ok) {
        const json = await response.json();
        if (json && json.length > 0) {
          setEmpresaNome(json[0].nomeEmpresa);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar configurações da empresa:", error);
    }
  };

  const fetchRegisterToken = async () => {
    try {
      const response = await fetch(`${API_URL}/public/register-token`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        setRegisterToken(data.token);
      } else {
        toast.error("Erro ao iniciar sessão de cadastro.");
      }
    } catch (error) {
      console.error("Erro ao buscar token:", error);
      toast.error("Erro de conexão.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cpf") formattedValue = maskCPF(value);
    if (name === "telefone") formattedValue = maskPhone(value);
    if (name === "cep") formattedValue = maskCEP(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (name === "cep" && value.replace(/\D/g, "").length === 8) {
      fetchAddress(value.replace(/\D/g, ""));
    }
  };

  const fetchAddress = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          localidade: data.localidade || "",
          uf: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (!registerToken) {
      toast.error("Sessão expirada. Recarregue a página.");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;

      const response = await fetch(`${API_URL}/public/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${registerToken}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success("Cadastro realizado com sucesso!");
        toast.info("Aguarde a aprovação do administrador para acessar.");
        navigate("/");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao realizar cadastro.");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name) return toast.warning("Nome é obrigatório.");
      if (!formData.cpf) return toast.warning("CPF é obrigatório.");
      if (!formData.telefone) return toast.warning("Telefone é obrigatório.");
    }
    if (step === 2) {
      if (!formData.cep) return toast.warning("CEP é obrigatório.");
      if (!formData.logradouro) return toast.warning("Endereço é obrigatório.");
      if (!formData.numero) return toast.warning("Número é obrigatório.");
    }
    return true;
  };

  const nextStep = () => setStep((p) => p + 1);
  const prevStep = () => setStep((p) => p - 1);

  const handleNext = () => {
    if (validateStep()) {
      nextStep();
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 relative text-brand-text">
      <div className="max-w-4xl w-full bg-brand-surface rounded-xl shadow-2xl border border-brand-border overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Info */}
        <div className="bg-brand-primary/10 p-8 md:w-1/3 flex flex-col justify-between border-r border-brand-border">
          <div>
            <img src={logoIndiqx} alt="Indiqx" className="h-10 mb-6" />
            <p className="text-brand-muted text-sm">
              Junte-se ao clube de benefícios mais completo para parceiros da{" "}
              {empresaNome}
            </p>
          </div>

          <div className="space-y-6 my-8">
            <div className="flex items-center gap-3 text-brand-muted">
              <div className="bg-brand-primary/20 p-2 rounded-lg text-brand-primary">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm text-brand-text">
                Gestão completa de clientes
              </span>
            </div>
            <div className="flex items-center gap-3 text-brand-muted">
              <div className="bg-brand-primary/20 p-2 rounded-lg text-brand-primary">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm text-brand-text">
                Controle de comissões{" "}
              </span>
            </div>
            <div className="flex items-center gap-3 text-brand-muted">
              <div className="bg-brand-primary/20 p-2 rounded-lg text-brand-primary">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm text-brand-text">
                Premiações exclusivas
              </span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="flex items-center text-sm p-0 w-fit"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
        </div>

        {/* Form Area */}
        <div className="p-8 md:w-2/3">
          <h2 className="text-2xl font-bold text-brand-text mb-2">
            Cadastro de Parceiro
          </h2>
          {empresaNome && (
            <div className="mb-6 inline-block bg-brand-primary/20 text-brand-primary px-3 py-1 rounded-full text-lg font-medium border border-brand-primary/30">
              <strong>{empresaNome}</strong>
            </div>
          )}

          {/* Progress Steps */}
          <div className="flex items-center mb-8 text-sm">
            <div
              className={`flex items-center gap-2 ${
                step >= 1 ? "text-brand-primary" : "text-brand-muted"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step >= 1
                    ? "border-brand-primary bg-brand-primary text-brand-text font-bold"
                    : "border-brand-border"
                }`}
              >
                1
              </div>
              <span className="hidden sm:inline">Pessoal</span>
            </div>
            <div className="w-12 h-px bg-brand-border mx-2"></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 2 ? "text-brand-primary" : "text-brand-muted"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step >= 2
                    ? "border-brand-primary bg-brand-primary text-brand-text font-bold"
                    : "border-brand-border"
                }`}
              >
                2
              </div>
              <span className="hidden sm:inline">Endereço</span>
            </div>
            <div className="w-12 h-px bg-brand-border mx-2"></div>
            <div
              className={`flex items-center gap-2 ${
                step >= 3 ? "text-brand-primary" : "text-brand-muted"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  step >= 3
                    ? "border-brand-primary bg-brand-primary text-brand-text font-bold"
                    : "border-brand-border"
                }`}
              >
                3
              </div>
              <span className="hidden sm:inline">Acesso</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="name"
                    placeholder="Nome *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    icon={User}
                  />
                  <Input
                    name="sobrenome"
                    placeholder="Sobrenome"
                    value={formData.sobrenome}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="cpf"
                    placeholder="CPF"
                    value={formData.cpf}
                    onChange={handleChange}
                  />
                  <Input
                    name="nascimento"
                    type="date"
                    placeholder="Data de Nascimento"
                    value={formData.nascimento}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="telefone"
                    placeholder="Telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    icon={Phone}
                  />
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full bg-brand-dark border border-brand-border rounded px-3 py-2 text-brand-text focus:outline-none focus:border-brand-primary"
                  >
                    <option value="">Selecione Sexo</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={handleNext} className="">
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="cep"
                    placeholder="CEP"
                    value={formData.cep}
                    onChange={handleChange}
                    icon={MapPin}
                  />
                  <Input
                    name="logradouro"
                    placeholder="Logradouro"
                    value={formData.logradouro}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    name="numero"
                    placeholder="Número"
                    value={formData.numero}
                    onChange={handleChange}
                  />
                  <div className="md:col-span-2">
                    <Input
                      name="complemento"
                      placeholder="Complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    name="bairro"
                    placeholder="Bairro"
                    value={formData.bairro}
                    onChange={handleChange}
                  />
                  <Input
                    name="localidade"
                    placeholder="Cidade"
                    value={formData.localidade}
                    onChange={handleChange}
                  />
                  <Input
                    name="uf"
                    placeholder="UF"
                    value={formData.uf}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-brand-border text-brand-muted hover:bg-brand-dark"
                  >
                    Voltar
                  </Button>
                  <Button type="button" onClick={handleNext} className="">
                    Próximo
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  name="email"
                  type="email"
                  placeholder="E-mail *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon={Mail}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    name="password"
                    type="password"
                    placeholder="Senha *"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    icon={Lock}
                  />
                  <Input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirmar Senha *"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    icon={Lock}
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-brand-border text-brand-muted hover:bg-brand-dark"
                  >
                    Voltar
                  </Button>
                  <Button type="submit" disabled={loading} className="">
                    {loading ? "Cadastrando..." : "Finalizar Cadastro"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
