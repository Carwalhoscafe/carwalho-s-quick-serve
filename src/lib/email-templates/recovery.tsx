import * as React from 'react'
import { Body, Button, Container, Head, Heading, Html, Img, Preview, Section, Text } from '@react-email/components'
import { BRAND, styles } from './_brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  token?: string
}

export const RecoveryEmail = ({ confirmationUrl, token }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {BRAND.shopName}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Img src={BRAND.logo} alt={BRAND.shopName} width={252} style={styles.logo} />
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Reset your password</Heading>
          <Text style={styles.text}>
            We received a request to reset your {BRAND.shopName} password.
          </Text>
          {token && (
            <>
              <Text style={styles.text}>Enter this 6-digit code on the reset page:</Text>
              <Text style={styles.code}>{token}</Text>
              <Text style={styles.footer}>This code expires in 60 minutes.</Text>
            </>
          )}
          <Text style={styles.text}>Or tap the button below:</Text>
          <Button style={styles.button} href={confirmationUrl}>Reset password</Button>
          <Text style={styles.footer}>
            If you didn't request this, you can safely ignore this email. Your password will stay the same.
          </Text>
        </Section>
        <Section style={styles.footerBar}>
          {BRAND.shopName} · {BRAND.tagline}
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
