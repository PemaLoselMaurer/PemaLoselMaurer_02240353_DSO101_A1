import "./globals.css";

export const metadata = {
  title: "Simple Task Manager",
  description: "Next.js frontend for task CRUD API",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
