import { z } from 'zod'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { ArrowRight } from 'phosphor-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Text, TextInput } from '@ignite-ui/react'

import { Form, FormAnnotation } from './styles'

const claimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa ter pelo menos 3 letras.' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens.'
    })
    .transform(username => username.toLocaleLowerCase())
})

type TClaimUsernameFormData = z.infer<typeof claimUsernameFormSchema>

export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<TClaimUsernameFormData>({
    resolver: zodResolver(claimUsernameFormSchema)
  })

  const router = useRouter()

  async function handleClaimUsername(data: TClaimUsernameFormData) {
    const { username } = data

    await router.push(`/registro?username=${username}`)
  }

  return (
    <>
      <Form as='form' onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size='sm'
          prefix='ignite.com/'
          crossOrigin={undefined}
          placeholder='seu-usuário'
          {...register('username')}
        />
        <Button size='sm' type='submit' disabled={isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>

      <FormAnnotation>
        {errors.username ? (
          <Text size='sm'>{errors.username.message}</Text>
        ) : (
          <Text>Digite o nome do usuário desejado.</Text>
        )}
      </FormAnnotation>
    </>
  )
}
