import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Check,
  Gift,
  Lock,
  MessageCircle,
  Play,
  X,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useModalDismiss } from "../hooks/useModalDismiss";
import logoIndiqx from "../assets/indiqx-logo-w.png";

/**
 * Landing page pública.
 *
 * Sem bibliotecas de animação, sem imagens além da logo e sem chamadas à
 * API: tudo é HTML, Tailwind e um único estado de React para o seletor de
 * ciclo. Os preços espelham o catálogo semeado em
 * api/scripts/2026_09_create_planos_e_assinaturas.sql — o endpoint de
 * planos é restrito ao FullAdmin e não pode ser consumido aqui.
 */

// O número não aparece em lugar nenhum da página: todo contato passa
// pelo link do WhatsApp, que já leva a conversa aberta.
const WHATSAPP_NUMERO = "5583998497422";

// Demonstração em vídeo. O iframe só é montado quando o modal abre: um
// player do YouTube na carga inicial custaria mais que a página inteira.
const VIDEO_ID = "7HyGmCFlPl4";
// maxresdefault é o único 16:9 deste vídeo; o hqdefault vem 4:3 com
// tarjas pretas e ficaria cortado no cartão.
const VIDEO_CAPA = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

function linkWhatsApp(mensagem) {
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagem)}`;
}

const beneficios = [
  {
    icon: Users,
    titulo: "Carteira de clientes organizada",
    texto:
      "Cadastro completo com endereço, contato e histórico. Cada cliente fica vinculado ao parceiro que indicou, sem planilha paralela e sem indicação duplicada.",
  },
  {
    icon: Share2,
    titulo: "Rede de parceiros com link próprio",
    texto:
      "Cada empresa tem um link público de cadastro. O parceiro se inscreve sozinho, confirma o e-mail e entra na sua base aguardando aprovação.",
  },
  {
    icon: TrendingUp,
    titulo: "Comissão calculada sozinha",
    texto:
      "Você define o percentual por venda e a plataforma aplica em todo contrato fechado. O parceiro acompanha o próprio ganho sem precisar perguntar.",
  },
  {
    icon: Star,
    titulo: "Pontuação configurável",
    texto:
      "Pontos por indicação e pontos por real faturado, ajustáveis a qualquer momento. A regra é a mesma para todo mundo e fica visível na tela do parceiro.",
  },
  {
    icon: Gift,
    titulo: "Bonificações que engajam",
    texto:
      "Crie metas com prêmio, valor e prazo. A trilha de conquistas mostra ao parceiro quanto falta para a próxima recompensa.",
  },
  {
    icon: BarChart3,
    titulo: "Relatórios de verdade",
    texto:
      "Faturamento, conversão, ranking de parceiros e evolução mês a mês. Os números saem da mesma base que o parceiro enxerga.",
  },
  {
    icon: Lock,
    titulo: "Acesso por nível",
    texto:
      "Administrador enxerga a empresa inteira. O parceiro enxerga apenas os próprios clientes e ganhos, na tela e também na API.",
  },
  {
    icon: ShieldCheck,
    titulo: "Contas verificadas",
    texto:
      "Confirmação de e-mail com link de 24 horas, aprovação manual do cadastro e sessão que expira sozinha depois de trinta minutos parada.",
  },
];

const passos = [
  {
    numero: "01",
    titulo: "Configure sua empresa",
    texto:
      "Nome, CNPJ, percentual de comissão e as duas regras de pontuação. Leva poucos minutos e vale para toda a operação.",
  },
  {
    numero: "02",
    titulo: "Convide seus parceiros",
    texto:
      "Compartilhe o link de cadastro. Cada inscrição chega para sua aprovação, com e-mail já confirmado.",
  },
  {
    numero: "03",
    titulo: "Receba as indicações",
    texto:
      "O parceiro cadastra o cliente e acompanha o andamento. Você atualiza o status até o contrato fechar.",
  },
  {
    numero: "04",
    titulo: "Pague o que foi combinado",
    texto:
      "Comissão e pontos já calculados, com relatório por parceiro e por período. Sem discussão sobre número.",
  },
];

const planos = [
  {
    nome: "Start",
    parceiros: "até 10 parceiros",
    mensal: 127,
    anual: 1270,
    extra: 19,
    resumo: "Primeira equipe formada e operação em ritmo.",
    recursos: [
      "Bonificações e trilha de conquistas",
      "Relatórios por período",
      "Link público de cadastro",
    ],
  },
  {
    nome: "Growth",
    parceiros: "até 30 parceiros",
    mensal: 297,
    anual: 2970,
    extra: 14,
    destaque: true,
    resumo: "O mais escolhido por quem já vive de indicação.",
    recursos: [
      "Tudo do Start",
      "Ranking de parceiros",
      "Relatórios completos de faturamento",
      "Suporte prioritário",
    ],
  },
  {
    nome: "Scale",
    parceiros: "até 100 parceiros",
    mensal: 697,
    anual: 6970,
    extra: 9,
    resumo: "Operação consolidada, com várias frentes ativas.",
    recursos: [
      "Tudo do Growth",
      "Menor custo por parceiro extra",
      "Acompanhamento de metas por equipe",
    ],
  },
  {
    nome: "Enterprise",
    parceiros: "parceiros ilimitados",
    mensal: null,
    anual: null,
    extra: null,
    resumo: "Sem teto de parceiros e com condições negociadas.",
    recursos: [
      "Tudo do Scale",
      "Volume ilimitado de parceiros",
      "Condição comercial sob medida",
    ],
  },
];

const perguntas = [
  {
    pergunta: "Preciso instalar alguma coisa?",
    resposta:
      "Não. A plataforma roda no navegador, no computador e no celular. Seus parceiros acessam pelo mesmo endereço.",
  },
  {
    pergunta: "O parceiro consegue ver os clientes dos outros?",
    resposta:
      "Não. Cada parceiro enxerga apenas os clientes que ele mesmo indicou, tanto na tela quanto nas consultas à API.",
  },
  {
    pergunta: "Como funciona o limite de parceiros do plano?",
    resposta:
      "O limite conta apenas parceiros ativos. Cadastros aguardando aprovação não ocupam vaga, e ao chegar no teto é só subir de plano.",
  },
  {
    pergunta: "Posso mudar as regras de pontuação depois?",
    resposta:
      "Pode, a qualquer momento, em Configurações. A nova regra passa a valer para os cálculos seguintes.",
  },
  {
    pergunta: "Como faço para começar?",
    resposta:
      "Fale com a gente pelo WhatsApp. Criamos sua conta de administrador e configuramos a empresa junto com você.",
  },
];

function formatarPreco(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor);
}

/** Modal do vídeo de demonstração. */
const VideoModal = ({ aberto, onClose }) => {
  const { backdropRef, onBackdropMouseDown, onBackdropClick } = useModalDismiss(
    aberto,
    onClose,
  );

  if (!aberto) return null;

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropMouseDown}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Demonstração do IndiqX Club"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-4xl">
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <X size={16} />
            Fechar
          </button>
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-[24px] border border-white/10 bg-black shadow-[0_40px_90px_-30px_rgba(76,130,255,0.55)]">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&rel=0`}
            title="Demonstração do IndiqX Club"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [anual, setAnual] = useState(false);
  const [videoAberto, setVideoAberto] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-brand-dark font-sans text-brand-text">
      <div
        aria-hidden="true"
        className="malha pointer-events-none absolute inset-x-0 top-0 h-[42rem]"
      />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white"
      >
        Pular para o conteúdo
      </a>

      <header className="sticky top-0 z-50 bg-brand-dark/80 backdrop-blur-xl after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-brand-primary/35 after:to-transparent">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <img
            src={logoIndiqx}
            alt="IndiqX Club"
            className="h-7 w-auto md:h-8"
            width="112"
            height="32"
          />

          <nav className="hidden items-center gap-7 text-sm text-brand-muted lg:flex">
            <a
              className="transition-colors hover:text-brand-text"
              href="#beneficios"
            >
              Benefícios
            </a>
            <a
              className="transition-colors hover:text-brand-text"
              href="#como-funciona"
            >
              Como funciona
            </a>
            <a
              className="transition-colors hover:text-brand-text"
              href="#planos"
            >
              Planos
            </a>
            <a
              className="transition-colors hover:text-brand-text"
              href="#duvidas"
            >
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-text"
            >
              Entrar
            </Link>
            <a
              href={linkWhatsApp(
                "Olá! Quero conhecer o IndiqX Club para a minha empresa.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 transition-all duration-200 hover:shadow-brand-primary/40 hover:brightness-110"
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Falar no WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main id="conteudo">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="brilho-lento absolute left-1/2 top-[-20rem] h-[34rem] w-[34rem] rounded-full bg-brand-primary/25 blur-[130px]" />
            <div
              className="brilho-lento absolute left-[18%] top-[6rem] h-[20rem] w-[20rem] rounded-full bg-brand-secondary/15 blur-[110px]"
              style={{ animationDelay: "3s" }}
            />
          </div>
          <div className="relative mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
            <span className="revelar inline-flex items-center gap-2 rounded-full border border-brand-primary/30 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-primary shadow-[0_0_30px_rgba(76,130,255,0.15)]">
              <Sparkles size={14} />
              Club de benefícios para redes de indicação
            </span>

            <h1
              className="revelar mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl"
              style={{ animationDelay: "80ms" }}
            >
              Transforme indicação em{" "}
              <span className="relative whitespace-nowrap bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-hover bg-clip-text text-transparent">
                receita previsível
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-2 h-px bg-gradient-to-r from-transparent via-brand-primary/60 to-transparent"
                />
              </span>
            </h1>

            <p
              className="revelar mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted md:text-xl"
              style={{ animationDelay: "160ms" }}
            >
              O IndiqX Club organiza sua rede de parceiros, calcula comissão e
              pontuação sozinho e mostra a cada indicador exatamente quanto ele
              já ganhou. Sem planilha, sem cobrança de número.
            </p>

            <div
              className="revelar mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <button
                type="button"
                onClick={() => setVideoAberto(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-12px_rgba(76,130,255,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
              >
                <Play size={18} />
                Ver a demonstração
              </button>
              <a
                href={linkWhatsApp(
                  "Olá! Quero uma demonstração do IndiqX Club.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-7 py-3.5 text-base font-semibold text-brand-text backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-white/[0.06] sm:w-auto"
              >
                <MessageCircle size={18} />
                Falar no WhatsApp
              </a>
            </div>

            <dl
              className="revelar mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4"
              style={{ animationDelay: "320ms" }}
            >
              {[
                ["Comissão", "calculada sozinha"],
                ["Pontos", "por indicação e por venda"],
                ["Painel", "para cada parceiro"],
                ["Acesso", "separado por nível"],
              ].map(([titulo, texto]) => (
                <div
                  key={titulo}
                  className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.06] to-transparent px-4 py-4 transition-colors hover:border-brand-primary/30"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"
                  />
                  <dt className="text-sm font-semibold text-brand-text">
                    {titulo}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-brand-muted">
                    {texto}
                  </dd>
                </div>
              ))}
            </dl>

            <div
              className="revelar mx-auto mt-14 max-w-3xl"
              style={{ animationDelay: "400ms" }}
            >
              <button
                type="button"
                onClick={() => setVideoAberto(true)}
                aria-label="Assistir à demonstração do IndiqX Club"
                className="group relative block w-full overflow-hidden rounded-[28px] border border-white/8 bg-brand-surface p-px text-left shadow-[0_40px_90px_-45px_rgba(76,130,255,0.8)] transition-transform duration-200 hover:-translate-y-1"
              >
                <span className="relative block overflow-hidden rounded-[27px]">
                  <img
                    src={VIDEO_CAPA}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="1280"
                    height="720"
                    className="aspect-video w-full object-cover opacity-80 transition-all duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/35 to-transparent"
                  />
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-[0_16px_40px_-10px_rgba(76,130,255,0.9)] transition-transform duration-200 group-hover:scale-110">
                      <Play size={26} className="ml-1" fill="currentColor" />
                    </span>
                    <span className="text-sm font-semibold text-brand-text">
                      Veja a plataforma funcionando
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section
          id="beneficios"
          className="scroll-mt-20 border-b border-white/5 py-16 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="max-w-2xl">
              <span
                aria-hidden="true"
                className="block h-px w-20 bg-gradient-to-r from-brand-primary to-transparent"
              />
              <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
                Tudo que a sua rede precisa,{" "}
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  em um lugar só
                </span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-brand-muted">
                Cada recurso existe para tirar trabalho manual da sua mesa e dar
                confiança para quem indica.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {beneficios.map(({ icon: Icone, titulo, texto }) => (
                <article
                  key={titulo}
                  className="borda-gradiente group rounded-[25px] p-px transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="h-full rounded-[24px] bg-brand-surface p-6 transition-colors duration-200 group-hover:bg-brand-surfaceAlt">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/25 to-brand-primary/5 text-brand-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-transform duration-200 group-hover:scale-105">
                    <Icone size={22} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold leading-snug">
                    {titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    {texto}
                  </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="scroll-mt-20 border-b border-white/5 bg-gradient-to-b from-brand-surface/40 via-transparent to-transparent py-16 md:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="max-w-2xl">
              <span
                aria-hidden="true"
                className="block h-px w-20 bg-gradient-to-r from-brand-primary to-transparent"
              />
              <h2 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">
                Do convite ao pagamento em{" "}
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  quatro passos
                </span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-brand-muted">
                A operação inteira cabe em uma rotina simples, repetida todo
                mês.
              </p>
            </div>

            <ol className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              {passos.map(({ numero, titulo, texto }) => (
                <li
                  key={numero}
                  className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-brand-surface p-6 transition-colors hover:border-brand-primary/30"
                >
                  <span
                    aria-hidden="true"
                    className="absolute right-4 top-2 select-none bg-gradient-to-b from-white/[0.07] to-transparent bg-clip-text text-6xl font-black text-transparent"
                  >
                    {numero}
                  </span>
                  <span className="relative text-sm font-bold tracking-widest text-brand-primary">
                    {numero}
                  </span>
                  <h3 className="mt-3 text-lg font-bold leading-snug">
                    {titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">
                    {texto}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Para quem é */}
        <section className="border-b border-white/5 py-16 md:py-24">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:px-6 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-br from-brand-surface via-brand-surface to-brand-primary/10 p-7 md:p-9">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-brand-primary/10 blur-[90px]"
              />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary/25 to-brand-primary/5 text-brand-primary">
                <Target size={22} />
              </span>
              <h3 className="mt-5 text-2xl font-bold">Para a sua empresa</h3>
              <p className="mt-3 text-brand-muted">
                Você administra a rede inteira e enxerga o resultado sem
                depender de ninguém.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-brand-muted">
                {[
                  "Painel com faturamento, conversão e ranking de parceiros",
                  "Aprovação de cadastros e controle de quem está ativo",
                  "Regras de comissão e pontuação definidas por você",
                  "Relatórios por período, prontos para fechar o mês",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check
                      size={18}
                      className="mt-0.5 shrink-0 text-brand-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-bl from-brand-surface via-brand-surface to-brand-secondary/10 p-7 md:p-9">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[-6rem] top-[-6rem] h-64 w-64 rounded-full bg-brand-secondary/10 blur-[90px]"
              />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-secondary/25 to-brand-secondary/5 text-brand-secondary">
                <UserCheck size={22} />
              </span>
              <h3 className="mt-5 text-2xl font-bold">Para o seu parceiro</h3>
              <p className="mt-3 text-brand-muted">
                Quem indica acompanha o próprio resultado e sabe exatamente o
                que vai receber.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-brand-muted">
                {[
                  "Tela de ganhos com comissão estimada e pontos acumulados",
                  "Cadastro de clientes em poucos campos, pelo celular",
                  "Trilha de conquistas mostrando a próxima bonificação",
                  "Acesso restrito aos próprios dados, sempre",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <Check
                      size={18}
                      className="mt-0.5 shrink-0 text-brand-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* Planos */}
        <section
          id="planos"
          className="relative scroll-mt-20 overflow-hidden border-b border-white/5 py-16 md:py-24"
        >
          <div
            aria-hidden="true"
            className="brilho-lento pointer-events-none absolute left-1/2 top-10 h-[26rem] w-[46rem] -translate-x-1/2 rounded-full bg-brand-primary/10 blur-[130px]"
          />
          <div className="relative mx-auto max-w-6xl px-4 md:px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Planos que acompanham{" "}
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  o tamanho da sua rede
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand-muted">
                O limite conta apenas parceiros ativos. Cadastro aguardando
                aprovação não ocupa vaga.
              </p>

              <div
                role="group"
                aria-label="Ciclo de cobrança"
                className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/8 bg-brand-surface/80 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur"
              >
                <button
                  type="button"
                  onClick={() => setAnual(false)}
                  aria-pressed={!anual}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    anual
                      ? "text-brand-muted hover:text-brand-text"
                      : "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25"
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setAnual(true)}
                  aria-pressed={anual}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    anual
                      ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25"
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  Anual
                  <span className="ml-2 text-xs font-bold text-emerald-400">
                    2 meses grátis
                  </span>
                </button>
              </div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {planos.map((plano) => {
                const preco = anual ? plano.anual : plano.mensal;
                const negociado = preco === null;

                return (
                  <article
                    key={plano.nome}
                    className={`group relative flex flex-col rounded-[26px] p-px transition-transform duration-200 hover:-translate-y-1.5 ${
                      plano.destaque
                        ? "bg-gradient-to-b from-brand-primary via-brand-primary/40 to-brand-secondary/20 shadow-[0_30px_70px_-25px_rgba(76,130,255,0.75)] lg:-my-3"
                        : "borda-gradiente"
                    }`}
                  >
                    <div
                      className={`flex h-full flex-col rounded-[25px] p-6 ${
                        plano.destaque
                          ? "bg-gradient-to-b from-brand-surfaceAlt to-brand-surface"
                          : "bg-brand-surface"
                      }`}
                    >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold">{plano.nome}</h3>
                      {plano.destaque && (
                        <span className="rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-lg shadow-brand-primary/30">
                          Mais escolhido
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-brand-muted">
                      {plano.parceiros}
                    </p>

                    <p className="mt-5 flex items-baseline gap-1.5">
                      {negociado ? (
                        <span className="text-2xl font-extrabold">
                          Sob consulta
                        </span>
                      ) : (
                        <>
                          <span className="bg-gradient-to-br from-white to-brand-muted bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                            {formatarPreco(preco)}
                          </span>
                          <span className="text-sm text-brand-muted">
                            {anual ? "/ano" : "/mês"}
                          </span>
                        </>
                      )}
                    </p>

                    <p className="mt-2 min-h-[2.5rem] text-xs leading-relaxed text-brand-muted">
                      {plano.extra
                        ? `Parceiro extra por ${formatarPreco(plano.extra)}.`
                        : plano.resumo}
                    </p>

                    <ul className="mt-5 flex-1 space-y-2.5 text-sm text-brand-muted">
                      {plano.recursos.map((recurso) => (
                        <li key={recurso} className="flex gap-2.5">
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-brand-primary"
                          />
                          <span>{recurso}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={linkWhatsApp(
                        `Olá! Tenho interesse no plano ${plano.nome} do IndiqX Club${
                          negociado ? "" : anual ? " (anual)" : " (mensal)"
                        }.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                        plano.destaque
                          ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25 hover:brightness-110"
                          : "border border-white/10 text-brand-text hover:border-brand-primary/40 hover:bg-white/5"
                      }`}
                    >
                      <MessageCircle size={16} />
                      Contratar pelo WhatsApp
                    </a>
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="mt-8 text-center text-sm text-brand-muted">
              Precisa de algo diferente?{" "}
              <a
                href={linkWhatsApp(
                  "Olá! Quero avaliar uma condição sob medida no IndiqX Club.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brand-primary transition-colors hover:text-brand-hover"
              >
                Chame no WhatsApp
              </a>{" "}
              e montamos a condição sob medida.
            </p>
          </div>
        </section>

        {/* Dúvidas */}
        <section
          id="duvidas"
          className="scroll-mt-20 border-b border-white/5 py-16 md:py-24"
        >
          <div className="mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Perguntas{" "}
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                frequentes
              </span>
            </h2>

            <div className="mt-10 space-y-3">
              {perguntas.map(({ pergunta, resposta }) => (
                <details
                  key={pergunta}
                  className="group rounded-[22px] border border-white/5 bg-gradient-to-b from-brand-surface to-brand-surface/60 px-5 py-4 transition-colors hover:border-brand-primary/25 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-brand-text">
                    {pergunta}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-lg leading-none text-brand-primary transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                    {resposta}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="relative overflow-hidden rounded-[32px] border border-brand-primary/25 bg-gradient-to-br from-brand-surfaceAlt via-brand-surface to-brand-primary/15 px-6 py-12 text-center shadow-[0_40px_90px_-40px_rgba(76,130,255,0.6)] md:px-12 md:py-16">
              <div
                aria-hidden="true"
                className="brilho-lento pointer-events-none absolute left-1/2 top-[-12rem] h-[24rem] w-[24rem] rounded-full bg-brand-primary/25 blur-[110px]"
              />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                  Comece hoje com a sua rede de indicação
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-brand-muted">
                  A gente configura a sua empresa junto com você e sua equipe já
                  entra indicando.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={linkWhatsApp(
                      "Olá! Quero começar a usar o IndiqX Club.",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_40px_-12px_rgba(76,130,255,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 sm:w-auto"
                  >
                    <MessageCircle size={18} />
                    Falar no WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => setVideoAberto(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 px-7 py-3.5 text-base font-semibold text-brand-text transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-primary/40 hover:bg-white/5 sm:w-auto"
                  >
                    <Play size={18} />
                    Ver a demonstração
                  </button>
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold text-brand-muted transition-colors hover:text-brand-text sm:w-auto"
                  >
                    Já sou cliente
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/5 bg-brand-surface before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-brand-primary/30 before:to-transparent">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 md:flex-row md:justify-between md:px-6">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <img
              src={logoIndiqx}
              alt="IndiqX Club"
              className="h-7 w-auto"
              width="98"
              height="28"
            />
            <p className="text-sm text-brand-muted">
              Gestão de indicações, comissões e premiações.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 text-sm text-brand-muted md:items-end">
            <a
              href={linkWhatsApp("Olá! Vim pelo site do IndiqX Club.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-semibold text-brand-text transition-colors hover:text-brand-primary"
            >
              <MessageCircle size={16} />
              Atendimento no WhatsApp
            </a>
            <p>
              &copy; {new Date().getFullYear()} IndiqX Club. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </footer>

      <VideoModal aberto={videoAberto} onClose={() => setVideoAberto(false)} />

      {/* Atalho fixo no mobile, onde o header encolhe */}
      <a
        href={linkWhatsApp("Olá! Quero conhecer o IndiqX Club.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-[0_14px_35px_-10px_rgba(76,130,255,0.9)] transition-transform duration-200 hover:scale-110 lg:hidden"
      >
        <MessageCircle size={24} />
      </a>
    </div>
  );
};

export default Home;
