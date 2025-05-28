using Amazon.SimpleEmail;
using Amazon.SimpleEmail.Model;
using Moq;
using TaskMonk.Services;
using Xunit;

namespace TaskMonk.Tests.Services
{
    public class EmailServiceTests
    {
        private readonly Mock<IAmazonSimpleEmailService> _mockSesClient;
        private readonly EmailService _emailService;
        private readonly string _testSenderEmail = "test@taskmonk.com";

        public EmailServiceTests()
        {
            _mockSesClient = new Mock<IAmazonSimpleEmailService>();
            _emailService = new EmailService(_mockSesClient.Object, _testSenderEmail);
        }

        [Fact]
        public async Task SendEmailAsync_ValidParameters_ReturnsTrue()
        {
            // Arrange
            string recipient = "recipient@example.com";
            string subject = "Test Subject";
            string htmlBody = "<p>Test HTML Body</p>";
            string textBody = "Test Text Body";

            _mockSesClient
                .Setup(m => m.SendEmailAsync(It.IsAny<SendEmailRequest>(), default))
                .ReturnsAsync(new SendEmailResponse());

            // Act
            var result = await _emailService.SendEmailAsync(recipient, subject, htmlBody, textBody);

            // Assert
            Assert.True(result);
            _mockSesClient.Verify(
                m => m.SendEmailAsync(
                    It.Is<SendEmailRequest>(req =>
                        req.Source == _testSenderEmail &&
                        req.Destination.ToAddresses.Contains(recipient) &&
                        req.Message.Subject.Data == subject &&
                        req.Message.Body.Html.Data == htmlBody &&
                        req.Message.Body.Text.Data == textBody
                    ),
                    default
                ),
                Times.Once
            );
        }

        [Fact]
        public async Task SendTaskAssignmentNotificationAsync_ValidParameters_CallsSendEmail()
        {
            // Arrange
            string recipientEmail = "recipient@example.com";
            string taskTitle = "Test Task";
            string taskId = "task-123";
            string assignedByName = "Test User";

            _mockSesClient
                .Setup(m => m.SendEmailAsync(It.IsAny<SendEmailRequest>(), default))
                .ReturnsAsync(new SendEmailResponse());

            // Act
            await _emailService.SendTaskAssignmentNotificationAsync(recipientEmail, taskTitle, taskId, assignedByName);

            // Assert
            _mockSesClient.Verify(
                m => m.SendEmailAsync(
                    It.Is<SendEmailRequest>(req =>
                        req.Source == _testSenderEmail &&
                        req.Destination.ToAddresses.Contains(recipientEmail) &&
                        req.Message.Subject.Data.Contains(taskTitle) &&
                        req.Message.Body.Html.Data.Contains(taskTitle) &&
                        req.Message.Body.Html.Data.Contains(assignedByName) &&
                        req.Message.Body.Html.Data.Contains(taskId)
                    ),
                    default
                ),
                Times.Once
            );
        }
    }
}