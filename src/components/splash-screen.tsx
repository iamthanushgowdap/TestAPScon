import Loader from './loader';

export default function SplashScreen() {
  return (
    <main className="flex items-center justify-center h-screen w-screen bg-background overflow-hidden relative">
      <Loader />
    </main>
  );
}
