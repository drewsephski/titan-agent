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

interface ReviewNotificationEmailProps {
  userName: string;
  templateTitle: string;
  templateSlug: string;
  reviewerName: string;
  rating: number;
  reviewTitle: string;
  reviewContent: string;
  templateUrl: string;
}

export const ReviewNotificationEmail = ({
  userName,
  templateTitle,
  templateSlug,
  reviewerName,
  rating,
  reviewTitle,
  reviewContent,
  templateUrl,
}: ReviewNotificationEmailProps) => {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return (
    <Html>
      <Head />
      <Preview>New review for {templateTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={box}>
            <Img
              src="https://titan.ai/goku.svg"
              width="48"
              height="48"
              alt="Titan AI"
            />
            <Heading style={heading}>New Review Received</Heading>
            <Text style={paragraph}>Hi {userName},</Text>
            <Text style={paragraph}>
              Your template "{templateTitle}" received a new review from{" "}
              {reviewerName}.
            </Text>

            <Hr style={hr} />

            <Section style={reviewBox}>
              <Text style={starsStyle}>{stars}</Text>
              <Heading as="h2" style={reviewTitleStyle}>
                {reviewTitle}
              </Heading>
              <Text style={reviewContentStyle}>{reviewContent}</Text>
            </Section>

            <Hr style={hr} />

            <Section style={buttonContainer}>
              <Button style={button} href={templateUrl}>
                View Review
              </Button>
            </Section>

            <Text style={paragraph}>
              Keep up the great work! Reviews help you understand what users
              love about your templates.
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
            You're receiving this email because you created a template on Titan AI.
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

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#484848",
  marginTop: "12px",
};

const reviewBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "24px",
  marginTop: "24px",
};

const starsStyle = {
  fontSize: "20px",
  color: "#fbbf24",
  marginBottom: "8px",
};

const reviewTitleStyle = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginTop: "8px",
  marginBottom: "12px",
};

const reviewContentStyle = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#6b7280",
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

export default ReviewNotificationEmail;
