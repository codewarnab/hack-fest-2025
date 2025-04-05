import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the eventlanding page first
  return <Redirect href="/reg_form" />;
}
