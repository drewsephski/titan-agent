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

interface CertificationUpdateEmailProps {
  userName: string;
  templateTitle: string;
  templateSlug: string;
  status: "approved" | "rejected" | "in_review";
  badge?: "bronze" | "silver" | "gold" | null;
  reviewNotes?: string | null;
  previewUrl: string;
  adminUrl?: string;
}

export const CertificationUpdateEmail = ({
  userName,
  templateTitle,
  templateSlug,
  status,
  badge,
  reviewNotes,
  previewUrl,
  adminUrl,
}: CertificationUpdateEmailProps) => {
  const statusConfig = {
    approved: {
      subject: `🎉 ${templateTitle} has been certified!`,
      title: "Template Certified",
      message: `Congratulations! Your template "${templateTitle}" has been certified and is now live on the marketplace.`,
      color: "#10b981",
    },
    rejected: {
      subject: `Template Review Update: ${templateTitle}`,
      title: "Certification Review Complete",
      message: `Your template "${templateTitle}" has been reviewed. Unfortunately, it does not meet our certification requirements at this time.`,
      color: "#ef4444",
    },
    in_review: {
      subject: `Template Review Started: ${templateTitle}`,
      title: "Certification Review In Progress",
      message: `Your template "${templateTitle}" is now being reviewed by our certification team.`,
      color: "#f59e0b",
    },
  };

  const config = statusConfig[status];

  return (
    <Html>
      <Head />
      <Preview>{config.subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img
              src="https://titan.ai/goku.svg"
              width="48"
              height="48"
              alt="Titan AI"
            />
            <Heading style={{ ...heading, color: config.color }}>
              {config.title}
            </Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>{config.message}</Text>

            {badge && status === "approved" && (
              <>
                <Hr style={hr} />
                <Text style={paragraph}>
                  <strong>Certification Badge:</strong>{" "}
                  <span style={{ ...badgeStyle, ...badgeColors[badge] }}>
                    {badge.charAt(0).toUpperCase() + badge.slice(1)} Badge
                  </span>
                </Text>
                <Text style={paragraph}>
                  {badge === "gold" &&
                    "Your template has achieved Gold certification, representing the highest quality standards in our marketplace."}
                  {badge === "silver" &&
                    "Your template has achieved Silver certification, representing excellent quality and reliability."}
                  {badge === "bronze" &&
                    "Your template has achieved Bronze certification, meeting all our quality requirements."}
                </Text>
              </>
            )}

            {reviewNotes && (
              <>
                <Hr style={hr} />
                <Heading as="h2" style={subheading}>
                  Review Notes
                </Heading>
                <Text style={reviewNotesStyle}>{reviewNotes}</Text>
              </>
            )}

            <Hr style={hr} />
            <Section style={buttonContainer}>
              <Button style={button} href={previewUrl}>
                View Template
              </Button>
              {adminUrl && (
                <Button style={secondaryButton} href={adminUrl}>
                  Manage Template
                </Button>
              )}
            </Section>

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
            You're receiving this email because you submitted a template to Titan AI.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

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

const badgeStyle = {
  display: "inline-block",
  padding: "4px 12px",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: "600",
};

const badgeColors = {
  bronze: {
    backgroundColor: "#cd7f32",
    color: "#ffffff",
  },
  silver: {
    backgroundColor: "#c0c0c0",
    color: "#000000",
  },
  gold: {
    backgroundColor: "#ffd700",
    color: "#000000",
  },
};

const reviewNotesStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#6b7280",
  backgroundColor: "#f9fafb",
  padding: "16px",
  borderRadius: "6px",
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

export default CertificationUpdateEmail;
