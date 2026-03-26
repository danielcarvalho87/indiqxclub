import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { ArrowRight, Star, TrendingUp, Users, ShieldCheck } from "lucide-react";
import logoIndiqx from "../assets/indiqx-logo-w.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col font-sans text-brand-text">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between bg-brand-surface border-b border-brand-border sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src={logoIndiqx} alt="Indiqx" className="h-8" />
        </div>
        <div className="flex gap-4 items-center">
          <Button
            onClick={() => navigate("/login")}
            variant="ghost"
            className="text-sm"
          >
            Entrar
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center text-center px-4 pt-10 pb-16">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div className="inline-block bg-brand-primary/10 border border-brand-primary/20 text-brand-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide mb-4">
            O CLUB DE BENEFÍCIOS EXCLUSIVO INDIQX
          </div>
          <h2 className="text-5xl md:text-6xl font-extrabold text-brand-text leading-tight">
            Valorize suas vendas. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
              Multiplique seus ganhos.
            </span>
          </h2>
          <p className="text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
            Uma plataforma para parceiros que buscam gestão eficiente, comissões
            transparentes e premiações reais.
          </p>
        </div>

        {/* Features Section */}
        <div className="max-w-6xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          <div className="bg-brand-surface p-8 rounded-2xl border border-brand-border text-left hover:border-brand-primary/50 transition-colors group">
            <div className="bg-brand-primary/10 w-14 h-14 rounded-xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-1">
              Gestão de Clientes
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Acompanhe sua carteira de clientes de ponta a ponta com facilidade
              e organização.
            </p>
          </div>

          <div className="bg-brand-surface p-8 rounded-2xl border border-brand-border text-left hover:border-brand-primary/50 transition-colors group">
            <div className="bg-brand-primary/10 w-14 h-14 rounded-xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">
              Controle de Ganhos
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Visualize suas comissões, relatórios de vendas e metas alcançadas
              em tempo real.
            </p>
          </div>

          <div className="bg-brand-surface p-8 rounded-2xl border border-brand-border text-left hover:border-brand-primary/50 transition-colors group">
            <div className="bg-brand-primary/10 w-14 h-14 rounded-xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
              <Star size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">
              Premiações Reais
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Acumule pontos e conquiste bonificações exclusivas no nosso club
              de benefícios.
            </p>
          </div>

          <div className="bg-brand-surface p-8 rounded-2xl border border-brand-border text-left hover:border-brand-primary/50 transition-colors group">
            <div className="bg-brand-primary/10 w-14 h-14 rounded-xl flex items-center justify-center text-brand-primary mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-brand-text mb-3">
              Transparência
            </h3>
            <p className="text-brand-muted leading-relaxed">
              Sistema seguro e auditável, garantindo que todo o seu esforço seja
              devidamente recompensado.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-surface border-t border-brand-border py-8 text-center mt-auto">
        <p className="text-brand-muted text-sm">
          &copy; {new Date().getFullYear()} Indiqx - Todos os direitos
          reservados.
        </p>
      </footer>
    </div>
  );
};

export default Home;
