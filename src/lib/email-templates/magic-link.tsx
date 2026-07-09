import * as React from 'react'
import { Body, Container, Head, Heading, Html, Img, Preview, Section, Text } from '@react-email/components'
import { BRAND, styles } from './_brand'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const MagicLinkEmail = ({ token }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {BRAND.shopName} sign-in code</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={BRAND.logo} alt={BRAND.shopName} width={420} style={styles.logo} />
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Your sign-in code</Heading>
          <Text style={styles.text}>
            Enter this 6-digit code on the {BRAND.shopName} sign-in page to continue. The code expires in about an hour and can only be used once.
          </Text>
          <Text style={styles.code}>{token}</Text>
          <Text style={styles.footer}>
            If you didn't request this code, you can safely ignore this email — no one can sign in without it.
          </Text>
        </Section>
        <Section style={styles.footerBar}>
          {BRAND.shopName} · {BRAND.tagline}
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
