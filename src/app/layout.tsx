import type { Metadata } from "next";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
// import "./globals.css";
import { Roboto } from 'next/font/google';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme';
import { AntdRegistry } from "@ant-design/nextjs-registry";

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: "Face Attendance",
  description: "A Simple Attendance System with Face Recognition by Marie Glo Generalao",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en" className={roboto.variable}>
       <body style={{margin:0}}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <AntdRegistry>
              {children}
            </AntdRegistry>
          </ThemeProvider>
        </AppRouterCacheProvider>
       </body>
     </html>
   );
 }
