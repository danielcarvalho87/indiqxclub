import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { GET_CONFIGURACOES, POST_CONFIGURACAO, PUT_CONFIGURACAO } from "../api";
import { useAuth } from "../hooks/useAuth";

const Configuracoes = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [configId, setConfigId] = useState(null);

  const [formData, setFormData] = useState({
    nomeEmpresa: "",
    cnpj: "",
    pontosPorNovoUsuario: "",
    comissaoPorVenda: "",
  });

  useEffect(() => {
    fetchConfiguracoes();
  }, [userId]);

  const fetchConfiguracoes = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_CONFIGURACOES(userId, token);
      const response = await fetch(url, options);

      if (response.ok) {
        const json = await response.json();
        if (json && json.length > 0) {
          const config = json[0];
          setConfigId(config.id);
          setFormData({
            nomeEmpresa: config.nomeEmpresa || "",
            cnpj: config.cnpj || "",
            pontosPorNovoUsuario: config.pontosPorNovoUsuario || "",
            comissaoPorVenda: config.comissaoPorVenda || "",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = window.localStorage.getItem("token");
      const payload = {
        masterId: Number(userId),
        nomeEmpresa: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        pontosPorNovoUsuario: Number(formData.pontosPorNovoUsuario),
        comissaoPorVenda: Number(formData.comissaoPorVenda),
      };

      let response;
      if (configId) {
        const { url, options } = PUT_CONFIGURACAO(configId, payload, token);
        response = await fetch(url, options);
      } else {
        const { url, options } = POST_CONFIGURACAO(payload, token);
        response = await fetch(url, options);
      }

      if (response.ok) {
        const json = await response.json();
        if (!configId && json.id) setConfigId(json.id);
        toast.success("Configurações salvas com sucesso!");
      } else {
        const err = await response.json();
        toast.error(err.message || "Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro de conexão ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-brand-primary">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Configurações do Sistema
          </h1>
          <p className="mt-1 text-sm text-brand-text/60">
            Gerencie as regras de pontuação e comissão da sua empresa
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-text/90">
                Nome da Empresa
              </label>
              <Input
                name="nomeEmpresa"
                value={formData.nomeEmpresa}
                onChange={handleChange}
                placeholder="Ex: Minha Empresa LTDA"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-text/90">
                CNPJ
              </label>
              <Input
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                placeholder="00.000.000/0000-00"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-text/90">
                Pontos por Novo Usuário/Cliente
              </label>
              <Input
                type="number"
                name="pontosPorNovoUsuario"
                value={formData.pontosPorNovoUsuario}
                onChange={handleChange}
                placeholder="Ex: 100"
                min="0"
                required
              />
              <p className="mt-1 text-xs text-brand-text/50">
                Quantidade de pontos que um parceiro ganha ao indicar um novo
                cliente
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-brand-text/90">
                Comissão por Venda (%)
              </label>
              <Input
                type="number"
                name="comissaoPorVenda"
                value={formData.comissaoPorVenda}
                onChange={handleChange}
                placeholder="Ex: 5.5"
                step="0.01"
                min="0"
                required
              />
              <p className="mt-1 text-xs text-brand-text/50">
                Porcentagem de comissão paga aos parceiros por venda concluída
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Configuracoes;
