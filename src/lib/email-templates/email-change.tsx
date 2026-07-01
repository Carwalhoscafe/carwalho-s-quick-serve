import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from '@react-email/components'
import { BRAND, styles } from './_brand'

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ oldEmail, newEmail, confirmationUrl }: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {BRAND.shopName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={BRAND.logo} alt={BRAND.shopName} width={420} style={styles.logo} />
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Confirm your email change</Heading>
          <Text style={styles.text}>
            You requested to change the email on your {BRAND.shopName} account from{' '}
            <Link href={`mailto:${oldEmail}`} style={styles.link}>{oldEmail}</Link> to{' '}
            <Link href={`mailto:${newEmail}`} style={styles.link}>{newEmail}</Link>.
          </Text>
          <Button style={styles.button} href={confirmationUrl}>Confirm email change</Button>
          <Text style={styles.footer}>
            If you didn't request this change, please secure your account immediately.
          </Text>
        </Section>
        <Section style={styles.footerBar}>
          {BRAND.shopName} · {BRAND.tagline}
        </Section>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail
