# 🧠 From Idea to Reality: AI-Powered Recipe Generator  
> En fullstack-applikation som kombinerar **artificiell intelligens**, **modern webbutveckling** och **säker backend-arkitektur** för att skapa unika, anpassade recept med AI.

---

<p align="center">
  <img src="https://img.shields.io/badge/.NET-8.0-blue?logo=dotnet&logoColor=white" alt=".NET Badge"/>
  <img src="https://img.shields.io/badge/React-18-blue?logo=react&logoColor=white" alt="React Badge"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind Badge"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL Badge"/>
  <img src="https://img.shields.io/badge/OpenAI_SDK-.NET-green?logo=openai&logoColor=white" alt="OpenAI Badge"/>
</p>

---

## 🚀 Översikt

Detta projekt är resultatet av en idé att lösa ett vardagsproblem – *"Vad ska jag laga idag?"*.  
Genom att integrera **OpenAI:s API** kan användaren generera kreativa recept baserat på ingredienser, preferenser och dieter.  

Applikationen är byggd som en **fullstack-lösning** med fokus på:
- 🔒 **Säkerhet** (JWT + Refresh Tokens + ASP.NET Identity)
- ⚡ **Prestanda** (React, Vite, React Query)
- 🧠 **Intelligens** (OpenAI-integration)
- 🧩 **Struktur och skalbarhet**

<img width="400" height="400" alt="What2Eat home" src="https://github.com/user-attachments/assets/122f5718-aebe-4ce4-b546-cf27dc62c5a4" />
<img width="400" height="400" alt="What2Eat recipe" src="https://github.com/user-attachments/assets/d3007e0a-12c4-4437-bbf9-9ba27086148a" />
<img width="400" height="400" alt="Skärmbild 2025-10-21 135915" src="https://github.com/user-attachments/assets/a801411a-d307-42b6-964e-1516ccfe1d9a" />

---

## 🧩 Teknologier

### ⚙️ Backend — *Byggd för prestanda, säkerhet och skalbarhet*
| Funktion | Teknologi |
|-----------|------------|
| 🧱 **Ramverk** | [ASP.NET Core Web API](https://learn.microsoft.com/aspnet/core) |
| 🔐 **Autentisering & Auktorisering** | **JWT (Access + Refresh Tokens)** & **ASP.NET Core Identity** |
| ♻️ **Token Rotation** | Säker **refresh token-hantering** för långvariga sessioner |
| 🧭 **Datamodellering** | **DTOs (Data Transfer Objects)** för ren datahantering |
| 🗃️ **Databas** | **Neon (PostgreSQL)** – molnbaserad databaslösning |
| 🧩 **ORM** | [Entity Framework Core](https://learn.microsoft.com/ef/core) |
| 🤖 **AI-integration** | [OpenAI .NET SDK](https://github.com/openai/openai-dotnet) |
| 🧪 **API Test UI** | [Scalar](https://scalar.com) för interaktiv testning av endpoints |

**Arkitekturprinciper:**
- Tydlig lagerindelning *(Controllers → Services → Repositories → DTOs)*  
- Säker autentisering med **Access & Refresh Tokens**  
- Rollbaserad åtkomst via **ASP.NET Identity**  
- Effektiv datakommunikation via **EF Core**  
- Stabil AI-integrering via **OpenAI SDK**

---

### 💻 Frontend — *Modern, snabb och användarvänlig*
| Funktion | Teknologi |
|-----------|------------|
| ⚛️ **Ramverk** | [React](https://react.dev/) |
| 🧠 **Språk** | [TypeScript](https://www.typescriptlang.org/) |
| 🎨 **Stil** | [Tailwind CSS](https://tailwindcss.com/) |
| 🔄 **Datahantering & Caching** | [React Query](https://tanstack.com/query/latest) |
| 🧭 **Routing** | [React Router](https://reactrouter.com/) |
| ✅ **Formulär & Validering** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| 🧩 **UI-komponenter** | [shadcn/ui](https://ui.shadcn.com/) |
| ⚡ **Byggverktyg** | [Vite](https://vitejs.dev/) |
| 🌐 **HTTP-förfrågningar** | [Axios](https://axios-http.com/) med **interceptors** för token-hantering och HTTP-client |

**Frontend-egenskaper:**
- 🔁 Axios interceptors hanterar **Access Token-uppdatering (refresh tokens)** automatiskt  
- ⚡ Snabba API-anrop med React Query & Axios  
- 🧩 Typstark och modulär struktur med TypeScript  
- 🎨 Modern UI med Tailwind CSS och shadcn/ui  

---

## 🔧 Funktionalitet

✅ Generera AI-baserade recept med OpenAI  
✅ Hantera recept (CRUD)  
✅ Säker inloggning och registrering (JWT + Identity)  
✅ Token rotation (Refresh Tokens)  
✅ Axios interceptors för automatiska token-förnyelser  
✅ Spara och uppdatera recept i PostgreSQL via EF Core  
✅ Testa API-endpoints med Scalar  
✅ Typstark, modulär och skalbar kodstruktur  

---

## 🧱 Arkitekturöversikt

