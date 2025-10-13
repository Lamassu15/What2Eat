// import { useEffect, useRef, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { useAuth } from "@/hooks/useAuth";
// import { useRecipes } from "@/context/RecipeContext";
// import { Send, Loader2, Sparkles, Clock, FileText, List } from "lucide-react";

// type ChatMessage = {
//   id: string;
//   role: "user" | "assistant" | "system";
//   content: string;
//   createdAt: string;
// };

// const COOLDOWN_MS = 5000; // client-side cooldown between requests

// export default function RecipeGenerator() {
//   const { token } = useAuth();
//   const { recipes } = useRecipes();
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<ChatMessage[]>(() => [
//     {
//       id: "system-1",
//       role: "system",
//       content:
//         "You are a helpful recipe assistant. Provide structured, clear recipes. If asked, return JSON only inside markdown ```json blocks when possible.",
//       createdAt: new Date().toISOString(),
//     },
//   ]);
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
//   const [isSaving, setIsSaving] = useState(false);
//   const abortRef = useRef<AbortController | null>(null);
//   const scrollRef = useRef<HTMLDivElement | null>(null);

//   const recentRecipes = (recipes ?? [])
//     .slice()
//     .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
//     .slice(0, 5);

//   useEffect(() => {
//     // auto-scroll to bottom when messages change
//     const el = scrollRef.current;
//     if (!el) return;
//     el.scrollTop = el.scrollHeight;
//   }, [messages, isStreaming]);

//   useEffect(() => {
//     if (!cooldownUntil) return;
//     const timer = setInterval(() => {
//       if (Date.now() > (cooldownUntil || 0)) {
//         setCooldownUntil(null);
//       }
//     }, 250);
//     return () => clearInterval(timer);
//   }, [cooldownUntil]);

//   const appendMessage = (m: Partial<ChatMessage>) => {
//     setMessages((prev) => [
//       ...prev,
//       {
//         id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
//         role: (m.role as ChatMessage["role"]) || "assistant",
//         content: m.content || "",
//         createdAt: new Date().toISOString(),
//       },
//     ]);
//   };

//   const startStreamingResponse = async (prompt: string) => {
//     setError(null);
//     setIsStreaming(true);
//     abortRef.current?.abort();
//     const ac = new AbortController();
//     abortRef.current = ac;

//     // add user's message immediately
//     const userMessage: ChatMessage = {
//       id: `user-${Date.now()}`,
//       role: "user",
//       content: prompt,
//       createdAt: new Date().toISOString(),
//     };
//     setMessages((m) => [...m, userMessage]);

//     // create an empty assistant message that we'll update as stream comes
//     const assistantId = `assistant-${Date.now()}`;
//     setMessages((m) => [
//       ...m,
//       {
//         id: assistantId,
//         role: "assistant",
//         content: "",
//         createdAt: new Date().toISOString(),
//       },
//     ]);

//     try {
//       const res = await fetch("/api/recipes/generate", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         body: JSON.stringify({ ingredients: prompt }),
//         signal: ac.signal,
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || `Request failed: ${res.status}`);
//       }

//       // If server supports streaming chunked response we can read the body stream.
//       if (
//         res.body &&
//         (res.headers.get("Content-Type") || "").includes("text/")
//       ) {
//         const reader = res.body.getReader();
//         const decoder = new TextDecoder();
//         let done = false;
//         let accumulated = "";

//         while (!done) {
//           const { value, done: d } = await reader.read();
//           if (d) {
//             done = true;
//             break;
//           }
//           if (value) {
//             const chunk = decoder.decode(value, { stream: true });
//             accumulated += chunk;
//             // update assistant message incremental
//             setMessages((prev) =>
//               prev.map((msg) =>
//                 msg.id === assistantId ? { ...msg, content: accumulated } : msg
//               )
//             );
//           }
//         }

//         // final read (in case)
//         const { value, done: lastDone } = await reader.read();
//         if (!lastDone && value) {
//           accumulated += decoder.decode(value);
//         }

//         // finalize assistant message
//         setMessages((prev) =>
//           prev.map((msg) =>
//             msg.id === assistantId ? { ...msg, content: accumulated } : msg
//           )
//         );
//       } else {
//         // non-streaming: try parse JSON or text
//         const contentType = res.headers.get("Content-Type") || "";
//         if (contentType.includes("application/json")) {
//           const json = await res.json();
//           // attempt to pick sensible text fields:
//           const text =
//             (json.recipe &&
//               (json.recipe.title ||
//                 json.recipe.description ||
//                 JSON.stringify(json.recipe))) ||
//             json.recipe ||
//             JSON.stringify(json);
//           setMessages((prev) =>
//             prev.map((msg) =>
//               msg.id === assistantId ? { ...msg, content: text } : msg
//             )
//           );
//         } else {
//           const text = await res.text();
//           setMessages((prev) =>
//             prev.map((msg) =>
//               msg.id === assistantId ? { ...msg, content: text } : msg
//             )
//           );
//         }
//       }

//       // set client-side cooldown
//       setCooldownUntil(Date.now() + COOLDOWN_MS);
//     } catch (err: any) {
//       if (err.name === "AbortError") {
//         setError("Request aborted.");
//       } else {
//         setError(err?.message || "Failed to generate recipe.");
//       }
//       // remove the assistant placeholder or set error content
//       setMessages((prev) =>
//         prev.map((msg) =>
//           msg.id.startsWith("assistant-") && msg.content === ""
//             ? { ...msg, content: "[Error]" }
//             : msg
//         )
//       );
//     } finally {
//       setIsStreaming(false);
//       abortRef.current = null;
//     }
//   };

//   const handleSubmit = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!input.trim()) return;
//     if (cooldownUntil && Date.now() < cooldownUntil) return;
//     await startStreamingResponse(input.trim());
//     setInput("");
//   };

//   const handleCancel = () => {
//     abortRef.current?.abort();
//     setIsStreaming(false);
//   };

//   const handleClear = () => {
//     setMessages((m) => m.filter((x) => x.role === "system"));
//   };

//   const saveLatestAssistant = async () => {
//     // optional example: POST the latest assistant message as a saved recipe
//     const latest = [...messages]
//       .reverse()
//       .find((m) => m.role === "assistant" && m.content.trim());
//     if (!latest) return;
//     setIsSaving(true);
//     try {
//       const res = await fetch("/api/recipes", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {}),
//         },
//         // backend expects CreateRecipeDto; this is a minimal fallback:
//         body: JSON.stringify({
//           title: "Generated Recipe",
//           description: latest.content.slice(0, 200),
//           instructions: [{ stepNumber: 1, description: latest.content }],
//         }),
//       });
//       if (!res.ok) {
//         const txt = await res.text();
//         throw new Error(txt || "Failed to save recipe");
//       }
//       // optionally refresh recipes list via context hook side-effect
//     } catch (err: any) {
//       setError(err?.message || "Failed to save recipe.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <div className="flex justify-center w-full p-6 md:p-8 lg:p-12 bg-background">
//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Chat area */}
//         <main className="lg:col-span-2">
//           <Card className="h-full flex flex-col">
//             <CardHeader className="px-6 py-4">
//               <div className="flex items-center justify-between gap-4">
//                 <div className="flex items-center gap-3">
//                   <Avatar className="w-10 h-10">
//                     <AvatarFallback>AI</AvatarFallback>
//                   </Avatar>
//                   <div>
//                     <CardTitle className="text-lg">
//                       Recipe AI Assistant
//                     </CardTitle>
//                     <div className="text-sm text-muted-foreground flex items-center gap-2">
//                       <Sparkles className="w-4 h-4" />
//                       Generate recipes from ingredients or prompts
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2">
//                   <Badge variant="outline" className="flex items-center gap-2">
//                     <Clock className="w-4 h-4" />
//                     Cooldown:{" "}
//                     <span className="ml-1 font-medium">
//                       {cooldownUntil && Date.now() < cooldownUntil
//                         ? `${Math.ceil((cooldownUntil - Date.now()) / 1000)}s`
//                         : "Ready"}
//                     </span>
//                   </Badge>
//                 </div>
//               </div>
//             </CardHeader>

//             <Separator />

//             <CardContent className="p-0 h-[60vh] flex flex-col">
//               <div
//                 ref={scrollRef}
//                 className="flex-1 overflow-auto px-6 py-4 space-y-4 scroll-smooth"
//                 style={{ overscrollBehavior: "contain" }}
//               >
//                 {messages.map((m) => (
//                   <div
//                     key={m.id}
//                     className={`flex gap-3 ${
//                       m.role === "user" ? "justify-end" : "justify-start"
//                     }`}
//                   >
//                     {m.role !== "user" && (
//                       <div className="shrink-0">
//                         <Avatar className="w-9 h-9">
//                           <AvatarFallback>
//                             {m.role === "assistant" ? "AI" : "S"}
//                           </AvatarFallback>
//                         </Avatar>
//                       </div>
//                     )}
//                     <div
//                       className={`max-w-[78%] px-4 py-3 rounded-lg whitespace-pre-wrap break-words ${
//                         m.role === "user"
//                           ? "bg-primary text-primary-foreground rounded-br-none"
//                           : "bg-card text-foreground rounded-bl-none"
//                       }`}
//                     >
//                       <div className="text-sm">{m.content}</div>
//                       <div className="text-xs text-muted-foreground mt-2 text-right">
//                         {new Date(m.createdAt).toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </div>
//                     </div>
//                     {m.role === "user" && (
//                       <div className="shrink-0">
//                         <Avatar className="w-9 h-9">
//                           <AvatarFallback>U</AvatarFallback>
//                         </Avatar>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//                 {isStreaming && (
//                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Streaming response...
//                   </div>
//                 )}
//               </div>

//               <form
//                 className="px-6 py-4 border-t flex items-center gap-3"
//                 onSubmit={handleSubmit}
//               >
//                 <Input
//                   placeholder="Write ingredients or a prompt, e.g. 'tomat, lök, olja' or 'vegetarian pasta with tomato and basil'"
//                   value={input}
//                   onChange={(e) => setInput(e.target.value)}
//                   className="flex-1"
//                   disabled={
//                     isStreaming || (cooldownUntil && Date.now() < cooldownUntil)
//                   }
//                 />
//                 <Button
//                   type="submit"
//                   variant="default"
//                   className="flex items-center gap-2"
//                   disabled={
//                     !input.trim() ||
//                     isStreaming ||
//                     (cooldownUntil && Date.now() < cooldownUntil)
//                   }
//                 >
//                   {isStreaming ? (
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                   ) : (
//                     <Send className="w-4 h-4" />
//                   )}
//                   Send
//                 </Button>
//                 {isStreaming ? (
//                   <Button variant="ghost" onClick={handleCancel}>
//                     Cancel
//                   </Button>
//                 ) : (
//                   <Button variant="ghost" onClick={handleClear}>
//                     Clear
//                   </Button>
//                 )}
//               </form>
//             </CardContent>
//           </Card>

//           {error && (
//             <div className="mt-4 text-destructive text-sm">
//               <strong>Error:</strong> {error}
//             </div>
//           )}

//           <div className="mt-4 flex gap-3">
//             <Button
//               onClick={saveLatestAssistant}
//               disabled={isSaving || isStreaming}
//             >
//               <FileText className="w-4 h-4 mr-2" />
//               Save latest result
//             </Button>
//             <Button
//               variant="outline"
//               onClick={() =>
//                 navigator.clipboard?.writeText(
//                   messages.slice(-1)[0]?.content || ""
//                 )
//               }
//             >
//               <List className="w-4 h-4 mr-2" />
//               Copy last
//             </Button>
//           </div>
//         </main>

//         {/* Side panel */}
//         <aside className="lg:col-span-1">
//           <div className="space-y-6">
//             <Card>
//               <CardHeader className="px-4 py-3">
//                 <CardTitle className="text-sm">Tips</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ul className="space-y-2 text-sm text-muted-foreground">
//                   <li>
//                     Be specific with ingredients and preferences (diet, time,
//                     servings).
//                   </li>
//                   <li>Ask for JSON output if you want to import the recipe.</li>
//                   <li>
//                     Try: "Create a 20-minute vegetarian dinner for 2 with
//                     tomato."
//                   </li>
//                 </ul>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="px-4 py-3">
//                 <CardTitle className="text-sm">Recent recipes</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <ScrollArea className="h-48">
//                   <div className="space-y-3">
//                     {recentRecipes.length === 0 && (
//                       <div className="text-sm text-muted-foreground">
//                         No recipes yet.
//                       </div>
//                     )}
//                     {recentRecipes.map((r) => (
//                       <div
//                         key={r.id}
//                         className="flex items-start justify-between gap-3"
//                       >
//                         <div className="flex-1">
//                           <div className="text-sm font-medium">
//                             {r.title || "Untitled"}
//                           </div>
//                           <div className="text-xs text-muted-foreground">
//                             {r.createdAt
//                               ? new Date(r.createdAt).toLocaleDateString()
//                               : ""}
//                           </div>
//                         </div>
//                         <div>
//                           <a
//                             className="text-xs text-primary hover:underline"
//                             href={`/recipes/${r.id}`}
//                             aria-label={`Open ${r.title}`}
//                           >
//                             Open
//                           </a>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader className="px-4 py-3">
//                 <CardTitle className="text-sm">Status</CardTitle>
//               </CardHeader>
//               <CardContent className="text-sm text-muted-foreground">
//                 <div className="flex items-center justify-between">
//                   <span>Streaming</span>
//                   <span>
//                     {isStreaming ? (
//                       <Badge>Active</Badge>
//                     ) : (
//                       <Badge variant="outline">Idle</Badge>
//                     )}
//                   </span>
//                 </div>
//                 <div className="mt-3 flex items-center justify-between">
//                   <span>Requests cooldown</span>
//                   <span>
//                     {cooldownUntil && Date.now() < cooldownUntil
//                       ? `${Math.ceil((cooldownUntil - Date.now()) / 1000)}s`
//                       : "Ready"}
//                   </span>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// }
