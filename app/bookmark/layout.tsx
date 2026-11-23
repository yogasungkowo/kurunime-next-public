import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookmark Saya - Kurunime',
  description: 'Daftar anime dan komik favorit yang disimpan di Kurunime.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookmarkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
