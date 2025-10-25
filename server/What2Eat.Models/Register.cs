using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace What2Eat.Models
{
    public class Register
    {   
        [Required]
        [EmailAddress]
        [DataType(DataType.EmailAddress)]
        public required string Email { get; set; }
        [Required]
        [StringLength(100, ErrorMessage = "Lösenordet måste vara minst {2} och max {1} tecken långt.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        public required string Password { get; set; }     
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Lösenorden matchar inte.")]
        public required string ConfirmPassword { get; set; }
        [Required]
        public required string FirstName { get; set; } 
        [Required]
        public required string LastName { get; set; }
        public IFormFile? ImgProfile { get; set; }

    }
}
