'use client'

import { Button } from '../button'
import { BaseWindow } from '../window/base'
import { adminLogin } from './action'

export function AdminLogin() {
  return (
    <BaseWindow
      className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50'
      title='login'
    >
      <form action={adminLogin} className='p-2 w-96'>
        <input
          type='password'
          name='password'
          placeholder='Enter admin password'
          className='w-full p-2 border mb-4 outline-none'
        />
        <Button type='submit' className='w-full'>
          Login
        </Button>
      </form>
    </BaseWindow>
  )
}
