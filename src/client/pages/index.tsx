import { Header } from '@/components/Header';
import { Content } from '@/components/Content';
import Head from 'next/head';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <>
      <Head>
        <title>Minecraft config</title>
      </Head>
      <Header />
      <Content>
        <Button>Download</Button>
        <Button secondary>Download</Button>
      </Content>
    </>
  );
}
