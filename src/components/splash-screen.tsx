import { BookOpen, GraduationCap, Cloud, MessageCircle } from 'lucide-react';

const icons = [
  { icon: BookOpen, className: 'top-[15%] left-[10%] w-8 h-8 sm:w-10 sm:h-10 text-primary/70 animate-float', 'data-ai-hint': 'book' },
  { icon: Cloud, className: 'top-[20%] right-[15%] w-10 h-10 sm:w-12 sm:h-12 text-accent/60 animate-float-reverse delay-1000', 'data-ai-hint': 'cloud' },
  { icon: MessageCircle, className: 'bottom-[25%] left-[20%] w-6 h-6 sm:w-8 sm:h-8 text-green-500/70 animate-float delay-500', 'data-ai-hint': 'chat bubble' },
  { icon: GraduationCap, className: 'bottom-[20%] right-[10%] w-12 h-12 sm:w-14 sm:h-14 text-primary/60 animate-float-reverse', 'data-ai-hint': 'graduation cap' },
];

export default function SplashScreen() {
  return (
    <main className="flex items-center justify-center h-screen w-screen bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3498db]/10 via-transparent to-[#2ecc71]/10"></div>
      
      {icons.map((item, index) => {
        const Icon = item.icon;
        return <Icon key={index} className={`absolute ${item.className}`} style={{ animationDuration: `${8 + index * 2}s` }} />;
      })}
      
      <div className="z-10 text-center flex flex-col items-center p-4">
        <div className="flex items-center gap-2 sm:gap-4 animate-fade-in-up">
          <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-primary" />
          <h1 className="font-headline text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter text-foreground">
            APSConnect
          </h1>
        </div>
        <p className="font-body text-base sm:text-lg lg:text-xl text-muted-foreground mt-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          Smart Campus, Smarter You.
        </p>
      </div>
    </main>
  );
}
