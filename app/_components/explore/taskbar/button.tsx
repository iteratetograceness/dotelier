import { cn } from '@/app/utils/classnames'
import { Button, ButtonLink, ButtonLinkProps, ButtonProps } from '../../button'

export const BUTTON_HEIGHT = 38

export function TaskbarButton<IsLink extends boolean = false>(
  props: IsLink extends true ? ButtonLinkProps : ButtonProps
) {
  if (isButtonLink(props)) {
    return (
      <ButtonLink
        {...props}
        className={cn('bg-hover', `h-[${BUTTON_HEIGHT}px]`, props.className)}
      >
        {props.children}
      </ButtonLink>
    )
  }

  return (
    <Button
      {...props}
      className={cn('bg-hover', `h-[${BUTTON_HEIGHT}px]`, props.className)}
    >
      {props.children}
    </Button>
  )
}

function isButtonLink(
  props: ButtonProps | ButtonLinkProps
): props is ButtonLinkProps {
  return 'href' in props && props.href !== undefined
}
