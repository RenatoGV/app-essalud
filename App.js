import { AppDataProvider } from './src/context/AppDataContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppDataProvider>
      <AppNavigator />
    </AppDataProvider>
  );
}
