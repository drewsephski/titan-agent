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
  userName: string;
  onboardingUrl: string;
  templatesUrl: string;
}

export const WelcomeEmail = ({
  userName,
  onboardingUrl,
  templatesUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Titan AI - Let's get started!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src="https://titan.ai/goku.svg"
            width="48"
            height="48"
            alt="Titan AI"
          />
          <Heading style={heading}>Welcome to Titan AI!</Heading>
          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            We're thrilled to have you join our community of AI workflow creators
            and enthusiasts. Titan AI is your marketplace for discovering,
            creating, and sharing powerful AI workflow templates.
          </Text>

          <Hr style={hr} />

          <Heading as="h2" style={subheading}>
            What's Next?
          </Heading>

          <Text style={listItem}>
            <strong>1. Browse Templates</strong>
            <br />
            Explore our curated collection of AI workflow templates for support,
            sales, marketing, and more.
          </Text>

          <Text style={listItem}>
            <strong>2. Purchase & Download</strong>
            <br />
            Find templates that match your needs, purchase securely with Stripe,
            and download instantly.
          </Text>

          <Text style={listItem}>
            <strong>3. Create & Share</strong>
            <br />
            Become a creator! Build your own workflows and share them with the
            community.
          </Text>

          <Hr style={hr} />

          <Section style={buttonContainer}>
            <Button style={button} href={templatesUrl}>
              Browse Templates
            </Button>
            <Button style={secondaryButton} href={onboardingUrl}>
              Complete Your Profile
            </Button>
          </Section>

          <Text style={paragraph}>
            Need help getting started? Check out our{" "}
            <Link href="https://titan.ai/docs" style={link}>
              documentation
            </Link>{" "}
            or contact us at{" "}
            <Link href="mailto:support@titan.ai" style={link}>
              support@titan.ai
            </Link>
          </Text>
        </Section>
        <Text style={footer}>
          © 2026 Titan AI. All rights reserved.
          <br />
          You're receiving this email because you signed up for Titan AI.
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

const subheading = {
  fontSize: "18px",
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

const listItem = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
  marginTop: "16px",
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
  marginRight: "12px",
};

const secondaryButton = {
  backgroundColor: "transparent",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  color: "#1a1a1a",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e5e5e5",
  margin: "20px 0",
};

const link = {
  color: "#2563eb",
  textDecoration: "underline",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  textAlign: "center" as const,
  marginTop: "24px",
};

export default WelcomeEmail;
