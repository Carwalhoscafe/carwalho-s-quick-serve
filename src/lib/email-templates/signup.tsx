import * as React from 'react'
import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND, styles } from './_brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({ siteUrl, recipient, token }: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {BRAND.shopName} verification code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={BRAND.logo} alt={BRAND.shopName} width={252} style={styles.logo} />
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Welcome to {BRAND.shopName}</Heading>
          <Text style={styles.text}>
            Confirm <strong>{recipient}</strong> to start ordering fresh sugarcane juice and tender coconut delivery from{' '}
            <Link href={siteUrl} style={styles.link}><strong>{BRAND.shopName}</strong></Link>.
          </Text>
          <Text style={styles.text}>Enter this 6-digit code on the sign-in page to verify your email:</Text>
          <Text style={styles.code}>{token ?? '------'}</Text>
          <Text style={styles.footer}>This code expires in 60 minutes.</Text>
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

