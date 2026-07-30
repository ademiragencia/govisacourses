import { r as __toESM } from "../_runtime.mjs";
import { M as require_react, h as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as MapPin, c as Languages, d as CalendarDays, f as Building2, i as MessageCircle, l as Earth, m as ArrowUpRight, n as Scale, o as Lock, p as BadgeDollarSign, r as Play, s as Laptop, t as ShieldCheck, u as Check } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CJVqVKu-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WHATSAPP_MESSAGE = "Olá! Vim pela landing do Curso Paralegal Presencial em Salvador e quero garantir minha vaga (10× R$ 350 + entrada de R$ 1.000).";
var COURSE = {
	name: "Curso Paralegal Presencial",
	city: "Salvador",
	dateLabel: "Turma de 21 de agosto",
	installments: 10,
	installmentValue: 350,
	entryFee: 1e3,
	totalLabel: "10× R$ 350",
	entryLabel: "entrada de R$ 1.000"
};
function getWhatsAppUrl(message = WHATSAPP_MESSAGE) {
	const n = "".replace(/\D/g, "");
	if (!n) return null;
	return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function WhatsAppCta({ className, label = "Quero garantir minha vaga", message = WHATSAPP_MESSAGE, fullWidth, variant = "primary", size = "lg" }) {
	const href = getWhatsAppUrl(message);
	const classes = cn("inline-flex items-center justify-center gap-2.5 font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wa/50 active:scale-[0.98]", {
		md: "h-11 px-5 text-sm rounded-[var(--radius-md)]",
		lg: "h-13 min-h-[52px] px-6 text-[0.95rem] rounded-[var(--radius-md)]"
	}[size], {
		primary: "bg-wa text-white shadow-[0_10px_30px_rgba(31,158,87,0.28)] hover:bg-wa-hover hover:-translate-y-px",
		secondary: "bg-fg text-bg hover:bg-cream/90 shadow-[0_10px_28px_rgba(0,0,0,0.25)] hover:-translate-y-px",
		ghost: "bg-transparent text-fg border border-border-strong hover:bg-white/5"
	}[variant], fullWidth && "w-full", className);
	if (!href) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href: "#contato",
		className: classes,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
			className: "size-5 shrink-0",
			strokeWidth: 2
		}), label]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
		href,
		target: "_blank",
		rel: "noopener noreferrer",
		className: classes,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, {
			className: "size-5 shrink-0",
			strokeWidth: 2
		}), label]
	});
}
function Header() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-lp flex h-16 items-center justify-between gap-4 md:h-[4.25rem]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "#topo",
					className: "flex items-center gap-3",
					"aria-label": "Govisa Courses",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/assets/logo-dark.png",
						alt: "Govisa Courses",
						className: "h-7 w-auto md:h-8"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-6 text-sm text-fg-muted md:flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#oportunidade",
							className: "transition-colors hover:text-fg",
							children: "A oportunidade"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#programa",
							className: "transition-colors hover:text-fg",
							children: "O programa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#investimento",
							className: "transition-colors hover:text-fg",
							children: "Investimento"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#faq",
							className: "transition-colors hover:text-fg",
							children: "Dúvidas"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden text-xs font-medium tracking-wide text-fg-subtle sm:inline",
						children: COURSE.dateLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppCta, {
						size: "md",
						label: "Garantir vaga",
						className: "!h-10 !px-4 !text-sm"
					})]
				})
			]
		})
	});
}
function VslPlayer({ src = "/assets/vsl-v2.mp4", className }) {
	const videoRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const start = (0, import_react.useCallback)(() => {
		const video = videoRef.current;
		if (!video || playing) return;
		setPlaying(true);
		video.controls = true;
		const p = video.play();
		if (p && typeof p.catch === "function") p.catch(() => {
			video.muted = true;
			video.play().catch(() => {
				setPlaying(false);
			});
		});
	}, [playing]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("vsl-frame", playing && "vsl-playing", className),
		role: "button",
		tabIndex: 0,
		"aria-label": "Assistir ao vídeo de apresentação",
		onClick: (e) => {
			const video = videoRef.current;
			if (!video) return;
			if (e.target === video && !video.paused) return;
			if (!playing) start();
		},
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				start();
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: videoRef,
			id: "vsl-video",
			preload: "metadata",
			playsInline: true,
			src,
			className: "bg-black"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "vsl-play",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "vsl-play-btn relative",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-1 size-[34%] fill-white text-white" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "vsl-hint",
				children: "Assista antes de fechar esta página"
			})]
		})]
	});
}
function Hero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "topo",
		className: "relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 grid-fade",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-lp relative",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-fg-muted",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "relative flex size-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inline-flex size-full animate-ping rounded-full bg-brand-red opacity-50" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex size-1.5 rounded-full bg-brand-red" })]
								}),
								COURSE.dateLabel,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg-subtle",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg",
									children: "Últimas vagas"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "display text-[clamp(2.15rem,5.5vw,3.75rem)] text-fg",
							children: [
								"Ganhe ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", {
									className: "not-italic text-brand-red",
									children: "em dólar"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", { className: "hidden sm:block" }),
								" ",
								"trabalhando de dentro da sua casa."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mx-auto mt-5 max-w-2xl text-base leading-relaxed text-fg-muted md:text-lg",
							children: [
								"Paralegal é a profissão que",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
									className: "font-semibold text-fg",
									children: "mais procura brasileiros nos EUA"
								}),
								". Um escritório de advocacia americano vem a Salvador formar a próxima turma — presencialmente. Quem se destaca é contratado."
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mt-10 max-w-[760px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VslPlayer, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto mt-8 flex max-w-xl flex-col items-center gap-4 sm:mt-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-4xl tracking-tight text-fg md:text-5xl",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-wa",
										children: [COURSE.installments, "×"]
									}),
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg-muted text-[0.55em] align-middle font-sans font-semibold",
										children: "R$"
									}),
									COURSE.installmentValue
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-sm text-fg-subtle",
								children: ["+ ", COURSE.entryLabel]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppCta, {
							fullWidth: true,
							className: "max-w-md"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "flex items-center gap-2 text-sm text-fg-subtle",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block size-1.5 rounded-full bg-wa shadow-[0_0_0_3px_rgba(31,158,87,0.2)]" }), "Atendimento humano · respondemos em minutos"]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mx-auto mt-12 grid max-w-3xl gap-3 sm:grid-cols-3",
					children: [
						{
							icon: Building2,
							label: "Escritório de advocacia americano"
						},
						{
							icon: ShieldCheck,
							label: "Certificado internacional"
						},
						{
							icon: BadgeDollarSign,
							label: "Destaques contratados em dólar"
						}
					].map(({ icon: Icon, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border border-border bg-surface/40 px-4 py-3.5 text-center text-sm font-medium text-fg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "size-4 shrink-0 text-wa",
							strokeWidth: 2
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
					}, label))
				})
			]
		})]
	});
}
var points = [
	{
		icon: Scale,
		title: "Demanda real nos EUA",
		body: "Escritórios americanos precisam de profissionais bilíngues para processar imigração, contratos e compliance. O perfil brasileiro se encaixa."
	},
	{
		icon: Languages,
		title: "Português + inglês = diferencial",
		body: "Clientes latinos e operações cross-border valorizam quem navega os dois idiomas e as duas culturas jurídicas."
	},
	{
		icon: Laptop,
		title: "Trabalho remoto em dólar",
		body: "Paralegais formados e contratados podem atuar à distância — com remuneração em moeda forte e rotina de casa."
	},
	{
		icon: Earth,
		title: "Ponte Salvador → mercado americano",
		body: "A formação acontece presencialmente em Salvador, com metodologia e certificação de um escritório dos EUA."
	}
];
function Opportunity() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "oportunidade",
		className: "border-t border-border py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container-lp",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-[0.18em] text-navy-bright",
						children: "Por que agora"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg",
						children: [
							"O mercado americano",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-fg-muted",
								children: "precisa de brasileiros."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-md text-base leading-relaxed text-fg-muted",
						children: "Não é um curso genérico de “trabalhe online”. É formação técnica com um escritório de advocacia americano que vem a Salvador selecionar e preparar a próxima geração de paralegais."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#programa",
						className: "mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-fg transition-colors hover:text-cream",
						children: ["Ver o que você aprende", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-4" })]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: points.map(({ icon: Icon, title, body }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "surface-card rounded-[var(--radius-xl)] p-5 md:p-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-4 flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-border bg-bg-elevated",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5 text-fg",
									strokeWidth: 1.75
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-[0.95rem] font-semibold tracking-tight text-fg",
								children: title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-fg-muted",
								children: body
							})
						]
					}, title))
				})]
			})
		})
	});
}
var modules = [
	{
		num: "01",
		title: "Fundamentos do direito americano",
		body: "Estrutura do sistema jurídico dos EUA, papéis do paralegal e ética profissional no escritório."
	},
	{
		num: "02",
		title: "Prática de imigração e documentação",
		body: "Fluxos de casos, organização de evidências, prazos e comunicação com clientes bilíngues."
	},
	{
		num: "03",
		title: "Operação de escritório moderno",
		body: "Ferramentas, rotinas remotas, gestão de prazos e padrões de qualidade de um firm americano."
	},
	{
		num: "04",
		title: "Posicionamento e contratação",
		body: "Como se destacar na turma, o que o escritório observa e o caminho até a vaga em dólar."
	}
];
var includes = [
	"Formação 100% presencial em Salvador",
	"Instrutores e metodologia de escritório americano",
	"Certificado internacional ao concluir",
	"Acompanhamento dos destaques da turma",
	"Possibilidade real de contratação em dólar",
	"Rede de colegas e mentoria prática"
];
function Program() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "programa",
		className: "border-t border-border py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-lp",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[0.18em] text-navy-bright",
							children: "O programa"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg",
							children: [
								"Formação séria.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg-muted",
									children: "Resultado profissional."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-base leading-relaxed text-fg-muted",
							children: "Conteúdo desenhado para quem quer entrar no mercado jurídico americano com base técnica — não com promessas vazias."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-12 grid gap-3 md:grid-cols-2",
					children: modules.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "group surface-card flex gap-5 rounded-[var(--radius-xl)] p-6 transition-colors hover:border-border-strong",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-3xl leading-none text-fg-subtle/80 transition-colors group-hover:text-navy-bright",
							children: m.num
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold tracking-tight text-fg",
							children: m.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-fg-muted",
							children: m.body
						})] })]
					}, m.num))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 surface-card overflow-hidden rounded-[var(--radius-2xl)]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-[1fr_1.1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border p-7 md:border-b-0 md:border-r md:p-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-2xl text-fg md:text-3xl",
								children: "O que está incluso"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm leading-relaxed text-fg-muted",
								children: "Tudo o que você precisa para sair da formação com clareza de caminho — e com credencial reconhecida."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-0 p-2 sm:grid-cols-2 sm:p-3",
							children: includes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-start gap-3 rounded-[var(--radius-lg)] px-4 py-3.5 text-sm text-fg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-wa/15 text-wa",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										className: "size-3",
										strokeWidth: 3
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
							}, item))
						})]
					})
				})
			]
		})
	});
}
var steps = [
	{
		step: "1",
		title: "Converse com o time",
		body: "Fale no WhatsApp. Entendemos seu momento e se o perfil combina com a turma."
	},
	{
		step: "2",
		title: "Reserve sua vaga",
		body: "Confirme a inscrição com a entrada e o plano de pagamento em 10×."
	},
	{
		step: "3",
		title: "Formação presencial",
		body: "Aulas em Salvador com a metodologia do escritório americano."
	},
	{
		step: "4",
		title: "Destaque e contratação",
		body: "Quem se destaca na turma entra no radar de contratação — em dólar."
	}
];
function Process() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-t border-border py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-lp",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-navy-bright",
					children: "Como funciona"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg",
					children: [
						"Do primeiro contato",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg-muted",
							children: "à oportunidade real."
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4",
				children: steps.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative",
					children: [i < steps.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-[calc(50%+2rem)] top-7 hidden h-px w-[calc(100%-2rem)] bg-border lg:block",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-start gap-4 rounded-[var(--radius-xl)] border border-border bg-surface/30 p-5 md:p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-11 items-center justify-center rounded-full border border-border-strong bg-bg font-display text-xl text-fg",
							children: s.step
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold tracking-tight text-fg",
							children: s.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-relaxed text-fg-muted",
							children: s.body
						})] })]
					})]
				}, s.step))
			})]
		})
	});
}
function Offer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "investimento",
		className: "border-t border-border py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container-lp",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[920px]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[0.18em] text-navy-bright",
							children: "Investimento"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg",
							children: [
								"Transparente.",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-fg-muted",
									children: "Sem surpresa no fim."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-lg text-base text-fg-muted",
							children: "Formação presencial com escritório americano, certificado internacional e caminho claro para quem se destaca."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-12 overflow-hidden rounded-[var(--radius-2xl)] border border-border-strong bg-surface shadow-[var(--shadow-soft)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flag-strip" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-[1.15fr_0.95fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-7 md:p-10",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs font-semibold uppercase tracking-[0.16em] text-fg-subtle",
									children: ["Curso Paralegal · ", COURSE.city]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 font-display text-[clamp(3rem,8vw,4.5rem)] leading-none tracking-tight text-fg",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-wa",
											children: [COURSE.installments, "×"]
										}),
										" R$",
										COURSE.installmentValue
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-base text-fg-muted",
									children: ["+ ", COURSE.entryLabel]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-8 space-y-3 border-t border-border pt-8",
									children: [
										{
											icon: CalendarDays,
											text: `${COURSE.dateLabel} — vagas limitadas`
										},
										{
											icon: MapPin,
											text: `Presencial em ${COURSE.city}`
										},
										{
											icon: Lock,
											text: "Pagamento seguro · suporte humano no WhatsApp"
										}
									].map(({ icon: Icon, text }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-3 text-sm text-fg-muted",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0 text-fg-subtle" }), text]
									}, text))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							id: "contato",
							className: "flex flex-col justify-between gap-6 border-t border-border bg-bg-elevated/80 p-7 md:border-t-0 md:border-l md:p-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-lg font-semibold tracking-tight text-fg",
								children: "Próximo passo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-fg-muted",
								children: "Fale com o time agora. Confirmamos disponibilidade da turma, respondemos suas dúvidas e orientamos a reserva da vaga."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppCta, {
									fullWidth: true,
									label: "Começar pelo WhatsApp"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-center text-xs text-fg-subtle",
									children: "Sem compromisso de inscrição no primeiro contato"
								})]
							})]
						})]
					})]
				})]
			})
		})
	});
}
var faqs = [
	{
		q: "Preciso já morar nos EUA?",
		a: "Não. A formação é presencial em Salvador. A ideia é preparar profissionais no Brasil para atuar com escritórios americanos — inclusive de forma remota, quando contratados."
	},
	{
		q: "Preciso falar inglês fluente?",
		a: "Inglês ajuda e será diferencial. No primeiro contato avaliamos seu momento e orientamos o que é esperado para aproveitar a formação e se candidatar com segurança."
	},
	{
		q: "A contratação é garantida?",
		a: "Não vendemos garantia de emprego. O escritório forma a turma e contrata quem se destaca. Transparência faz parte do nosso compromisso: esforço, presença e desempenho importam."
	},
	{
		q: "O certificado vale no exterior?",
		a: "Você recebe certificado internacional da formação com o escritório americano. É um diferencial de credibilidade no currículo e no processo seletivo."
	},
	{
		q: "Como funciona o pagamento?",
		a: `Entrada de R$ 1.000 e o restante em 10× de R$ 350. No WhatsApp detalhamos as formas de pagamento e confirmamos a reserva da vaga.`
	},
	{
		q: "Para quem é essa turma?",
		a: "Para quem busca uma profissão com demanda real no mercado americano, quer ganhar em dólar e está disposto a se dedicar a uma formação presencial séria — mesmo sem formação jurídica prévia."
	}
];
function Faq() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "faq",
		className: "border-t border-border py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-lp",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-2xl text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold uppercase tracking-[0.18em] text-navy-bright",
					children: "Dúvidas frequentes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "display mt-3 text-[clamp(1.85rem,3.5vw,2.75rem)] text-fg",
					children: [
						"Respostas diretas.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-fg-muted",
							children: "Sem enrolação."
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-12 max-w-2xl space-y-2",
				children: faqs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
					className: "faq-item group rounded-[var(--radius-lg)] border border-border bg-surface/40 open:bg-surface",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
						className: "flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-[0.95rem] font-semibold tracking-tight text-fg md:px-6 md:py-5",
						children: [item.q, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "faq-chevron shrink-0 text-fg-subtle transition-transform duration-200",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								width: "18",
								height: "18",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								strokeWidth: "2",
								strokeLinecap: "round",
								strokeLinejoin: "round",
								"aria-hidden": true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "m6 9 6 6 6-6" })
							})
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "border-t border-border px-5 pb-5 pt-3 text-sm leading-relaxed text-fg-muted md:px-6 md:pb-6",
						children: item.a
					})]
				}, item.q))
			})]
		})
	});
}
function FinalCta() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: "border-t border-border py-20 md:py-28",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "container-lp",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-[var(--radius-2xl)] border border-border-strong bg-surface px-6 py-14 text-center md:px-12 md:py-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-0 opacity-70",
					style: { background: "radial-gradient(600px 280px at 50% 0%, rgba(13,58,110,0.35), transparent 70%)" },
					"aria-hidden": true
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-semibold uppercase tracking-[0.18em] text-fg-subtle",
							children: [
								COURSE.dateLabel,
								" · ",
								COURSE.city
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "display mt-4 text-[clamp(1.9rem,4vw,3rem)] text-fg",
							children: [
								"Sua próxima carreira",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"pode começar em Salvador."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-md text-base leading-relaxed text-fg-muted",
							children: "Assista ao vídeo, tire suas dúvidas e reserve sua vaga enquanto a turma ainda está aberta."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto mt-8 flex max-w-sm flex-col items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppCta, {
								fullWidth: true,
								label: "Falar com o time agora"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-fg-subtle",
								children: [
									COURSE.totalLabel,
									" + ",
									COURSE.entryLabel
								]
							})]
						})
					]
				})]
			})
		})
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border pb-24 pt-12 md:pb-14",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "container-lp flex flex-col items-center justify-between gap-6 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-3 sm:items-start",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/assets/logo-dark.png",
					alt: "Govisa Courses",
					className: "h-6 w-auto opacity-90"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-fg-subtle",
					children: "Formação Paralegal · Escritório americano · Salvador"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2 text-center text-xs text-fg-subtle sm:items-end sm:text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "https://govisacourses.com",
					target: "_blank",
					rel: "noopener noreferrer",
					className: "transition-colors hover:text-fg",
					children: "govisacourses.com"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"© ",
					(/* @__PURE__ */ new Date()).getFullYear(),
					" Govisa Courses. Todos os direitos reservados."
				] })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flag-strip mt-10",
			"aria-hidden": true
		})]
	});
}
function StickyCta() {
	const [visible, setVisible] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onScroll = () => {
			setVisible(window.scrollY > 520);
		};
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `sticky-cta md:hidden ${visible ? "visible" : ""}`,
		"aria-hidden": !visible,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppCta, {
			fullWidth: true,
			label: "Garantir minha vaga",
			size: "lg"
		})
	});
}
function LandingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Opportunity, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Program, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Process, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Offer, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Faq, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinalCta, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StickyCta, {})
		]
	});
}
//#endregion
export { LandingPage as component };
