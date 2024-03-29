import { z } from 'zod'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput
} from '@ignite-ui/react'

import { api } from '~/lib/axios'
import { Container, Header } from '../styles'
import {
  IntervalBox,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
  IntervalsContainer,
  FormError
} from './styles'
import { convertTimeStringToMinutes, getWeekDays } from '~/utils'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string()
      })
    )
    .length(7)
    .transform(intervals => intervals.filter(interval => interval.enabled))
    .refine(intervals => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dia da semana.'
    })
    .transform(intervals => {
      return intervals.map(interval => {
        return {
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
          endTimeInMinutes: convertTimeStringToMinutes(interval.endTime)
        }
      })
    })
    .refine(intervals => {
      return intervals.every(
        interval =>
          interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        {
          message:
            'O horário de término deve ser pelo menos uma 1h antes do horário de início.'
        }
      )
    })
})

type TTimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
type TTimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>

export default function TimeIntervals() {
  const {
    control,
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<TTimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' }
      ]
    }
  })

  const router = useRouter()
  const weekDays = getWeekDays()
  const intervals = watch('intervals')

  const { fields } = useFieldArray({
    name: 'intervals',
    control
  })

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TTimeIntervalsFormOutput

    await api.post('/users/time-intervals', {
      intervals
    })

    await router.push('/registro/atualizar-perfil')
  }

  return (
    <>
      <NextSeo title='Selecione sua disponibilidade | Ignite Call' noindex />

      <Container>
        <Header>
          <Heading as='strong'>Quase lá!</Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia
            da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />
        </Header>

        <IntervalBox as='form' onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalsContainer>
            {fields.map((field, index) => (
              <IntervalItem key={field.id}>
                <IntervalDay>
                  <Controller
                    name={`intervals.${index}.enabled`}
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        onCheckedChange={checked => {
                          field.onChange(checked === true)
                        }}
                        checked={field.value}
                      />
                    )}
                  />
                  <Text>{weekDays[field.weekDay]}</Text>
                </IntervalDay>
                <IntervalInputs>
                  <TextInput
                    size='sm'
                    type='time'
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.startTime`)}
                    crossOrigin={undefined}
                  />
                  <TextInput
                    size='sm'
                    type='time'
                    step={60}
                    disabled={intervals[index].enabled === false}
                    {...register(`intervals.${index}.endTime`)}
                    crossOrigin={undefined}
                  />
                </IntervalInputs>
              </IntervalItem>
            ))}
          </IntervalsContainer>

          {errors?.intervals?.root && (
            <FormError size='sm'>{errors.intervals.root.message}</FormError>
          )}

          <Button type='submit' disabled={isSubmitting}>
            Próximo passo <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}
