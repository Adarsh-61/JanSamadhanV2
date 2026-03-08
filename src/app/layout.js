import "./globals.css";
import ClientLayout from "./client-layout";

export const metadata = {
  title: "JanSamadhan+",
  description: "A fast, open-source platform for submitting and tracking civic issues.",
  keywords: ["complaint", "public", "anonymous", "jansamadhan", "jansamadhanv2", "grievance"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
