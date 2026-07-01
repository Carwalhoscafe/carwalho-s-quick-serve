import * as React from 'react'
import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from '@react-email/components'
import { BRAND, styles } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {BRAND.shopName} verification code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={BRAND.logo} alt={BRAND.shopName} width={420} style={styles.logo} />
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm it's you</Heading>
          <Text style={styles.text}>Use this code to confirm your identity:</Text>
          <Text style={styles.code}>{token}</Text>
          <Text style={styles.footer}>
            This code will expire shortly. If you didn't request this, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={styles.footerBar}>
          {BRAND.shopName} · {BRAND.tagline}
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
