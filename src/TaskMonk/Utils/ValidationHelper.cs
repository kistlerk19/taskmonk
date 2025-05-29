using System.Text.RegularExpressions;

namespace TaskMonk.Utils
{
    public static class ValidationHelper
    {
        public static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;
                
            try
            {
                // Simple regex for email validation
                var regex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
                return regex.IsMatch(email);
            }
            catch
            {
                return false;
            }
        }
        
        public static bool IsValidName(string name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.Length >= 2 && name.Length <= 50;
        }
        
        public static bool IsValidTaskTitle(string title)
        {
            return !string.IsNullOrWhiteSpace(title) && title.Length >= 3 && title.Length <= 100;
        }
        
        public static bool IsValidTaskDescription(string description)
        {
            return description == null || description.Length <= 1000;
        }
        
        public static bool IsValidTeamName(string name)
        {
            return !string.IsNullOrWhiteSpace(name) && name.Length >= 3 && name.Length <= 50;
        }
        
        public static bool IsValidTeamDescription(string description)
        {
            return description == null || description.Length <= 500;
        }
        
        public static bool IsValidCommentContent(string content)
        {
            return !string.IsNullOrWhiteSpace(content) && content.Length <= 1000;
        }
        
        public static bool IsValidDeadline(DateTime? deadline)
        {
            if (!deadline.HasValue)
                return true;
                
            return deadline.Value > DateTime.UtcNow;
        }
    }
}