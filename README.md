# Dashboard de Consumo Global de Álcool

Dashboard estático (HTML/CSS/JS puro) protegido por login, que permite enviar um
arquivo `drinks.csv` e visualizar o consumo global de álcool em gráficos.
A cada envio, os dados também são gravados no **Supabase**.

## Funcionalidades

- Tela de **login** com usuário e senha pré-definidos.
- Botão para **enviar o `drinks.csv`**.
- Visualização do consumo com **indicadores** e **4 gráficos** (Chart.js):
  - Top 10 países por litros puros de álcool
  - Distribuição de países por faixa de consumo
  - Consumo global por tipo de bebida (cerveja / destilados / vinho)
  - Cerveja x Destilados x Vinho nos 10 maiores países
- Tabela com os dados completos.
- Gravação automática dos dados no Supabase (tabelas `uploads` e `drinks`).

## Estrutura

| Arquivo          | Descrição                                                        |
| ---------------- | ---------------------------------------------------------------- |
| `index.html`     | Estrutura da página (login + dashboard).                         |
| `style.css`      | Estilos.                                                         |
| `app.js`         | Lógica: login, parsing do CSV, gráficos e gravação no Supabase.  |
| `config.js`      | Configuração pública (URL/chave publishable do Supabase, login). |
| `.env`           | Segredos locais (**não versionado**).                            |
| `.env.example`   | Modelo do `.env`.                                                |

## Formato esperado do CSV

Cabeçalho:

```
country,beer_servings,spirit_servings,wine_servings,total_litres_of_pure_alcohol
```

Apenas `country` e `total_litres_of_pure_alcohol` são obrigatórias.

## Como rodar localmente

Por ser um site estático, basta servir a pasta por HTTP (o Supabase precisa de
origem HTTP/HTTPS, não funciona abrindo o arquivo direto via `file://`).

Exemplo com Python:

```bash
python -m http.server 8000
```

E acesse `http://localhost:8000`.

## Banco de dados (Supabase)

Projeto: **dashdrink**. Tabelas:

- `uploads` — `id`, `file_name`, `row_count`, `uploaded_at`.
- `drinks` — `id`, `upload_id`, `country`, `beer_servings`, `spirit_servings`,
  `wine_servings`, `total_litres_of_pure_alcohol`, `created_at`.

## Segurança

> A validação de login acontece no navegador, portanto **não é uma segurança
> real** — serve apenas como barreira simples. Para segurança de verdade, use
> Supabase Auth ou um backend. As chaves `service_role`/`secret` ficam somente
> no `.env` local e nunca são usadas no front-end.

## Deploy

O deploy (ex.: Vercel) é feito manualmente. Não há etapa de build — basta
publicar os arquivos estáticos.
