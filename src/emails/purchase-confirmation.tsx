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

interface PurchaseConfirmationEmailProps {
  userName: string;
  templateTitle: string;
  templateSlug: string;
  price: string;
  licenseKey: string;
  purchaseDate: string;
  downloadUrl: string;
  previewUrl: string;
}

export const PurchaseConfirmationEmail = ({
  userName,
  templateTitle,
  templateSlug,
  price,
  licenseKey,
  purchaseDate,
  downloadUrl,
  previewUrl,
}: PurchaseConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Thank you for purchasing {templateTitle}!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img
            src="https://titan.ai/goku.svg"
            width="48"
            height="48"
            alt="Titan AI"
          />
          <Heading style={heading}>Purchase Confirmation</Heading>
          <Text style={paragraph}>Hi {userName},</Text>
          <Text style={paragraph}>
            Thank you for your purchase! Your workflow template is ready for download.
          </Text>
          <Hr style={hr} />
          <Heading as="h2" style={subheading}>
            Order Details
          </Heading>
          <Text style={paragraph}>
            <strong>Template:</strong> {templateTitle}
            <br />
            <strong>Price:</strong> {price}
            <br />
            <strong>Purchase Date:</strong> {purchaseDate}
            <br />
            <strong>License Key:</strong> <code style={code}>{licenseKey}</code>
          </Text>
          <Hr style={hr} />
          <Section style={buttonContainer}>
            <Button style={button} href={downloadUrl}>
              Download Template
            </Button>
            <Button style={secondaryButton} href={previewUrl}>
              View Template
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={paragraph}>
            Your license key is required when importing the workflow. Please keep it safe.
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
          You're receiving this email because you made a purchase on Titan AI.
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

const code = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  padding: "2px 6px",
  fontFamily: "monospace",
  fontSize: "14px",
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

export default PurchaseConfirmationEmail;
