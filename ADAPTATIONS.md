# crm-api — adaptações para o layout Converso

Ajustes na API para alinhar com os front-ends (`converso-web`, `converso-app`) que
recriam o design *Converso*. Mapeamento detalhado em `converso-web/src/lib/mappers.ts`.

> **Status (2026-06-05):** itens 1–6 implementados em código + schema. A migration
> `prisma/migrations/20260605120000_converso_layout/` está pronta mas **ainda não foi
> aplicada** — o projeto Supabase está pausado (o host direto
> `db.gxyxfpoznezraynpuzwf.supabase.co` não resolve / `P1001`). Ver "Aplicar a migration".

## 1. Funil de vendas — etapa `proposta` ✅

O layout usa **5 colunas**: `Lead → Contato → Proposta → Negociação → Fechado`.
`proposta` foi adicionado ao enum `FunnelStage` (`prisma/schema.prisma`) e à migration
(`ALTER TYPE "FunnelStage" ADD VALUE IF NOT EXISTS 'proposta' BEFORE 'negociando'`).

| Coluna (UI) | `FunnelStage` (API) |
| --- | --- |
| `lead` | `novo` |
| `contato` | `contatado` |
| `prop` | `proposta` |
| `nego` | `negociando` |
| `ganho` | `fechado` |
| — | `perdido` (não é coluna; exposto via `lostReason`) |

## 2. Serviços = Catálogo ✅

"Serviços" é o catálogo do autônomo → `CatalogProduct` + `CatalogCategory`.
Campos do design adicionados a `CatalogProduct`:

| Design (`Servico`) | API (`CatalogProduct`) |
| --- | --- |
| nome | `name` |
| preço | `price` |
| categoria | via `categoryId` / `CatalogCategory.name` |
| duração (`1h`, `1h30`, `3h`…) | **`duration String?`** (texto livre) — `durationDays` mantido p/ produtos que expiram |
| status (`ativo`/`pausado`/`rascunho`) | **`status ServiceStatus @default(ativo)`** |
| descrição | **`description String?`** |

DTOs (`create/update-product.dto`) e `CatalogService` aceitam os três campos novos.

## 3. Clientes ↔ Leads (sem mudança)

Mantido como está: o design deriva `Cliente` e `Negocio` do mesmo `Lead`
(`name`/`phone`/`email` + `dealValue`/`funnelStage`). Separar contatos de
oportunidades exigiria um modelo `Client` — fora de escopo por ora.

## 4. Agenda — duração e categoria ✅

Adicionados a `Appointment`:
- **`durationMinutes Int?`** — bloco do evento em minutos (layout usa `dur`).
- **`serviceCategory String?`** — categoria de serviço usada para colorir o evento
  (Consultoria, Fotografia, Reparos, Bem-estar, Design, Educação), independente do
  `AppointmentType` (ligacao/visita/reuniao/retorno/outro).

DTOs (`create/update-appointment.dto`) e `AppointmentsService` aceitam ambos.

## 5. Empresa / Admin (multi-autônomo) ✅

Implementado o painel **Administrador** do web. Novos modelos:

- **`Company`** (`companies`): `name`, `plan` (`CompanyPlan`: free/pro/empresa),
  `monthlyGoal` (meta da equipe).
- **`Membership`** (`memberships`): vincula `User` ↔ `Company` com `role`
  (`CompanyRole`: owner/admin/member), `area`, `status` (`MemberStatus`:
  ativo/pendente/inativo). Convite sem conta ainda fica com `userId` nulo +
  `invitedName`/`invitedEmail`.

Módulo `src/company/` (`CompanyController` + `CompanyService`), rotas (todas exigem
que o usuário seja owner/admin de alguma empresa — caso contrário `403`):

| Rota | Descrição |
| --- | --- |
| `GET /company` | dados da empresa (nome, plano, meta, admin) |
| `PATCH /company` | atualizar nome/plano/meta |
| `GET /company/members` | autônomos + stats agregadas (receita, clientes, negócios, conversão, serviços, `spark` de 6 meses, `desde`) — formato do `Membro` do layout |
| `POST /company/members` | convidar autônomo (status `pendente`; vincula `userId` se o e-mail já tiver conta) |
| `PATCH /company/members/:id` | aprovar (`status: ativo`) / inativar / mudar área/papel |
| `DELETE /company/members/:id` | remover da empresa (owner não pode ser removido) |
| `GET /company/summary` | agregados da equipe: faturamento, `pctMeta`, ticket, ativos/total, `meses[]`, `porArea[]` |

As stats por membro são derivadas dos `Lead`/`CatalogProduct` de cada autônomo
(reaproveitando a mesma lógica de `reports`).

`GET /auth/me` agora inclui **`role`** (`'admin'` se owner/admin de empresa, senão
`'autonomo'`) e **`company`** (`{ id, name, role }` ou `null`) — o web pode decidir o
papel pelo servidor em vez do toggle local. (Hoje o web ainda escolhe o papel no login
e roda o painel sobre `CV.equipe`; basta trocar para `GET /company/*`.)

## 6. Auth (compatível)

`POST /auth/login` e `/auth/register` retornam `{ accessToken, refreshToken, user }`,
`/auth/refresh` aceita `{ refreshToken }`. O web usa esse contrato.

> ⚠️ **Envelope de resposta:** o `ResponseInterceptor` global embrulha tudo em
> `{ data, message }`. Logo, no axios do web o corpo é `res.data = { data: <payload> }`.
> O `src/services/index.ts` atual lê `data.accessToken` direto — ao integrar de
> verdade, ler `data.data.accessToken` (ou desembrulhar no interceptor do axios).

## Aplicar a migration

O banco (Supabase) precisa estar **ativo** — despause o projeto no dashboard. O host
direto `db.<ref>.supabase.co` só resolve com o projeto ativo (é o que `DIRECT_URL`/
migrations usam). Então:

```bash
cd crm-api
npx prisma migrate deploy   # aplica 20260605120000_converso_layout (idempotente)
npx prisma generate
```

A migration segue o padrão idempotente das anteriores (`IF NOT EXISTS` / guardas
`DO $$ … duplicate_object`), então é segura para reaplicar.
