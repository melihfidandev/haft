import { ClothStrip } from "@/components/home/ClothStrip";
import { Details } from "@/components/home/Details";
import { HeavySentence } from "@/components/home/HeavySentence";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Scale } from "@/components/home/Scale";
import { ShopCall } from "@/components/home/ShopCall";
import { TwoTone } from "@/components/home/TwoTone";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <HeavySentence />
      <Scale />
      <ClothStrip />
      <Details />
      <TwoTone />
      <ShopCall />
    </>
  );
}
