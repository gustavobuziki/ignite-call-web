import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { signIn, useSession } from 'next-auth/react'
import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'

import { Container, Header } from '../styles'
import { AuthError, ConnectBox, ConnectItem } from './styles'

export default function ConnectCalendar() {
  const session = useSession()
  const router = useRouter()

  const hasAuthError = !!router.query.erro

  async function handleSignIn() {
    await signIn('google')
  }

  return (
    <Container>
      <Header>
        <Heading as='strong'>Conecte sua agenda!</Heading>
        <Text>
          Conecte seu calendário para verificar automaticamente as horas
          ocupadas e os novos aventos á medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={2} />
      </Header>

      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>
          <Button variant='secondary' size='md' onClick={handleSignIn}>
            {session.status === 'authenticated' ? 'Trocar conta ' : 'Conectar'}
            <ArrowRight />
          </Button>
        </ConnectItem>

        {hasAuthError && (
          <AuthError size='sm'>
            Falha ao se conectar ao Google, verifique se você habilitou as
            permissões de acesso ao Google Calendar.
          </AuthError>
        )}

        <Button type='submit' disabled={session.status !== 'authenticated'}>
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  )
}
