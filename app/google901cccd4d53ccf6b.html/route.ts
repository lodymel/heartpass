export async function GET() {
  return new Response('google-site-verification: google901cccd4d53ccf6b.html', {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
