import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  name?: string;
  email?: string;
  resetUrl?: string;
  expiresIn?: string;
}

export const PasswordResetEmail = ({
  name = "there",
  email = "user@example.com",
  resetUrl = "http://localhost:3001/reset-password",
  expiresIn = "1 hour",
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your Ordo password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Img
              src="http://localhost:3001/logo.png"
              width="120"
              height="40"
              alt="Ordo"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Heading style={heading}>Reset your password</Heading>

            <Text style={paragraph}>Hi {name},</Text>

            <Text style={paragraph}>
              We received a request to reset the password for your Ordo account
              associated with {email}.
            </Text>

            <Text style={paragraph}>
              Click the button below to reset your password. This link will
              expire in {expiresIn}.
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              If the button doesn't work, you can copy and paste the following
              URL into your browser:
            </Text>

            <Text style={urlText}>
              <Link href={resetUrl} style={urlLink}>
                {resetUrl}
              </Link>
            </Text>

            <Hr style={hr} />

            <Section style={securitySection}>
              <Heading style={securityHeading}>Security Information</Heading>

              <Text style={securityText}>
                • If you didn't request this password reset, you can safely
                ignore this email.
              </Text>

              <Text style={securityText}>
                • Your password won't be changed until you create a new one
                using the link above.
              </Text>

              <Text style={securityText}>
                • This link will expire in {expiresIn} for your security.
              </Text>

              <Text style={securityText}>
                • If you continue to receive unwanted emails, please contact our
                support team.
              </Text>
            </Section>

            <Hr style={hr} />

            <Section style={footerSection}>
              <Text style={footerText}>
                Best regards,
                <br />
                The Ordo Team
              </Text>

              <Text style={footerLinks}>
                <Link href="http://localhost:3001/help" style={link}>
                  Get Help
                </Link>
                {" • "}
                <Link href="http://localhost:3001/contact" style={link}>
                  Contact Support
                </Link>
                {" • "}
                <Link href="http://localhost:3001/security" style={link}>
                  Security Center
                </Link>
              </Text>

              <Text style={footerCopyright}>
                © 2024 Ordo. All rights reserved.
              </Text>

              <Text style={footerAddress}>
                This email was sent to {email}. This is an automated security
                email regarding your Ordo account.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logoSection = {
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "0 40px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
  marginBottom: "24px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#dc2626",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const urlText = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
  backgroundColor: "#f8f9fa",
  padding: "12px",
  borderRadius: "6px",
  wordBreak: "break-all" as const,
};

const urlLink = {
  color: "#0070f3",
  textDecoration: "none",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
};

const securitySection = {
  backgroundColor: "#fff8f0",
  borderRadius: "6px",
  padding: "20px",
  marginBottom: "24px",
};

const securityHeading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#d97706",
  marginBottom: "12px",
  marginTop: "0",
};

const securityText = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#92400e",
  marginBottom: "8px",
};

const footerSection = {
  paddingTop: "24px",
};

const footerText = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
};

const footerLinks = {
  fontSize: "14px",
  color: "#898989",
  textAlign: "center" as const,
  marginBottom: "16px",
};

const footerCopyright = {
  fontSize: "12px",
  color: "#898989",
  textAlign: "center" as const,
  marginBottom: "8px",
};

const footerAddress = {
  fontSize: "12px",
  color: "#898989",
  textAlign: "center" as const,
  lineHeight: "1.4",
};

const link = {
  color: "#0070f3",
  textDecoration: "underline",
};
