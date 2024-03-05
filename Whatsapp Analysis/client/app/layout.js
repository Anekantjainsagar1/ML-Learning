import "./globals.css";
import { Montserrat } from "next/font/google";

const inter = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "Whatsapp Chat Analyzer",
  description: "Whatsapp Chat Analyzer made by Anekant Jain",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
