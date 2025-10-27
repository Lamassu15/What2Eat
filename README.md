Från idé till verklighet: Byggandet av en fullstack-applikation för receptgenerering med AI
Jag är stolt över att presentera ett av mina senaste fullstack-projekt, där jag har utforskat kraften i artificiell intelligens för att lösa ett vardagligt problem: Att få nya, unika recept.

Detta projekt är en robust och skalbar applikation som låter användare generera anpassade recept med hjälp av AI. Det är en pågående process med fulla CRUD-funktioner (Create, Read, Update, Delete) för att hantera recept.

Teknologierna bakom lösningen
Backend: Byggd för skalbarhet och säkerhet
På serversidan har jag byggt en kraftfull backend med ASP.NET Core. Valet av detta ramverk ger en högpresterande och stabil grund för applikationen. För att interagera med AI-modeller har jag integrerat OpenAI API genom det officiella OpenAI .NET-biblioteket. Denna integration är designad för att vara säker, med strikt separation av intressen (DTOs) för att hantera data från API:et och skydda databasmodeller.

Databasen hanteras med Entity Framework Core, som förenklar kommunikationen med en SQL-databas. Användarautentisering och auktorisering sköts med JWT (JSON Web Tokens), vilket garanterar en säker och tillståndslös autentiseringsmekanism.

Frontend: Moderna och effektiva verktyg
På klientsidan har jag utvecklat en responsiv och dynamisk användarupplevelse med moderna webbteknologier:

React för att bygga en komponentbaserad och interaktiv UI.

TypeScript för att säkerställa hög kodkvalitet och minska fel.

React Query för effektiv hantering av API-anrop och cachning, vilket förbättrar prestandan avsevärt.

Tailwind CSS för snabb och flexibel styling.

React Router för smidig navigering.

React Hook Form med Zod för att hantera formulär och datavalidering på ett effektivt sätt.

Shadcn/ui för att bygga snygga och tillgängliga UI-komponenter.

Vite som en snabb build-tool för en smidig utvecklingsupplevelse.

Slutresultat och framtid
Denna kombination av tekniker har resulterat i en fullstack-applikation som inte bara är funktionell utan också byggd med best practices i åtanke. Det är ett bevis på hur moderna verktyg kan samarbeta för att skapa effektiva och innovativa lösningar.

Även om projektet har grundläggande funktionalitet för att hantera recept, ser jag en stor potential att vidareutveckla det till en fullfjädrad produkt. Jag ser fram emot att diskutera projektet mer ingående och dela med mig av de lärdomar jag har tagit med mig.
