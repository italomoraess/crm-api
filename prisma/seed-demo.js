/* CONVERSO — seed de dados de demonstração.
   Popula a conta admin (italo) como autônomo + a empresa Studio Coletivo com
   vários autônomos, para visualizar todas as telas com dados reais.
   Idempotente: remove o que foi semeado antes (marcado com [seed]) e recria.

   Rodar: node prisma/seed-demo.js
*/
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const p = new PrismaClient();

const ADMIN_EMAIL = 'italomoraes.sth@gmail.com';
const COMPANY_NAME = 'Studio Coletivo';
const MEMBER_PWD = 'Converso2026';

const CATS = ['Consultoria', 'Fotografia', 'Reparos', 'Bem-estar', 'Design', 'Educação'];
const SEED = '[seed]';

const now = new Date();
const monthDate = (offset, day = 15) => new Date(now.getFullYear(), now.getMonth() - offset, day, 12, 0, 0);
const dayDate = (offsetDays) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetDays, 12, 0, 0);
const thisMonthDay = (day) => new Date(now.getFullYear(), now.getMonth(), day);

async function ensureCategory(userId, name) {
  const found = await p.catalogCategory.findFirst({ where: { userId, name } });
  if (found) return found.id;
  const c = await p.catalogCategory.create({ data: { userId, name } });
  return c.id;
}

async function clearSeed(userId) {
  // remove apenas linhas semeadas (marcadas) — preserva dados criados à mão
  await p.appointment.deleteMany({ where: { userId, description: { startsWith: SEED } } });
  await p.lead.deleteMany({ where: { userId, observations: { startsWith: SEED } } });
  await p.catalogProduct.deleteMany({ where: { userId, description: { startsWith: SEED } } });
}

async function seedProducts(userId, items) {
  for (const it of items) {
    const categoryId = await ensureCategory(userId, it.cat);
    await p.catalogProduct.create({
      data: {
        userId, categoryId, name: it.nome, price: it.preco,
        duration: it.dur, status: it.status || 'ativo',
        description: `${SEED} ${it.desc || ''}`.trim(),
      },
    });
  }
}

/** Cria um lead e (opcionalmente) retrodata created_at/updated_at. */
async function createLead(userId, l) {
  const lead = await p.lead.create({
    data: {
      userId, name: l.name, phone: l.phone, email: l.email ?? null,
      origin: l.origin ?? 'indicacao', funnelStage: l.stage,
      dealValue: l.value ?? null, observations: `${SEED} ${l.servico || ''}`.trim(),
    },
  });
  if (l.date) {
    await p.$executeRawUnsafe(
      'UPDATE leads SET created_at = $1, updated_at = $2 WHERE id = $3',
      l.date, l.date, lead.id,
    );
  }
  return lead.id;
}

async function seedAppointments(userId, items) {
  for (const a of items) {
    await p.appointment.create({
      data: {
        userId, title: a.title, date: a.date, startTime: a.start,
        durationMinutes: a.dur ?? 60, serviceCategory: a.cat,
        type: 'outro', completed: !!a.done,
        description: `${SEED}`,
        leadId: a.leadId ?? null,
      },
    });
  }
}

/** Vendas fechadas nos últimos 7 dias (p/ a spark de receita do dashboard). */
async function seedDailyClosed(userId, baseName, dailyValues) {
  for (let i = 0; i < dailyValues.length; i++) {
    const offset = dailyValues.length - 1 - i; // 6..0 (dias atrás)
    const v = dailyValues[i];
    if (!v) continue;
    await createLead(userId, {
      name: `${baseName} — dia ${i + 1}`,
      phone: '(11) 90000-0000',
      stage: 'fechado',
      value: v,
      servico: 'Venda recente',
      date: dayDate(offset),
    });
  }
}

/** Histórico de vendas fechadas espalhado nos últimos 6 meses (p/ gráficos). */
async function seedClosedHistory(userId, baseName, monthlyValues) {
  // monthlyValues: array de 6 números (mais antigo -> atual)
  for (let i = 0; i < monthlyValues.length; i++) {
    const offset = monthlyValues.length - 1 - i; // 5..0
    const v = monthlyValues[i];
    if (!v) continue;
    await createLead(userId, {
      name: `${baseName} — venda ${i + 1}`,
      phone: '(11) 90000-0000',
      stage: 'fechado',
      value: v,
      servico: 'Venda fechada',
      date: monthDate(offset, 10 + (i % 15)),
    });
  }
}

async function main() {
  const admin = await p.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`Admin ${ADMIN_EMAIL} não encontrado — rode o seed do admin antes.`);
  const company = await p.company.findFirst({ where: { name: COMPANY_NAME } });
  if (!company) throw new Error(`Empresa ${COMPANY_NAME} não encontrada.`);

  // ─── 1) Dados do ADMIN como autônomo ──────────────────────────────
  console.log('Semeando dados do admin (autônomo)…');
  await clearSeed(admin.id);

  await seedProducts(admin.id, [
    { nome: 'Consultoria de Marca', cat: 'Consultoria', preco: 1800, dur: '3h', desc: 'Diagnóstico de posicionamento + guia de marca.' },
    { nome: 'Sessão de Fotos Produto', cat: 'Fotografia', preco: 950, dur: '2h', desc: 'Ensaio de até 15 produtos com tratamento.' },
    { nome: 'Manutenção Elétrica', cat: 'Reparos', preco: 320, dur: '1h30', desc: 'Visita técnica e troca de pontos.' },
    { nome: 'Personal Training', cat: 'Bem-estar', preco: 120, dur: '1h', desc: 'Treino individual com plano mensal.' },
    { nome: 'Design de Apresentação', cat: 'Design', preco: 680, dur: '4h', status: 'pausado', desc: 'Deck de até 20 slides.' },
    { nome: 'Aula de Inglês', cat: 'Educação', preco: 90, dur: '1h', desc: 'Conversação 1:1 online.' },
    { nome: 'Diária de Limpeza', cat: 'Reparos', preco: 180, dur: '6h', status: 'rascunho', desc: 'Limpeza completa residencial.' },
  ]);

  // Clientes + negócios em aberto (várias etapas)
  const adminLeads = [
    { name: 'Mariana Lopes', phone: '(11) 98842-1190', email: 'mari.lopes@gmail.com', stage: 'contatado', value: 1600, servico: 'Reforma elétrica loja' },
    { name: 'Rafael Andrade', phone: '(11) 99710-3320', email: 'rafa.andrade@outlook.com', stage: 'proposta', value: 1360, servico: 'Deck investidores' },
    { name: 'Studio Bloom', phone: '(11) 3045-8821', email: 'contato@studiobloom.com', stage: 'negociando', value: 4200, servico: 'Rebrand completo' },
    { name: 'Camila Souza', phone: '(21) 98123-7765', email: 'camila.souza@gmail.com', stage: 'negociando', value: 3200, servico: 'Plano anual treino' },
    { name: 'Pedro Henrique', phone: '(11) 99432-1188', email: 'ph.martins@gmail.com', stage: 'novo', value: 720, servico: 'Curso intensivo' },
    { name: 'Ateliê Nova Casa', phone: '(11) 3322-0091', email: 'ola@novacasa.com.br', stage: 'proposta', value: 2850, servico: 'Catálogo verão' },
    { name: 'Beatriz Nunes', phone: '(31) 98800-4521', email: 'bia.nunes@gmail.com', stage: 'novo', value: 1900, servico: 'Ensaio institucional' },
  ];
  const adminLeadIds = [];
  for (const l of adminLeads) adminLeadIds.push(await createLead(admin.id, l));

  // Histórico de receita fechada: 5 meses anteriores (barras) + 7 dias (spark).
  await seedClosedHistory(admin.id, 'Projeto', [6200, 7100, 5800, 9300, 8100, 0]);
  await seedDailyClosed(admin.id, 'Venda', [320, 0, 950, 540, 120, 1800, 410]);

  // Agenda do mês atual (alguns hoje)
  const today = now.getDate();
  await seedAppointments(admin.id, [
    { title: 'Consultoria — Studio Bloom', date: thisMonthDay(today), start: '09:00', dur: 90, cat: 'Consultoria', done: true, leadId: adminLeadIds[2] },
    { title: 'Personal — Camila', date: thisMonthDay(today), start: '14:30', dur: 60, cat: 'Bem-estar', done: true, leadId: adminLeadIds[3] },
    { title: 'Fotos — Nova Casa', date: thisMonthDay(Math.min(today + 1, 28)), start: '10:00', dur: 120, cat: 'Fotografia', leadId: adminLeadIds[5] },
    { title: 'Aula inglês — Pedro', date: thisMonthDay(Math.min(today + 3, 28)), start: '08:00', dur: 60, cat: 'Educação', done: true, leadId: adminLeadIds[4] },
    { title: 'Elétrica — Mariana', date: thisMonthDay(Math.max(today - 2, 1)), start: '15:00', dur: 90, cat: 'Reparos', done: true, leadId: adminLeadIds[0] },
    { title: 'Reunião proposta — Rafael', date: thisMonthDay(Math.min(today + 5, 28)), start: '11:00', dur: 60, cat: 'Consultoria', leadId: adminLeadIds[1] },
  ]);

  // ─── 2) Membros da empresa (outros autônomos) ─────────────────────
  console.log('Semeando autônomos da empresa…');
  const hash = await bcrypt.hash(MEMBER_PWD, 12);
  const trialEndsAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const members = [
    { nome: 'Marcos Vinícius', email: 'marcos@studio.test', area: 'Fotografia', status: 'ativo', hist: [7400, 8900, 9500, 10200, 9800, 11200], abertos: 3, prods: 4 },
    { nome: 'Ana Beatriz', email: 'ana@studio.test', area: 'Bem-estar', status: 'ativo', hist: [3200, 4100, 4800, 5600, 6100, 6480], abertos: 4, prods: 3 },
    { nome: 'Carlos Eduardo', email: 'carlos@studio.test', area: 'Reparos', status: 'ativo', hist: [4800, 5100, 4600, 5900, 5000, 5320], abertos: 5, prods: 5 },
    { nome: 'Rodrigo Alves', email: 'rodrigo@studio.test', area: 'Consultoria', status: 'inativo', hist: [4200, 3100, 2000, 900, 0, 0], abertos: 0, prods: 1 },
    { nome: 'Fernanda Lima', email: 'fernanda@studio.test', area: 'Educação', status: 'pendente', hist: [0, 0, 0, 0, 0, 0], abertos: 0, prods: 0 },
  ];

  for (const m of members) {
    const u = await p.user.upsert({
      where: { email: m.email },
      update: { name: m.nome, trialEndsAt, plan: 'pro' },
      create: { email: m.email, name: m.nome, password: hash, plan: 'pro', trialEndsAt },
    });

    await p.membership.upsert({
      where: { companyId_userId: { companyId: company.id, userId: u.id } },
      update: { area: m.area, status: m.status, role: 'member', joinedAt: m.status === 'ativo' ? monthDate(6, 1) : null },
      create: {
        companyId: company.id, userId: u.id, role: 'member', area: m.area, status: m.status,
        joinedAt: m.status === 'ativo' ? monthDate(6, 1) : null,
        invitedName: m.nome, invitedEmail: m.email,
      },
    });

    // limpa e recria dados do membro
    await clearSeed(u.id);
    if (m.prods) {
      const sample = [
        { nome: `${m.area} — Pacote Básico`, cat: m.area, preco: 250, dur: '1h' },
        { nome: `${m.area} — Pacote Pro`, cat: m.area, preco: 600, dur: '2h' },
        { nome: `${m.area} — Mensal`, cat: m.area, preco: 900, dur: '4h', status: 'pausado' },
        { nome: `${m.area} — Avulso`, cat: m.area, preco: 150, dur: '1h' },
        { nome: `${m.area} — Premium`, cat: m.area, preco: 1200, dur: '3h' },
      ].slice(0, m.prods);
      await seedProducts(u.id, sample);
    }
    if (m.hist.some(Boolean)) await seedClosedHistory(u.id, m.nome.split(' ')[0], m.hist);
    for (let i = 0; i < m.abertos; i++) {
      await createLead(u.id, {
        name: `Cliente ${m.nome.split(' ')[0]} ${i + 1}`,
        phone: '(11) 98888-0000',
        stage: ['novo', 'contatado', 'proposta', 'negociando'][i % 4],
        value: 400 + i * 250,
        servico: `Oportunidade ${i + 1}`,
      });
    }
  }

  // ─── Resumo ───────────────────────────────────────────────────────
  const counts = {
    adminLeads: await p.lead.count({ where: { userId: admin.id } }),
    adminProducts: await p.catalogProduct.count({ where: { userId: admin.id } }),
    adminAppts: await p.appointment.count({ where: { userId: admin.id } }),
    members: await p.membership.count({ where: { companyId: company.id } }),
  };
  console.log('OK:', JSON.stringify(counts));
  console.log(`Autônomos de teste (senha ${MEMBER_PWD}): ${members.map((m) => m.email).join(', ')}`);
}

main()
  .catch((e) => { console.error('ERRO:', e.message); process.exitCode = 1; })
  .finally(() => p.$disconnect());
