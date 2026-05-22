package com.quickbite.service;

import org.springframework.stereotype.Service;

@Service
public class EmailTemplateService {

    public String generateLoginEmail(String userName, String userRole, String loginTime) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .info-box { background: white; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0; border-radius: 5px; }
                        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍔 QuickBite</h1>
                            <h2>Login Successful</h2>
                        </div>
                        <div class="content">
                            <p>Hello <strong>%s</strong>,</p>
                            <p>You have successfully logged into your QuickBite account.</p>
                            
                            <div class="info-box">
                                <p><strong>Login Details:</strong></p>
                                <p>👤 Role: <strong>%s</strong></p>
                                <p>🕐 Time: <strong>%s</strong></p>
                            </div>
                            
                            <p>If this wasn't you, please secure your account immediately by changing your password.</p>
                            
                            <a href="http://localhost:5173" class="button">Go to Dashboard</a>
                            
                            <div class="footer">
                                <p>Thank you for using QuickBite!</p>
                                <p>© 2026 QuickBite. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(userName, userRole, loginTime);
    }

    public String generateSignupEmail(String userName, String userRole) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .welcome-box { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .feature { display: inline-block; margin: 10px 20px; text-align: center; }
                        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                        .button { display: inline-block; padding: 12px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍔 Welcome to QuickBite!</h1>
                        </div>
                        <div class="content">
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Welcome to QuickBite! Your account has been created successfully.</p>
                            
                            <div class="welcome-box">
                                <h3>🎉 Account Created!</h3>
                                <p>Role: <strong>%s</strong></p>
                                <p>You can now start exploring delicious food from restaurants near you.</p>
                            </div>
                            
                            <div style="margin: 30px 0;">
                                <div class="feature">
                                    <h4>🍕 Browse Menus</h4>
                                    <p>Explore diverse cuisines</p>
                                </div>
                                <div class="feature">
                                    <h4>🚀 Fast Delivery</h4>
                                    <p>Track your orders live</p>
                                </div>
                                <div class="feature">
                                    <h4>💳 Easy Payment</h4>
                                    <p>Multiple payment options</p>
                                </div>
                            </div>
                            
                            <a href="http://localhost:5173" class="button">Start Ordering</a>
                            
                            <div class="footer">
                                <p>Thank you for joining QuickBite!</p>
                                <p>© 2026 QuickBite. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(userName, userRole);
    }

    public String generatePasswordResetEmail(String userEmail, String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f97316 0%%, #ea580c 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .info-box { background: white; padding: 20px; border-left: 4px solid #f97316; margin: 20px 0; border-radius: 5px; }
                        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
                        .button { display: inline-block; padding: 14px 36px; background: #f97316; color: white !important; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🍔 QuickBite</h1>
                            <h2>Password Reset Request</h2>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>We received a request to reset the password for your QuickBite account associated with <strong>%s</strong>.</p>
                            <div class="info-box">
                                <p>Click the button below to set a new password. This link is valid for <strong>30 minutes</strong>.</p>
                            </div>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" class="button">Reset My Password</a>
                            </div>
                            <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
                            <div class="footer">
                                <p>© 2026 QuickBite. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(userEmail, resetLink);
    }

    public String generateAdminNotificationEmail(String eventType, String userName, String userEmail, String userRole, String timestamp) {
        String action = eventType.equals("USER_LOGIN") ? "logged in" : "signed up";
        String emoji = eventType.equals("USER_LOGIN") ? "🔐" : "👤";
        
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #1f2937; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                        .info-table { width: 100%%; background: white; border-radius: 5px; overflow: hidden; margin: 20px 0; }
                        .info-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                        .info-table td:first-child { font-weight: bold; width: 30%%; background: #f3f4f6; }
                        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>%s QuickBite Admin Notification</h2>
                        </div>
                        <div class="content">
                            <p>A user has %s to QuickBite.</p>
                            
                            <table class="info-table">
                                <tr>
                                    <td>Event Type</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>User Name</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>Email</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>Role</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>Timestamp</td>
                                    <td>%s</td>
                                </tr>
                            </table>
                            
                            <div class="footer">
                                <p>This is an automated notification from QuickBite Admin System</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(emoji, action, eventType, userName, userEmail, userRole, timestamp);
    }
}
