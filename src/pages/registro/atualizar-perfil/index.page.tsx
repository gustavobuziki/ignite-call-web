import { z } from 'zod'
import { api } from '~/lib/axios'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { GetServerSideProps } from 'next'
import { ArrowRight } from 'phosphor-react'
import { useSession } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { buildNextAuthOptions } from '~/pages/api/auth/[...nextauth].api'
import {
  Avatar,
  Button,
  Heading,
  MultiStep,
  Text,
  TextArea
} from '@ignite-ui/react'

import { Container, Header } from '../styles'
import { ProfileBox, FormAnnotation } from './styles'

const updateProfileFormSchema = z.object({
  bio: z.string()
})

type TUpdateProfileFormData = z.infer<typeof updateProfileFormSchema>

export default function UpdateProfile() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting }
  } = useForm<TUpdateProfileFormData>({
    resolver: zodResolver(updateProfileFormSchema)
  })

  const router = useRouter()
  const session = useSession()

  async function handleUpdateProfile(data: TUpdateProfileFormData) {
    await api.put('/users/profile', { bio: data.bio })

    await router.push(`/agendar/${session.data?.user.username}`)
  }

  return (
    <>
      <NextSeo title='Atualize seu perfil | Ignite Call' />

      <Container>
        <Header>
          <Heading as='strong'>Bem-vindo ao Ignite Call!</Heading>
          <Text>
            Precisamos de algumas informações para criar seu perfil! Ah, você
            pode editar essas informações depois.
          </Text>

          <MultiStep currentStep={4} size={4} />
        </Header>

        <ProfileBox as='form' onSubmit={handleSubmit(handleUpdateProfile)}>
          <label>
            <Text size='sm'>Foto de perfil</Text>
            <Avatar
              src={session.data?.user.avatar_url}
              alt={session.data?.user.name}
            />
          </label>

          <label>
            <Text size='sm'>Sobre você</Text>
            <TextArea {...register('bio')} />
            <FormAnnotation>
              Fale um pouco sobre você. Isto será exibido em sua página pessoal.
            </FormAnnotation>
          </label>

          <Button type='submit' disabled={isSubmitting}>
            Finalizar <ArrowRight />
          </Button>
        </ProfileBox>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res)
  )

  return {
    props: {
      session
    }
  }
}
