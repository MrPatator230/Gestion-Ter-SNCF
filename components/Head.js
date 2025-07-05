import Head from 'next/head';

export default function CustomHead() {
  return (
    <Head>
      <title>SNCF Gestion</title>
      <meta name="description" content="Gestion des horaires et services SNCF" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="../favicon.ico" />
      {/* Add any other necessary meta tags or links here */}
    </Head>
  );
}
