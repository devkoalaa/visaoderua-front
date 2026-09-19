# Visão de Rua — front-end

Loja de lupas (Juliet, Romeo, Monster Dog…) com identidade de rua: fundo asfalto, vermelho como acento e tipografia Bebas Neue.

Stack: **Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion**.

## Rodando

```bash
npm install
npm run dev
```

Variáveis de ambiente (opcionais):

| Variável | Uso | Padrão |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | URL do backend ([visaoderua-backend](https://github.com/daviaragaoyt/visaoderua-backend)) | `http://localhost:3333` em dev, `https://visaoderua-backend.vercel.app` em produção |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número do WhatsApp da loja (com DDI) | `5561999999999` |
| `NEXT_PUBLIC_SITE_URL` | URL pública (metadados / Open Graph) | `https://visaoderua.vercel.app` |
| `NEXT_PUBLIC_USE_MOCK_CATALOG` | `true` liga o catálogo de demonstração em produção enquanto não há backend | desligado |

Em desenvolvimento, se a API não responder, o catálogo usa um mock (`src/data/mock-products.ts`) para permitir trabalhar a UI. Em produção o erro é exibido com opção de tentar de novo.

As fotos do mock são do [Unsplash](https://unsplash.com/license) (licença livre, carregadas por URL) e servem só como placeholder até existirem fotos reais. Produto sem foto cai numa foto genérica e, se ela também falhar (offline), em `public/images/products/placeholder.svg`.

## Estrutura

```
src/
├─ app/                 rotas (home, checkout, success, not-found) e layout raiz
├─ components/
│  ├─ ui/               primitivos do design system (Button, Badge, Input, Modal, Sheet…)
│  ├─ layout/           AnnouncementBar, Header, MobileMenu, Footer, SocialLinks
│  ├─ home/             Hero, Ticker, TrustBadges, Feedbacks, AboutSection
│  ├─ catalog/          CatalogSection, filtros, ProductCard, ProductModal, ProductImage
│  ├─ cart/             CartSheet, CartItemRow
│  ├─ checkout/         etapas do checkout, validação, resumo, PIX, sucesso
│  └─ providers/        Providers (MotionConfig, Toast, Cart)
├─ context/             CartContext (reducer + persistência em localStorage)
├─ store/               catalog-store (busca e filtro compartilhados via useSyncExternalStore)
├─ hooks/               useScrolled, useLockBodyScroll, useFocusTrap, useCountdown…
├─ lib/                 api, format (máscaras/validações), products, site (config), motion, utils
├─ data/                mock de produtos (dev) e depoimentos
└─ types/               tipos de domínio
```

## Design system

Tudo o que é cor, sombra, tipografia e movimento está em `tailwind.config.ts` e `src/app/globals.css`. Componentes **não** usam hex solto.

### Cores

| Token | Uso |
| --- | --- |
| `asphalt-950 … 300` | escala de neutros (fundos, superfícies, bordas) |
| `blood` (`400/500/600/700`) | vermelho da marca: CTAs, destaques, estados ativos |
| `foreground` / `muted` / `subtle` | texto em três níveis de hierarquia |
| `line` / `line-strong` | bordas padrão e mais fortes |
| `gold` | estrelas de avaliação |
| `whatsapp` | ações que abrem o WhatsApp e estados de sucesso |

### Tipografia

- `font-display` (Bebas Neue): títulos, botões, preços. Escala `text-display-sm … 2xl`.
- `font-sans` (Inter): corpo de texto.
- `font-mono` (JetBrains Mono): códigos, contadores, quantidades.

### Movimento

Curvas e durações em `src/lib/motion.ts` (`ease.out`, `spring`, variantes `fadeUp`, `modalMotion`, `sheetMotion`). O `<Reveal>` anima ao entrar na viewport; `MotionConfig reducedMotion="user"` e o CSS respeitam `prefers-reduced-motion`.

Diretriz visual: o vermelho é acento, não neon. Sombras coloridas (`shadow-glow*`) e `text-glow` existem como tokens, mas são reservados a um único destaque por tela.

### Primitivos (`src/components/ui`)

`Button` / `ButtonLink` (primary, secondary, outline, ghost, whatsapp, link · sm–xl · `loading`), `IconButton`, `Badge`, `Container`, `SectionHeading`, `Reveal`, `Marquee`, `Skeleton`, `Modal` / `Sheet` (portal, foco preso, Esc, scroll lock), `Input` / `Select` (label, hint, erro, ícones), `Logo`, `QuantityStepper`, `Price`, `Divider`, `Spinner`.

## Fluxos

- **Catálogo**: busca no header + chips por linha filtram em tempo real; agrupamento por linha quando sem filtro; estados de carregando, erro e vazio.
- **Carrinho** (`balaio`): sheet lateral com quantidade, remoção, persistência e duas saídas: checkout ou WhatsApp.
- **Checkout**: etapas Entrega → Pagamento → PIX. Máscaras de CPF/telefone/CEP, validação de CPF, preenchimento automático por ViaCEP (RA quando DF, bairro fora do DF), PIX com QR, cópia do código, expiração e polling de status.
