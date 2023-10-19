import { z } from 'zod'
import { NextSeo } from 'next-seo'
import { useEffect } from 'react'
import { AxiosError } from 'axios'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { ArrowRight } from 'phosphor-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'

import { api } from '~/lib/axios'
import { Container, Form, FormError, Header } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa ter pelo menos 3 letras.' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens.'
    })
    .transform(username => username.toLocaleLowerCase()),
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter pelo menos 3 letras.' })
})

type TRegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TRegisterFormData>({ resolver: zodResolver(registerFormSchema) })

  const router = useRouter()

  async function handleRegister(data: TRegisterFormData) {
    try {
      await api.post('/users', {
        name: data.name,
        username: data.username
      })

      await router.push('/registro/conectar-calendario')
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.message) {
        alert(error.response?.data.message)
      }
    }
  }

  useEffect(() => {
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])

  return (
    <>
      <NextSeo title='Crie uma conta | Ignite Call' />

      <Container>
        <Header>
          <Heading as='strong'>Bem-vindo ao Ignite Call!</Heading>
          <Text>
            Precisamos de algumas informações para criar seu perfil! Ah, você
            pode editar essas informações depois.
          </Text>

          <MultiStep currentStep={1} size={4} />
        </Header>

        <Form as='form' onSubmit={handleSubmit(handleRegister)}>
          <label>
            <Text size='sm'>Nome de usuário</Text>
            <TextInput
              prefix='ignite.com/'
              crossOrigin={undefined}
              placeholder='seu-usuário'
              {...register('username')}
            />
            {errors.username && (
              <FormError size='sm'>{errors.username.message}</FormError>
            )}
          </label>

          <label>
            <Text size='sm'>Nome completo</Text>
            <TextInput
              placeholder='Seu nome'
              crossOrigin={undefined}
              {...register('name')}
            />
            {errors.name && (
              <FormError size='sm'>{errors.name.message}</FormError>
            )}
          </label>

          <Button type='submit' disabled={isSubmitting}>
            Próximo passo <ArrowRight />
          </Button>
        </Form>
      </Container>
    </>
  )
}
