import "./globals.css";

export const metadata = {
  title: "FluxBless - Overseas Premium Accessory Store",
  description: "Curated premium accessories reflecting classic Eastern aesthetics. Shop handcrafted bracelets, agate, cinnabar, and white jade accessories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" className="h-full">
      <body className="h-full flex flex-col">{children}</body>
    </html>
  );
}
