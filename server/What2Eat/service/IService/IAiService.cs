using System;
using What2Eat.Dtos;

namespace What2Eat.service.IService;

public interface IAiService
{
    Task<OpenAiRecipeDto> GenerateRecipeAsync(string ingredients);

}
