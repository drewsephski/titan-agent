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
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export const PasswordResetEmail = ({
  userName,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Titan AI password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src="https://titan.ai/goku.svg"
            width="48"
            height="48"
            alt="Titan AI"
          />
          <Heading style={heading}>Reset Your Password</Heading>
          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            We received a request to reset your Titan AI password. Click the
            button below to set a new password:
          </Text>

          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>

          <Text style={paragraph}>
            This link will expire in {expiresIn}. If you didn't request a
            password reset, you can safely ignore this email.
          </Text>

          <Text style={paragraph}>
            If the button doesn't work, copy and paste this link into your
            browser:
            <br />
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Text>

          <Text style={paragraph}>
            Need help? Contact us at{" "}
            <Link href="mailto:support@titan.ai" style={link}>
              support@titan.ai
            </Link>
          </Text>
        </Section>
        <Text style={footer}>
          © 2026 Titan AI. All rights reserved.
          <br />
          You're receiving this email because a password reset was requested for
          your account.
        </Text>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const box = {
  padding: "0 48px",
};

const heading = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginTop: "24px",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
  marginTop: "12px",
};

const buttonContainer = {
  marginTop: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};

export default PasswordResetEmail;
