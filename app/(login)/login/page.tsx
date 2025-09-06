import { Login } from '../login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In',
};

export default function LogInPage() {
  return <Login mode="login" />;
}
