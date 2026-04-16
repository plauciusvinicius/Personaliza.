# Deploy Guide — Portal Editora Juruá

## Credenciais necessárias

Antes de fazer o deploy, você precisa de:

1. **GitHub PAT** — para push do código
2. **Supabase** — URL + anon key + service role key (criar projeto em supabase.com)
3. **Vercel token** — com permissão de criar projetos (gerar em vercel.com/account/tokens)

---

## 1. Push para o GitHub

```bash
cd "Editora Juruá/portal"

# Configure o token como parte da URL
git remote set-url origin https://SEU_GITHUB_TOKEN@github.com/plauciusvinicius/Personaliza..git

# Push
git push -u origin main
```

**Como gerar o GitHub PAT:**
- Acesse: github.com → Settings → Developer settings → Personal access tokens → Fine-grained tokens
- Permissões necessárias: `Contents: Read and write`
- Repositório: `plauciusvinicius/Personaliza.`

---

## 2. Criar projeto no Supabase

1. Acesse **supabase.com** e faça login com `pv9081@gmail.com`
2. Clique em **New project**
3. Nome: `jurua-portal`
4. Senha do banco (anote!)
5. Região: **South America (São Paulo)**
6. Aguarde ~2 min até o projeto estar pronto
7. Vá em **Settings → API** e copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

**Rodar o schema SQL:**
- Vá em **SQL Editor** no painel do Supabase
- Abra o arquivo `supabase-schema.sql` deste projeto
- Cole e clique em **Run**

---

## 3. Deploy na Vercel

### Opção A — via Dashboard (recomendado)
1. Acesse vercel.com e clique em **Add New Project**
2. Importe o repositório `plauciusvinicius/Personaliza.`
3. Em **Root Directory**, selecione `Editora Juruá/portal`
4. Adicione as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   N8N_WEBHOOK_URL=https://n8n.srv1323363.hstgr.cloud/webhook/jurua-pdf-upload
   N8N_SECRET=jurua_portal_secret_2024
   NEXT_PUBLIC_APP_URL=https://jurua-portal.vercel.app
   ```
5. Deploy!

### Opção B — via CLI (após criar token com permissão total)
```bash
cd "Editora Juruá/portal"

# Login
vercel login

# Deploy para produção
vercel --prod
```

---

## 4. Atualizar .env.local

Preencha o arquivo `.env.local` com as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
N8N_WEBHOOK_URL=https://n8n.srv1323363.hstgr.cloud/webhook/jurua-pdf-upload
N8N_SECRET=jurua_portal_secret_2024
NEXT_PUBLIC_APP_URL=https://jurua-portal.vercel.app
```

---

## 5. Configurar domínio customizado (opcional)

No painel Vercel, vá em Settings → Domains e adicione `jurua-portal.vercel.app`
(ou um domínio personalizado).
