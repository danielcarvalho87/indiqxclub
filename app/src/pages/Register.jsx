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
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { maskCPF, maskPhone, maskCEP } from "../utils/masks";
import { API_URL, GET_CONFIGURACAO_PUBLICA } from "../api";
import logoIndiqx from "../assets/LOGO-INDIQX.svg";

const MIN_PASSWORD_LENGTH = 8;

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const refId = queryParams.get("ref");

  const [loading, setLoading] = useState(false);
  const [registerToken, setRegisterToken] = useState(null);
  const [step, setStep] = useState(1); // 1: Pessoais, 2: Endereço, 3: Acesso
  const [empresaNome, setEmpresaNome] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    // level e status nao sao enviados: o servidor sempre cria o cadastro
    // como Parceiro/Inativo. Envia-los faria a API rejeitar a requisicao.
    master_id: refId ? Number(refId) : 0,
  });

  useEffect(() => {
    // Redirecionar para o login se não houver refId
    if (!refId) {
      toast.error(
        "Link de cadastro inválido. ID do administrador não encontrado.",
      );
      navigate("/login");
      return;
    }

    fetchRegisterToken();
    if (refId) {
      fetchEmpresaConfig(refId);
    }
  }, [refId, navigate]);

  const fetchEmpresaConfig = async (masterId) => {
    try {
      // Rota pública: expõe apenas o nome da empresa
      const { url, options } = GET_CONFIGURACAO_PUBLICA(masterId);
      const response = await fetch(url, options);
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
        setRegisterToken(data.access_token);
        return data.access_token;
      }
      toast.error("Erro ao iniciar sessão de cadastro.");
    } catch (error) {
      console.error("Erro ao buscar token:", error);
      toast.error("Erro de conexão.");
    }
    return null;
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

    if (formData.password.length < MIN_PASSWORD_LENGTH) {
      toast.error(
        `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
      );
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...dataToSend } = formData;

      const enviar = (token) =>
        fetch(`${API_URL}/public/user/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSend),
        });

      let token = registerToken || (await fetchRegisterToken());
      if (!token) {
        toast.error("Não foi possível iniciar o cadastro. Tente novamente.");
        return;
      }

      let response = await enviar(token);

      // O token de cadastro expira em 30 minutos; se o formulário ficou
      // aberto por mais tempo, pega um novo e tenta uma única vez.
      if (response.status === 401) {
        token = await fetchRegisterToken();
        if (token) {
          response = await enviar(token);
        }
      }

      if (response.ok) {
        toast.success("Cadastro realizado com sucesso!");
        toast.info("Verifique seu e-mail para validar sua conta.");
        navigate("/");
      } else {
        const errorData = await response.json().catch(() => ({}));
        const detalhe = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
        toast.error(detalhe || "Erro ao realizar cadastro.");
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
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Senha *"
                      value={formData.password}
                      onChange={handleChange}
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-primary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirmar Senha *"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-primary"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-brand-muted">
                  A senha deve ter no mínimo {MIN_PASSWORD_LENGTH} caracteres.
                </p>
                {formData.confirmPassword &&
                  formData.password !== formData.confirmPassword && (
                    <p className="text-red-500 text-sm">
                      As senhas não coincidem.
                    </p>
                  )}
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
