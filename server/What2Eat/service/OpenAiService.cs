using OpenAI.Chat;
using System.Text.Json;
using What2Eat.Dtos;

namespace What2Eat.Services;

public interface IAiService
{
    Task<OpenAiRecipeDto> GenerateRecipeAsync(string ingredients);
}

public class OpenAiService : IAiService
{
    private readonly ChatClient _chatClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public OpenAiService(IConfiguration config)
    {
        var apiKey = config["OpenAI:ApiKey"];
        _chatClient = new ChatClient("gpt-4o-mini", apiKey);

        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    public async Task<OpenAiRecipeDto> GenerateRecipeAsync(string ingredients)
    {
        var prompt = $@"
        Create a recipe in strict JSON format with these ingredients: {ingredients}.
        Schema:
        {{
            ""title"": string,
            ""description"": string,
            ""preparationTime"": string,
            ""cookingTime"": string,
            ""servings"": number,
            ""category"": string,
            ""ingredients"": [ {{ ""name"": string, ""quantity"": string, ""unit"": string }} ],
            ""instructions"": [ {{ ""stepNumber"": number, ""description"": string }} ]
        }}";

        var response = await _chatClient.CompleteChatAsync(
        [
            new SystemChatMessage("You are a recipe generator. Respond ONLY with valid JSON, no markdown, no explanations."),
            new UserChatMessage(prompt)
        ]);

        var raw = response.Value.Content[0].Text;
        var json = SanitizeJson(raw);

        try
        {
            using var doc = JsonDocument.Parse(json); // validerar JSON

            var dto = JsonSerializer.Deserialize<OpenAiRecipeDto>(json, _jsonOptions)
            ?? throw new InvalidOperationException("Failed to parse AI response.");

            return dto;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"AI returned invalid JSON: {ex.Message}\nRaw output:\n{raw}"
            );
        }
    }

    private string SanitizeJson(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
            throw new InvalidOperationException("AI returned empty response.");

        raw = raw.Trim();

        // Ta bort markdown ```json ... ```
        if (raw.StartsWith("```"))
        {
            raw = raw.Trim('`'); // ta bort backticks

            if (raw.StartsWith("json", StringComparison.OrdinalIgnoreCase))
                raw = raw.Substring(4).Trim();
        }

        return raw;
    }
}
