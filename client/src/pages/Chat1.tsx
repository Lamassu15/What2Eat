// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { generateRecipe } from "../api/generate";
// import { useRecipes, type Recipe } from "../context/RecipeContext";

// type Message =
//   | { role: "user"; content: string }
//   | { role: "assistant"; recipe: Recipe };

// export default function ChatPage() {
//   const { addRecipe } = useRecipes();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [loading, setLoading] = useState(false);

//   const sendPrompt = async (prompt: string) => {
//     setMessages((prev) => [...prev, { role: "user", content: prompt }]);
//     setLoading(true);

//     try {
//       const recipe = await generateRecipe({ ingredients: prompt });

//       // Lägg till i context (globala recept-listan)
//       addRecipe(recipe);

//       // Lägg även till i chat-meddelanden
//       setMessages((prev) => [...prev, { role: "assistant", recipe }]);
//     } catch (err: any) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           recipe: {
//             id: -1,
//             title: "Fel",
//             description: `⚠️ Error: ${err.message}`,
//             ingredients: [],
//             instructions: [],
//           },
//         },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const newChat = () => setMessages([]);

//   return (
//     <div className="flex flex-col w-full justify-between">
//       <header className="flex items-center justify-between p-4 border-b">
//         <h1 className="text-xl font-bold">🍳 AI Recipe Chat</h1>
//         <Button onClick={newChat} variant="outline">
//           New Chat
//         </Button>
//       </header>

//       <main className="flex-1 overflow-y-auto p-4">
//         {/* <ChatMessages messages={messages} />
//         {loading && (
//           <p className="text-sm text-gray-500 mt-2">AI genererar recept...</p>
//         )} */}
//       </main>

//       <footer className="p-4 border-t">
//         {/* <ChatInput onSend={sendPrompt} disabled={loading} /> */}
//       </footer>
//     </div>
//   );
// }
