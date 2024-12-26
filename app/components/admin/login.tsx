'use client'

import { BaseWindow } from '../window/base'
import { adminLogin } from './action'

export function AdminLogin() {
  return (
    <BaseWindow
      className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50'
      title='login'
    >
      <form action={adminLogin} className='bg-white p-8 w-96'>
        <input
          type='password'
          name='password'
          placeholder='Enter admin password'
          className='w-full p-2 border mb-4'
        />
        <button
          type='submit'
          className='w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          Login
        </button>
      </form>
    </BaseWindow>
  )
}
