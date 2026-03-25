import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BillCraft — AI Invoice & Proposal Generator for Indian Freelancers",
  description:
    "Paste your messy project notes → get a professional, GST-compliant invoice or proposal PDF in 60 seconds. Free for 3 documents/month.",
  keywords: [
    "invoice generator",
    "proposal generator",
    "freelancer invoice",
    "GST invoice",
    "AI invoice",
    "Indian freelancer",
    "billing tool",
  ],
  openGraph: {
    title: "BillCraft — AI Invoice & Proposal Generator",
    description:
      "Turn messy project notes into professional invoices and proposals in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
