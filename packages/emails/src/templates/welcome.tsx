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

interface WelcomeEmailProps {
  name?: string;
  email?: string;
  verificationUrl?: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  name = "there",
  email = "user@example.com",
  verificationUrl = "http://localhost:3001/auth/verify",
  dashboardUrl = "http://localhost:3001/dashboard",
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to Ordo - Let's get you started!</Preview>
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
            <Heading style={heading}>Welcome to Ordo, {name}!</Heading>

            <Text style={paragraph}>
              We're excited to have you on board. Ordo is designed to help you
              manage your tasks, projects, and team collaboration with ease.
            </Text>

            <Text style={paragraph}>
              To get started, please verify your email address by clicking the
              button below:
            </Text>

            <Section style={buttonSection}>
              <Button style={button} href={verificationUrl}>
                Verify Email Address
              </Button>
            </Section>

            <Text style={paragraph}>Once verified, you can:</Text>

            <ul style={list}>
              <li style={listItem}>Create and organize your tasks</li>
              <li style={listItem}>Collaborate with team members</li>
              <li style={listItem}>Track project progress</li>
              <li style={listItem}>Set up automated workflows</li>
            </ul>

            <Text style={paragraph}>
              If you have any questions or need help getting started, don't
              hesitate to reach out to our support team.
            </Text>

            <Hr style={hr} />

            <Section style={footerSection}>
              <Text style={footerText}>
                Best regards,
                <br />
                The Ordo Team
              </Text>

              <Text style={footerLinks}>
                <Link href={dashboardUrl} style={link}>
                  Go to Dashboard
                </Link>
                {" • "}
                <Link href="http://localhost:3001/help" style={link}>
                  Get Help
                </Link>
                {" • "}
                <Link href="http://localhost:3001/contact" style={link}>
                  Contact Support
                </Link>
              </Text>

              <Text style={footerCopyright}>
                © 2024 Ordo. All rights reserved.
              </Text>

              <Text style={footerAddress}>
                This email was sent to {email}. If you didn't create an account
                with Ordo, you can safely ignore this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmail;

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
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const list = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  marginBottom: "16px",
  paddingLeft: "20px",
};

const listItem = {
  marginBottom: "8px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "32px 0",
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
