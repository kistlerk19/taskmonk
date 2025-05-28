using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;

namespace TaskMonk.Services
{
    public class EmailService
    {
        private readonly IAmazonSimpleEmailService _sesClient;
        private readonly string _senderEmail;
        
        public EmailService()
        {
            _sesClient = new AmazonSimpleEmailServiceClient();
            _senderEmail = Environment.GetEnvironmentVariable("SENDER_EMAIL") ?? "noreply@taskmonk.com";
        }
        
        public EmailService(IAmazonSimpleEmailService sesClient, string senderEmail)
        {
            _sesClient = sesClient;
            _senderEmail = senderEmail;
        }
        
        public async Task<bool> SendEmailAsync(string recipient, string subject, string htmlBody, string textBody)
        {
            try
            {
                var sendRequest = new SendEmailRequest
                {
                    Source = _senderEmail,
                    Destination = new Destination
                    {
                        ToAddresses = new List<string> { recipient }
                    },
                    Message = new Message
                    {
                        Subject = new Content(subject),
                        Body = new Body
                        {
                            Html = new Content
                            {
                                Charset = "UTF-8",
                                Data = htmlBody
                            },
                            Text = new Content
                            {
                                Charset = "UTF-8",
                                Data = textBody
                            }
                        }
                    }
                };
                
                var response = await _sesClient.SendEmailAsync(sendRequest);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
        
        public async Task SendTaskAssignmentNotificationAsync(string recipientEmail, string taskTitle, string taskId, string assignedByName)
        {
            var subject = $"Task Assigned: {taskTitle}";
            var htmlBody = $@"
                <html>
                <head></head>
                <body>
                    <h1>New Task Assignment</h1>
                    <p>You have been assigned a new task: <strong>{taskTitle}</strong></p>
                    <p>Assigned by: {assignedByName}</p>
                    <p>Click <a href='https://taskmonk.com/tasks/{taskId}'>here</a> to view the task details.</p>
                </body>
                </html>";
                
            var textBody = $@"
                New Task Assignment
                
                You have been assigned a new task: {taskTitle}
                Assigned by: {assignedByName}
                
                View the task at: https://taskmonk.com/tasks/{taskId}";
                
            await SendEmailAsync(recipientEmail, subject, htmlBody, textBody);
        }
        
        public async Task SendTaskDeadlineReminderAsync(string recipientEmail, string taskTitle, string taskId, DateTime deadline)
        {
            var subject = $"Deadline Reminder: {taskTitle}";
            var timeRemaining = deadline - DateTime.UtcNow;
            var daysRemaining = timeRemaining.Days;
            
            var htmlBody = $@"
                <html>
                <head></head>
                <body>
                    <h1>Task Deadline Reminder</h1>
                    <p>Your task <strong>{taskTitle}</strong> is due in {daysRemaining} days.</p>
                    <p>Deadline: {deadline.ToString("yyyy-MM-dd HH:mm")} UTC</p>
                    <p>Click <a href='https://taskmonk.com/tasks/{taskId}'>here</a> to view the task details.</p>
                </body>
                </html>";
                
            var textBody = $@"
                Task Deadline Reminder
                
                Your task {taskTitle} is due in {daysRemaining} days.
                Deadline: {deadline.ToString("yyyy-MM-dd HH:mm")} UTC
                
                View the task at: https://taskmonk.com/tasks/{taskId}";
                
            await SendEmailAsync(recipientEmail, subject, htmlBody, textBody);
        }
        
        public async Task SendTeamInvitationAsync(string recipientEmail, string teamName, string inviterName, string inviteCode)
        {
            var subject = $"Invitation to join {teamName}";
            var htmlBody = $@"
                <html>
                <head></head>
                <body>
                    <h1>Team Invitation</h1>
                    <p>{inviterName} has invited you to join the team: <strong>{teamName}</strong></p>
                    <p>Click <a href='https://taskmonk.com/invites/{inviteCode}'>here</a> to accept the invitation.</p>
                </body>
                </html>";
                
            var textBody = $@"
                Team Invitation
                
                {inviterName} has invited you to join the team: {teamName}
                
                Accept the invitation at: https://taskmonk.com/invites/{inviteCode}";
                
            await SendEmailAsync(recipientEmail, subject, htmlBody, textBody);
        }
    }
}