import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({ siteUrl, recipient, confirmationUrl }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email for {BRAND.shopName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={BRAND.logo} alt={BRAND.shopName} width={160} style={styles.logo} />
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Welcome to {BRAND.shopName}</Heading>
          <Text style={styles.text}>
            Thanks for signing up at{' '}
            <Link href={siteUrl} style={styles.link}><strong>{BRAND.shopName}</strong></Link>.
            Please confirm <strong>{recipient}</strong> to start ordering fresh sugarcane juice and tender coconut delivery.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>Confirm my email</Button>
          <Text style={styles.footer}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={styles.footerBar}>
          {BRAND.shopName} · {BRAND.tagline}<br />
          Mon–Fri · Order before 10:00 AM for same-day delivery
        </Section>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail
