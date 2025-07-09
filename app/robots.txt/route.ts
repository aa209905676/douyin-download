export async function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://douyin-download-xi.vercel.app'}/sitemap.xml`,
    {
      headers: {
        'Content-Type': 'text/plain',
      },
    }
  )
}
