"use client";

import { Hero } from "@/components/Hero";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}
