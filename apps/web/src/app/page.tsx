import { AnatomySection } from '@/features/home/components/anatomy-section';
import { AudienceSection } from '@/features/home/components/audience-section';
import { EverythingSection } from '@/features/home/components/everything-section';
import { FaqSection } from '@/features/home/components/faq-section';
import { FinalCta } from '@/features/home/components/final-cta';
import { FreeSection } from '@/features/home/components/free-section';
import { Hero } from '@/features/home/components/hero';
import { MethodologySection } from '@/features/home/components/methodology-section';
import { ModuleWheel } from '@/features/home/components/module-wheel';
import { NoMagicSection } from '@/features/home/components/no-magic-section';
import { ToolSprawl } from '@/features/home/components/tool-sprawl';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ToolSprawl />
      <EverythingSection />
      <FreeSection />
      <AnatomySection />
      <MethodologySection />
      <NoMagicSection />
      <ModuleWheel />
      <AudienceSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}
