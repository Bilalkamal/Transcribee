import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p>
                At Transcrib.ee ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our transcription service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <p>We collect and process the following information:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>YouTube video URLs that you provide for transcription</li>
                <li>Generated transcriptions of the provided videos</li>
                <li>Usage data collected through Google Analytics, including:</li>
                <ul className="list-disc pl-6 mb-4">
                  <li>IP addresses (anonymized)</li>
                  <li>Browser type and version</li>
                  <li>Device type and screen size</li>
                  <li>Operating system</li>
                  <li>Page views and navigation patterns</li>
                  <li>Referring websites</li>
                  <li>Time and duration of visits</li>
                </ul>
              </ul>
              <p>
                We use Google Analytics with IP anonymization enabled (known as "IP masking"). 
                This means your IP address is truncated within EU member states before being 
                stored by Google.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Cookies and Tracking</h2>
              <p>
                Our website uses cookies and similar tracking technologies to collect usage data 
                through Google Analytics. These cookies help us understand how you interact with 
                our website, but do not contain any personally identifiable information.
              </p>
              <p className="mt-2">
                Google Analytics uses the following cookies:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>_ga: Used to distinguish users (expires after 2 years)</li>
                <li>_gid: Used to distinguish users (expires after 24 hours)</li>
                <li>_gat: Used to throttle request rate (expires after 1 minute)</li>
              </ul>
              <p>
                You can opt-out of Google Analytics tracking by:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Using the Google Analytics Opt-out Browser Add-on available at: <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline">https://tools.google.com/dlpage/gaoptout</a></li>
                <li>Adjusting your browser's cookie settings</li>
                <li>Using private browsing mode</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
              <p>The information we collect is used exclusively for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Providing transcription services for your YouTube videos</li>
                <li>Improving our service quality and user experience</li>
                <li>Maintaining and optimizing our platform's performance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Data Storage and Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information. Transcriptions are stored securely and are accessible only through your browser session.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Third-Party Services</h2>
              <p>
                Our service utilizes third-party AI services for transcription processing:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>OpenAI's Whisper AI for speech recognition</li>
                <li>Groq for AI processing</li>
              </ul>
              <p>
                These services process data according to their respective privacy policies. We encourage you to review:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li><a href="https://openai.com/privacy" className="text-primary hover:underline">OpenAI's Privacy Policy</a></li>
                <li><a href="https://groq.com/privacy" className="text-primary hover:underline">Groq's Privacy Policy</a></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
              <p>
                Our service is not directed to children under 13. We do not knowingly collect information from children under 13. If you believe we have collected information from a child under 13, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify users of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Your Rights</h2>
              <p>Under various data protection laws, you have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access your data and request information about how it's used</li>
                <li>Request deletion of your data</li>
                <li>Object to the processing of your data</li>
                <li>Opt-out of analytics tracking</li>
                <li>Request correction of inaccurate data</li>
              </ul>
              <p>
                To exercise any of these rights, please contact us at{' '}
                <a href="mailto:privacy@transcrib.ee" className="text-primary hover:underline">
                  privacy@transcrib.ee
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p>
                If you have questions or concerns about this Privacy Policy, please contact us at:{' '}
                <a href="mailto:privacy@transcrib.ee" className="text-primary hover:underline">
                  privacy@transcrib.ee
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 