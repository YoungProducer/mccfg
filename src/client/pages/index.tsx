import { Header } from '@/components/Header';
import { Content } from '@/components/Content';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>Minecraft config</title>
      </Head>
      <Header />
      <Content></Content>
    </>
  );
}
